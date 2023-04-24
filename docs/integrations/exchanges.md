> Author: :fontawesome-brands-telegram: [**blacktyg3r**](https://t.me/blacktyg3r) | 
> :material-web: [**BT Labs** :octicons-link-external-16:](https://www.blacktyg3r.com/)

## Motivation
The goal of this section is to help with the integration of our protocol by exchanges.
This document is in construction phase, support is welcome and often updates are expected.

## Before Start
Before explaining more complex concepts please kae sure you are familiar with:

- [Building and running](https://github.com/EpicCash/documentation/wiki/Linux){target=_blank} EPIC Node 
- [Building and running](https://github.com/EpicCash/documentation/wiki/Linux){target=_blank} EPIC Wallet
- [Building and hosting](https://github.com/EpicCash/epicboxnodejs){target=_blank} Epicbox Server
- Confirm you know how to use EPIC Wallet [Foreign](/wallet/foreign/) and [Owner](/wallet/owner/) API
- Web servers, i.e. Nginx
- Domain configurations
- Linux and command line skills

---

## Handling User's Accounts and Wallets
At this stage of our development unfortunately we are not recommending to make separate wallets (or separate 
accounts within the wallet) for each exchange account. Although that would be tempting to do it, this solution 
will not scale well with growing number of users, key points why:

!!! warning "EPIC Wallet Scaling Issues"
    - Each new epic-wallet (or new epic-wallet account) will require separate long-running background 
        process (listener) in order to receive deposits or send withdrawals,
    - Each new epic-wallet instance will require HDD space for configuration files, SQL database and 
        transaction history that will grow with time,
    - Each new epic-wallet instance will require separate ports to receive deposits via HTTP/S
    - epic-wallet binary file can process only one operation at the time, to handle a dozen/hundreds of operations 
        in the same time will require same amount of separate binary files,
    - Creating infrastructure to manage thousands of wallets will require huge amount of resources

    Although we believe to solve scaling issues in the future, it is not the case for now.

!!! success "Recommendation"
    Our recommendation is to run one wallet instance (or few in order to load-balance, cold and hot storage, 
    etc. - depending on i.e. traffic conditions - it is up to your engineers) to receive deposits and use local 
    database to keep track of the account balances.

---

## Deposits Workflow
As you already know EPIC Wallet introduces multiple ways to handle transactions, among all of them the 
`HTTP/S Method` is best for this job, here's why:

!!! success "HTTP/S Method for Deposits"
    Taking in to consideration that exchange have right resources:

    - It is not a problem to host 24/7 running process to listen for incoming transactions
    - It is not a problem to open ports, configure domain, create firewall rules
    - It is a big advantage to have customizable and flexible URL links as wallet address
    - Users will have friendly and easy to use URLs for deposits, i.e. `exchange.com/epiccash/<ACCOUNT_ID>`

This workflow is already tested in production for years, exchanges that are/were using it: 

- [ViteX DEX](https://x.vite.net/index/){target=_blank}
- [Bitmart CEX](https://bitmart.com){target=_blank}

Since the **Epic-Cash** is a privacy focused blockchain with no transparent ledger, wallet addresses, visible balances or 
transaction history it is crucial to design a system to monitor incoming deposits and credit them to the right 
accounts. Below key points of our recommendation how to credit deposit to the right account using web server like Nginx
and wallet web API:

!!! success "Recommendation"
    - Each exchange account should generate unique deposit URL link for the user
    - URL should have static part i.e. `exchange.com/epiccash/` and unique part like account ID or username, 
        i.e. `<ACCOUNT_ID>`
    - The static part of the link should point to the working epic-wallet HTTP/S listener
    - Using the web server like nginx you can setup to catch all incoming requests with pattern 
        `exchange.com/epiccash/*` and redirect them to your running listener (by default `localhost:3415`)
    - User using his unique link will call your epic-wallet endpoint and send a JSON payload
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
    - From the headers you can parse the unique account ID (part of the URL)
    - From the JSON payload you can parse the transaction id
    - Using transaction id from the received JSON payload you can query wallet database to find it
    - ??? example "Example: Find Wallet Transaction by UUID"
        === "via CLI"
            ```bash
            epic-wallet txs -t 64da15cc-be9d-440e-8788-b8d396d44c36
            ```
        === "via Owner API"
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
    -  If transaction status is confirmed you can credit the coins to the account matching the ID from the headers

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