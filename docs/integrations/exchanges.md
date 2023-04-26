> Author: :fontawesome-brands-telegram: [**blacktyg3r**](https://t.me/blacktyg3r) | 
> :material-web: [**BT Labs** :octicons-link-external-16:](https://www.blacktyg3r.com/)

## Motivation
The goal of this section is to help with the integration of our protocol by exchanges.
This document is in construction phase, support is welcome and often updates are expected.

## Before Start
Please familiarize yourself with the following before proceeding:

- [Building and running](https://github.com/EpicCash/documentation/wiki/Linux){target=_blank} EPIC Node 
- [Building and running](https://github.com/EpicCash/documentation/wiki/Linux){target=_blank} EPIC Wallet
- [Building and hosting](https://github.com/EpicCash/epicboxnodejs){target=_blank} Epicbox Server
- Using EPIC Wallet [Foreign](/wallet/foreign/) and [Owner](/wallet/owner/) API
- Web servers, i.e. Nginx
- Domain configurations
- Linux and command line skills

---

## Handling User's Accounts and Wallets
At this stage of our development, we do not recommend making separate wallets (or separate accounts within the wallet) 
for each exchange account. Although that would be tempting to do, this solution will not scale well with growing 
number of users. Key points why:

!!! warning "EPIC Wallet Scaling Issues"
    - Each new wallet (or new wallet account) will require separate long-running background 
        process (listener) in order to receive deposits or send withdrawals,
    - Each new wallet instance will require HDD space for configuration files, SQL database and 
        transaction history that will grow with time,
    - Each new wallet instance will require separate ports to receive deposits via HTTP/S,
    - Wallet binary file can process only one operation at the time, to handle a dozen/hundreds of operations 
        in the same time will require same amount of separate binary files,
    - Creating infrastructure to manage thousands of wallets will require huge amount of resources

    Although we believe to solve scaling issues in the future, it is not the case for now.

!!! success "Recommendation"
    Our recommendation is to run one wallet instance (or few in order to load-balance, cold and hot storage, 
    etc. - depending on i.e. traffic conditions - it is up to your engineers) to receive deposits and use local 
    database to keep track of the account balances.

---

## Deposits Workflow
EPIC Wallet introduces multiple ways to handle transactions, `HTTP/S Method` is considered by our team as 
best for this job, here's why:

!!! success "HTTP/S Method for Deposits"
    Taking in to consideration that exchange have right resources:

    - It is not a problem to host 24/7 running process to listen for incoming transactions
    - It is not a problem to open ports, configure domain, create firewall rules
    - It is a big advantage to have customizable and flexible URL links as wallet address
    - Users will have friendly and easy to use URLs for deposits, i.e. `exchange.com/epiccash/<ACCOUNT_ID>`
    - Does not require any extra steps, i.e. uploading/downloading transaction files 
    - Incoming transaction data is a POST request with JSON payload, easy to process
    - It takes a few seconds to finish the transaction

This workflow is already tested in production for years, exchanges that are/were using it: 

- [ViteX DEX](https://x.vite.net/index/){target=_blank}
- [Bitmart CEX](https://bitmart.com){target=_blank}

Since the **Epic-Cash** is a privacy focused blockchain with no transparent ledger, wallet addresses, visible balances or 
transaction history it is crucial to design a system to monitor incoming deposits and credit them to the right 
accounts. Below key points of our recommendation how to approach it using web server like Nginx
and wallet web APIs :

!!! success "Recommendation"
    - Each exchange account should generate unique deposit URL link for the user
    - URL should be made out of:
        - static part i.e. `exchange.com/epiccash/`
        - unique part like account ID or username, i.e. `<ACCOUNT_ID>`
    - URL link should point to the working wallet `HTTP/S listener`
    - Using the web server like nginx you can configure to catch all incoming requests with pattern 
        `exchange.com/epiccash/*` and redirect them to your running listener (by default `localhost:3415`)
    - Sender uses a unique link to call your wallet endpoint and send a JSON payload
    - In the JSON payload you can see all the transaction details:
        - ??? example "Example: Transaction Payload"
            ```json
            {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "receive_tx",
                "params": [
                    {
                        "amount": "100000",
                        "fee": "700000",
                        "height": "1933953",
                        "id": "64da15cc-be9d-440e-8788-b8d396d44c36",
                        "lock_height": "0",
                        "num_participants": 2,
                        "participant_data": [
                            {
                                ....
                            }
                        ],
                        "payment_proof": null,
                        "ttl_cutoff_height": null,
                        "tx": {
                            "body": {
                                "inputs": [
                                    ...
                                ],
                                "kernels": [
                                   ...
                                ],
                                "outputs": [
                                   ....
                                ]
                            },
                            "offset": "8...2e98"
                        },
                        "version_info": {
                            "block_header_version": 6,
                            "orig_version": 3,
                            "version": 3
                        }
                    },
                    null,
                    null
                ]
            }
            ```
    - From the request headers you can parse the unique account ID (part of the URL)
    - From the request JSON payload you can parse the transaction `id` (UUID format)
    - From the request JSON payload you can parse the transaction `height`


Using workflow above you can receive the deposit and collect details needed for next step which is getting 
the transaction status. In order to get updated transaction status you will have to wait for the next block<sup>**1**</sup> to be
mined on the network (on average 1 minute, but this can be anywhere between 1 second and few minutes). 
Using transaction block `height` you can compare it with current blockchain height and when it is
`transaction_height` + 1 you can get the transaction status<sup>**1**</sup> .

---

<sup>**1** With current network traffic 99% of transactions are placed in the very next block, but 
this may change with time, you can rise this number to 2 or 3 blocks.</sup> 

---

!!! note "Get The Transaction Status"
    - Using transaction `id` from the received JSON payload you can query wallet database to find 
        the corresponding record
    - ??? example "Example: Get Wallet Transaction by UUID"
        === "via CLI"
            - Request: 
                ```bash
                epic-wallet txs -t 64da15cc-be9d-440e-8788-b8d396d44c36
                ```
            - Response: 
                ```bash
                Transaction Log - Account 'default' - Block Height: 1934426
                ----------------------------------------------------------------------------------------------------------
                 Id  Type         Shared Transaction Id  Creation Time        TTL   Confirmed?  Confirmation Time    Num.    
                                                                                                                            
                ==========================================================================================================
                 63  Received Tx  64da15cc-...-b8d44c36  2023-04-24 21:28:35  None  true        2023-04-24 21:49:37  0      
                ----------------------------------------------------------------------------------------------------------
    
                Wallet Outputs - Account 'default' - Block Height: 1934426
                ----------------------------------------------------------------------------------------------------------
                 Output Commitment  MMR Index  Block Height  Locked Until  Status   Coinbase?  # Confirms  Value       Tx
                ==========================================================================================================
                 08035a8.....14eb2  None       1933954       0             Unspent  false      473         0.00100000  63
                ----------------------------------------------------------------------------------------------------------
    
                Transaction Messages - Transaction '63'
                ---------------------------------------------------------------------------------------------------------
                 Participant Id  Message  Public Key                   Signature
                =========================================================================================================
                 0                        03ad997bf321db8....2ba6cbbe  3045022100add309e15845...38d06ff1dec74aae
                ---------------------------------------------------------------------------------------------------------
                 1               None     0200b0c60160e....7394a80a24da8f1d83a7464a01  None
                ---------------------------------------------------------------------------------------------------------
                ```
        === "via Owner API"
            - Request: 
                ```json
                {
                    "jsonrpc": "2.0",
                    "method": "retrieve_txs",
                    "params": {
                        "token": "<token_obtained_via_open_wallet>",
                        "refresh_from_node": true,
                        "tx_id": null,
                        "tx_slate_id": "64da15cc-be9d-440e-8788-b8d396d44c36"
                    },
                    "id": 1
                }
                ``` 
            - Response: 
                ```json
                {
                    "amount_credited": "100000", 
                    "amount_debited": "0", 
                    "confirmation_ts": "2023-04-24T21:49:37.640611277Z", 
                    "confirmed": true, 
                    "creation_ts": "2023-04-24T21:28:35.521869348Z", 
                    "fee": null, 
                    "id": 63, 
                    "kernel_excess": "0824aea8c5....e9bde6", 
                    "kernel_lookup_min_height": 1933953,
                    "messages": 
                        {"messages": [
                            {"id": "0", "message": "", "message_sig": "add30...dec74aae", "public_key": "03ad...b0a022"}, 
                            {"id": "1", "message": null, "message_sig": null, "public_key": "020..4a01"}
                        ]}, 
                    "num_inputs": 0, 
                    "num_outputs": 1, 
                    "parent_key_id": "02000..0000", 
                    "payment_proof": null, 
                    "stored_tx": null, 
                    "ttl_cutoff_h eight": null, 
                    "tx_slate_id": "64da15cc-be9d-440e-8788-b8d396d44c36", 
                    "tx_type": "TxReceived"
                }
                ```

!!! info "`id` vs  `tx_slate_id`"
    You can notice 2 different id fields in the transaction data and the wallet history:

    :green_circle: `tx_slate_id` is a `UUID` string that should be used to identify the transactions, 
        it is unique for each transaction.

    :red_circle: `id` is an integer stored in the local wallet database, it is used only as local ID, 
        in most cases you can ignore that field.

    Either of the mentioned id's are stored on the blockchain, the only field that can be quered on 
    the [blockchain explorer](explorer.epic.tech) is the value of the `Output Commitment`, which does not
    help with getting any transaction details, it will only show that given output exists on the blockchain.

!!! success "Successful Deposit"
    Once you can confirm that transaction (deposit) have `confirmed` status updated to `true` you can be 100% certain 
    that deposit was successful, transaction is already on-chain and can not be cancelled or changed. At this point
    balance in your wallet is updated and user's coins are waiting for network confirmations to become spendable. 

    It is up to the sender's wallet to decide how many network confirmations is needed (minimum 1 which on average takes 
    1 minute), hence it is strongly recommend for you to decide on your own how many confirmations you want to wait 
    before updating exchange account balance. We recommend to use at least 3 confirmations, but anything between 
    3-10 is reasonable and safe.

!!! warning "Unsuccessful Deposit"
    If `confrimed` status is not changed to `true` after number of blocks you decided to wait we can assume that 
    transaction wasn't successful (which may happen for multiple reasons, usually caused by poor connection on the 
    client side) and should be cancelled in your wallet. You should also notify user about failed deposit and ask to
    send the coins again.

    ??? example "Example: Cancel The Transaction"
        === "via CLI"
            ```bash
            epic-wallet cancel -t 64da15cc-be9d-440e-8788-b8d396d44c36
            ```
        === "via Owner API"
            ```json
            {
                "jsonrpc": "2.0",
                "method": "cancel_tx",
                "params": {
                    "token": "<token_obtained_via_open_wallet>",
                    "tx_id": null,
                    "tx_slate_id": "64da15cc-be9d-440e-8788-b8d396d44c36"
                },
                "id": 1
            }
            ```

    It is recommended to always cancel not confirmed transactions to keep wallet free from 'ghost' pending balances.


!!! note "Wallet Operations Are Time Consuming"
    Keep in mind that each wallet operation that requires updating data from the EPIC Node (i.e. confirming 
    the transaction status, refreshing balance, etc.) is taking time, and the more outputs and transaction
    are in the wallet the more time it takes. It is recommended to carefully design logic responsible for it, 
    i.e. implement task queue, configure timeouts etc. Also, it is recommended to have own database to keep 
    track of the transactions and clean the wallet history (i.e. cron job) when it's getting heavy to avoid timeouts.

---


## Withdrawals Workflow

!!! warning "Under Construction"

---


[//]: # (!!! success "")

[//]: # (    - Epicbox code is open-source and everyone can host their own server)

[//]: # (    - Entire communication is secured with end-to-end encryption )

[//]: # (    - Encrypted data is stored only for short period of time )

[//]: # (    - To access transaction slate wallet have to prove its ownership)

[//]: # ()
[//]: # (    ![Epicbox Security Scheme]&#40;img.png&#41;)