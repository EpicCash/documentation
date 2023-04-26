> Author: :fontawesome-brands-telegram: [**blacktyg3r**](https://t.me/blacktyg3r) | 
> :material-web: [**BT Labs** :octicons-link-external-16:](https://www.blacktyg3r.com/)

The **Epic-Cash** project is using the **Mimblewimble** protocol which is still a relatively new technology. 
[Interactive transactions](/integrations/#interactive-transactions) are not easy to implement in the production, 
and documentation is still developing. Our Blockchain privacy features will bring more challenges than other projects 
with transparent and public ledgers that are easy to query to get i.e. balances or transaction history by anyone.

This document aims to help developers with the integration process, and should be considered only us guidance. 
To fully understand concepts and terminology it is recommended to read other sections of the 
**EPIC Developers Documentation** and [**Epic-Cash Wiki on GitHub**](https://github.com/EpicCash/documentation/wiki).

---

## Interactive Transactions
The **Epic-Cash Blockchain** does not store any transaction data on the ledger, it uses _Interactive 
Transactions (**NIT**)_, that means exchanging _transaction slates<sup>**1**</sup>_ requires all the 
participants to sign the transaction before posting it to the network. Sender can not finish the transaction 
without the recipient signature, and this introduces need of both wallets being online at some point during 
the process. 

### Overview

!!! info "SRS vs RSR Workflow"
    Transaction can be initialized by both, the sender or the receiver, this gives us two different workflows:

    * **Sender-Receiver-Sender** when transaction is initialized by sender
    * **Receiver-Sender-Receiver** when transaction is initialized by the recipient (like issuing an invoice)

    Wallet that initializes the transaction (1st step) is also responsible for finalization and posting it to 
    the network (3rd step). 

    While **SRS** workflow will be the best choice for most cases, **RSR** can be used i.e. in e-commerce 
    (asking client to pay for the product or service).

Despite different transaction methods that may change the user's experience, 
wallet's back-end will always have to use these functions (also available as API endpoints):

!!! abstract "SRS Workflow:"
    1. [`init_send_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.issue_invoice_tx){target=_blank}
        Used by the sender's wallet to initialize the transaction slate.
    2. [`receive_txs`](https://docs.epic-radar.com/epic_wallet_api/struct.Foreign.html#method.receive_tx){target=_blank}
        Used by the receiver's wallet to process initialized transaction slate, produces response slate.
    3. [`finalize_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.finalize_tx){target=_blank}
        Used by the sender's wallet to finalize the transaction signed by the recipient.
    4. [`post_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.post_tx){target=_blank} 
        Used by the sender's wallet to post final transaction slate to the network.

and

!!! abstract "RSR Workflow:"
    1. [`issue_invoice_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.issue_invoice_tx){target=_blank}
        Used by the receiver's wallet to initialize new invoice payment.
    2. [`process_invoice_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.process_invoice_tx){target=_blank}
        Used by the sender's wallet to processes an invoice transaction created by the recipient.
    3. [`finalize_invoice_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Foreign.html#method.finalize_invoice_tx){target=_blank}
        Used by the receiver's wallet to finalizes an invoice transaction signed by the payer.
    4. [`post_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.post_tx){target=_blank}
        Used by the receiver's wallet to post final transaction slate to the network.
    
    !!! warning "Warning"
        At the moment of writing this document this workflow is considered as experimental and not tested in 
        the production, use with caution.

After successful executing of the `post_tx` function coins are sent to the recipient, until then transaction 
can be canceled by both wallets. **Transaction is considered as finished if and only if status `confirmed` 
in the wallet local database have value `True`.** 

!!! success "Coins are safu, always!"
    One of the big advantages of the NIT's implementation is no risk of losing funds due to mistyped wallet 
    address or connection problems, transaction either appears in the right wallet or nothing happens.

<br />

<sup>**1**. Transaction slate - partial transaction data (i.e. participants details, amounts, used outputs, etc.) 
that is not complete, can not be posted to the network.</sup>
---

### Transaction Slates
To exchange the EPIC coins, users must exchange transaction slates in one form or another. A transaction slate is a blob 
containing the necessary data to be included at each step of the transaction building process. Different transaction 
methods are basically different methods of exchanging slates to improve end-user's experience.


!!! abstract "Explaining Transaction Slates"
    Imagine you want to give to your friend collection of 2 precious gold coins. In order to make that 
    transaction legit for the IRS, you are asked to write down some details, and they gave you a template for it:
    
    === ":material-file-star: Transaction Slate Template"
        ```toml
        Date: 
        Participiants:
            - Sender    : 
            - Recipient : 
        Products:
            - 
            -
        Description: 
        Signatures:
            - Sender    : 
            - Recipient :
            - Coin Dealer :
        ```

    ---

    - Using this template you are asked to write down an initial details:

    === ":material-file-clock: Transaction Slate Round I"
        ```toml
        Date: "2023-04-26"
        Participiants:
            - Sender    : "John Doe"
            - Recipient : 
        Products:
            - "Coin 1"
            - "Coin 2"
        Description: "Gold coins, perfect condition."
        Signatures:
            - Sender      : "<John's Signature>"
            - Recipient   :
            - Coin Dealer :
        ```

    ---

    - Now you need your friend to fill up his part, since he is far from you, you have to use a delivery company 
    to send the document, and it will be a special service to ensure your document is properly secured. Once it 
    will be delivered and processed by your friend it will look like this (assuming friend is happy with the 
    details and is whiling to sign it):
    
    === ":material-file-clock: Transaction Slate Round II"
        ```toml
        Date: "2023-04-26"
        Participiants:
            - Sender    : "John Doe"
            - Recipient : "Steven Clark"
        Products:
            - "Coin 1"
            - "Coin 2"
        Description: "Gold coins, perfect condition."
        Signatures:
            - Sender      : "<John's Signature>"
            - Recipient   : "<Steve's Signature>"
            - Coin Dealer :
        ```

    ---    

    - Now, using the same delivery service, your firend is sending the doc back to you. When it arrives, there is 
    an authorised IRS officer with you to prove the authenticity of the coins, approve document paramaters and 
    put the final signature on it:

    === ":material-file-check: Transaction Slate Round III"
        ```toml
        Date: "2023-04-26"
        Participiants:
            - Sender    : "John Doe"
            - Recipient : "Steven Clark"
        Products:
            - "Coin 1"
            - "Coin 2"
        Description: "Gold coins, perfect condition."
        Signatures:
            - Sender      : "<John's Signature>"
            - Recipient   : "<Steve's Signature>"
            - IRS officer : "<Officer's Signature>"
        ```

    - Our document is now ready to be posted to the IRS office where it will be added
    to their books and your friend will become officialy the owner of the collection.
    
    ---

    Doesn't sound that compolicated, right? Now, let's translate that example to the **Mimblewimble** language:
    
    - **Transaction slate** is like the document we exchange with our friend
    - **JSON payload** is like details in the document, each round adds more details
    - **Transaction method** (i.e. HTTP/S, Epicbox, etc.) is lke the delivery company
    - **Data encryption** is like this special delivery service protecting your parcel
    - **The Blockchain** is like IRS - it makes sure everyone is honest during the transaction and they keep proof 
        of ownership in their books.
    
    <br />

    And the order of the steps above can be transalted to a wallet functions (API calls) as follows:

    - **Round I** is like function [`init_send_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.issue_invoice_tx){target=_blank}
    - **Round II** is like function  [`receive_txs`](https://docs.epic-radar.com/epic_wallet_api/struct.Foreign.html#method.receive_tx){target=_blank}
    - **Round III** is like functions:
        1. [`finalize_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.finalize_tx){target=_blank}
        2. [`post_tx`](https://docs.epic-radar.com/epic_wallet_api/struct.Owner.html#method.post_tx){target=_blank} 

    !!! success "The EPIC Blockchain is Not Like The IRS!"
        Now when we know how this workflow looks like on the transparent and public example, 
        let's outline the key differences compared to secure and private blockchain like **EPIC Mimblewimble**:

        - Participiant's data is not linkable, nor trackable, no addresses or meta-data stored
        - Transaction details are encrypted (sealed) and noone can look inside, only engaged wallets can decrypt the details
        - Signatures are secured by cryptographic functions, not possible to cheat
        - Blockchain keeps data needed to prove ownership of the coins, but does
            not say (or know) who actually owns them, no way to query asset balances by anyone except the owner
---

## Wallet Addresses
> In the Mimblewimble protocol there is no wallet addresses!

With that being said, we do need them in order to make transactions available for the users.

### HTTP/S Addresses
What is not present on the protocol level was built on top of it - this is how HTTP/S Transaction method was 
created, where wallet address is an IP (or domain) of the machine where wallet is running. While for private
users this immediately raises a privacy concerns (sharing the IP address), for commercial use is actually a great 
solution. How exactly `HTTP/S Transaction` method works will be explained later, for now let's outline key points:

!!! success "Pros"
    - Highly customizable URL links working as wallet address
    - Having own custom domain URL to keep brand consistency, i.e. 
        `ExampleShop.com/pay` as payment address 
    - Static and user-friendly addresses instead of long and ugly strings
    - Multiple different URLs pointing to the same wallet
    - Peer2Peer connection between wallets, no intermediate service

!!! failure "Cons"
    - Configuration requires some tech experience 
    - Hosting machine must be reachable for network traffic, i.e. open ports and firewall rules
    - Sender's and receiver's wallet must be running in the same time in order to transact
    - Connection problems may result with need to re-send the transactions

It is clear that this type of addresses are great match for commercial cases like 
exchange deposits, e-commerce payments, branding, etc. Unfortunately in the same time it is complicated for 
standard users without tech experience - this is why we had to introduce something more user-friendly.

### Epicbox Addresses
Epicbox is not just an address, it is completely new transaction workflow with multiple benefits focused
primarily on creating smooth experience for the end-users. Stealth-like, not queryable and static wallet 
addresses used to exchange transaction slates with similar to other cryptocurrency projects fashion:

!!! success "Pros"
    - Highly private and secure with almost no meta-data leak during the transaction process
    - No extra configuration or tech experience needed, working out of the box
    - No need for both wallets to be online at the same time
    - Mobile wallet friendly

!!! failure "Cons"
    - Not customizable and not as user-friendly as HTTP/S addresses
    - Requires intermediate service to store pending transactions

It seems like the biggest tradeoff in this case is the requirement of intermediate service handling communication 
between the wallets, but why this should not raise any concerns will be explained in the next sections.

### TOR Addresses
For those who value privacy we have also integrated anonymous communication between the wallets over 
TOR routing protocol. 

!!! note "Using TOR"
    Taking into consideration legal problems with using TOR it is very unlikely for someone to use this 
    workflow in production for now (it is planned to eventually update that section though).

---

## Transaction Methods
**EPIC Wallet** supports multiple (five at the moment) transaction methods. Let's briefly look at all of them:

<br />

#### HTTP/S 
To use this method receiver have to run `HTTP/S Listener`, share the URL address (IP or domain) pointing to 
it and make sure it is reachable for others outside the LAN network, i.e. port (by default 3415) is open and 
firewall rule created.

Transaction will be successfully finished if and only if both parties are online during the entire process which 
should take no longer than few seconds. Failed transaction can be cancelled by sender to unlock locked funds.

- How to send with HTTP/S: [**Wallet CLI Documentation **](/wallet/cli/#send)

---

#### Epicbox
To use this method both sender and receiver have to run `Epicbox listener`.

Epicbox server will work as temporary storage to make it possible to transact without the need of both parties 
being online at the same time. It will also remove the need of sharing receivers IP address and handling the ports.

- How to send with Epicbox: [**Wallet CLI Documentation **](/wallet/cli/#send)

---

#### TOR
To use this method receiver have to run HTTP/S Listener and share the TOR address.

Transaction will be successfully finished if and only if both parties are online during the process which 
should take less than a minute. Failed transaction can be cancelled by sender to unlock locked funds.

- How to send with TOR: [**Wallet CLI Documentation **](/wallet/cli/#send)

---

#### Transaction Files
This method requires to do all 3 steps manually giving the user a lot of flexibility how to do it, i.e.
via e-mail, messengers, USB drives, Bluetooth, etc. Transaction slates are saved as text files, users have to 
exchange them between each other until all the details are completed and final file is ready to post to the network. 

- How to send with Transaction Files: [**Epic-Cash GitHub**](https://github.com/EpicCash/documentation/wiki/Epic-wallet#using-transaction-files){target=_blank}

---

#### Emojis Strings
Very similar to the transaction files method except in this case instead of files we use emojis strings.

!!! example "Example Emojis Transaction Slate"
    🥉🎨📏🤛🪞🥼💸🤎🚟🧞📷😶🪒🈶🍚  [....] 🦨📵📭😡🦦🤞🐉🦷🦏 🐪💾

- How to send with Emojis: [**Epic-Cash GitHub**](https://github.com/EpicCash/documentation/wiki/Epic-wallet#using-emojis-from-332-forward){target=_blank}

---

