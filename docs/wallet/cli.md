## File Structure

When wallet is initialized for the first time by default, it will create the hidden directory `/.epic` 
under your home directory (Linux: `/home/<user>/.epic/main/`, Windows: `C:/Users/<username>/.epic`).

The Wallet maintains its state in `SQLITE` database, with the master seed 
stored in a separate file. When creating a new wallet, the file structure should be as follows:

```
/home/<user>/.epic/main/
    ├── epic-wallet.log
    ├── epic-wallet.toml
    ├── tor
    └── wallet_data
        ├── wallet.seed
        ├── saved_txs
        └── db
            └── sqlite
                ├── epic.db
                ├── epic.db-shm
                └── epic.db-wal
```

* `wallet.seed` file stores wallet master key encrypted with your password.
* `tor`  directory with TOR configuration used for TOR transaction method.

---

## Wallet Settings

* `epic-wallet.toml` is a configuration file for the wallet, default values are generated when wallet is initialized.

??? note "Wallet Section"

    > **[wallet]** section used to configure default wallet settings:

    ```toml
    chain_type = "Mainnet"
    
    #host IP for wallet listener, change to "0.0.0.0" to receive epics
    api_listen_interface = "127.0.0.1"
    
    #path of TLS certificate file, self-signed certificates are not supported
    #tls_certificate_file = ""
    #private key for the TLS certificate
    #tls_certificate_key = ""
    
    #port for wallet listener
    api_listen_port = 3415
    
    #port for wallet owner api
    owner_api_listen_port = 3420
    
    #path of the secret token used by the API to authenticate the calls
    #comment it to disable basic auth
    api_secret_path = "/home/<user>/.epic/main/.owner_api_secret"
    
    #location of the node api secret for basic auth on the Epic API
    node_api_secret_path = "/home/<user>/.epic/main/.api_secret"
    
    #where the wallet should find a running node
    check_node_api_http_addr = "https://epic-radar.com/node"
    
    #include the foreign API endpoints on the same port as the owner
    #API. Useful for networking environments like AWS ECS that make
    #it difficult to access multiple ports on a single service.
    owner_api_include_foreign = false
    
    #where to find wallet files (seed, data, etc)
    data_file_dir = "/home/<user>/.epic/main/wallet_data"
    
    #If true, don't store calculated commits in the database
    #better privacy, but at a performance cost of having to
    #re-calculate commits every time they're used
    no_commit_cache = false
    
    #Whether to use the black background color scheme for command line
    dark_background_color_scheme = true
    
    #The exploding lifetime for keybase notification on coins received.
    #Unit: Minute. Default value 1440 minutes for one day.
    #Refer to https://keybase.io/blog/keybase-exploding-messages for detail.
    #To disable this notification, set it as 0.
    keybase_notify_ttl = 1440
    ```

??? note "Epicbox Section"

    > **[epicbox]** section used to configure epicbox transaction method:

    ```toml
    # Domain of the epicbox server to connect to
    epicbox_domain = "epicbox.giverofepic.com"
    
    # Port of the domain of the epicbox server to connect
    epicbox_port = 443
    
    # Whether to allow unsecure connections without SSL (default false)
    epicbox_protocol_unsecure = false
    
    # Index of the epicbox address (default 0)
    epicbox_address_index = 0
    
    # Time interval in seconds between epicbox listener updates (default 10 seconds)
    epicbox_listener_interval = 10
    ```

??? note "Tor Section"

    > **[tor]** section used to configure values when sending or listening via TOR:

    ```toml
    # Whether to start tor listener on listener startup (default true)
    use_tor_listener = true
    
    # TOR (SOCKS) proxy server address
    socks_proxy_addr = "127.0.0.1:59050"
    
    # Directory to output TOR configuration to when sending
    send_config_dir = "/home/<user>/.epic/main/"
    ```

??? note "Logging Section"

    > **[logging]** section used to configure logging parameters:

    ```toml
    #whether to log to stdout
    log_to_stdout = true
    
    #log level for stdout: Error, Warning, Info, Debug, Trace
    stdout_log_level = "Debug"
    
    #whether to log to a file
    log_to_file = true
    
    #log level for file: Error, Warning, Info, Debug, Trace
    file_log_level = "Info"
    
    #log file path
    log_file_path = "/home/<user>/.epic/main/epic-wallet.log"
    
    #whether to append to the log file (true), or replace it on every run (false)
    log_file_append = true
    
    #maximum log file size in bytes before performing log rotation
    #comment it to disable log rotation
    log_max_size = 16777216
    log_max_files = 32
    
    ```

---

## Commands

### `Init`
Create new epic-wallet instance with configuration files:

```
epic-wallet init
```

You'll be prompted to enter a password for the new wallet. It will be used to encrypt your private key,
and you'll be asked to type it for most wallet commands.

If you'd like to create a wallet in a directory of your choice, 
you can create one in the current directory by using flag `-h`, `--here` e.g:

```
epic-wallet init -h
```

This will create all needed data files, including `epic-wallet.toml` and `wallet.seed`, in the current directory. 
When running any `epic-wallet` command, epic will check the working directory if these files exist. 
If not, it will use the default location.

Upon a successful `init`, the wallet prints a 24-word recovery phrase, **which you should always save somewhere safe**. 
This phrase is to recover your master seed file if it gets lost or corrupted, or if you forget the wallet password.

!!! note ""
    If you'd prefer to use a 12-word recovery phrase, you can use the `-s` `--short_wordlist` flag.

!!! tip "Initialize wallet using mnemonic seed phrase"
    If you need to recreate your wallet from an existing seed, you can `init` a wallet with a recovery phrase using 
    the `-r`, `--recover` flag. For example, the following command initializes a recovered wallet in the current directory.
    
    ```text
    epic-wallet init -hr
    ```
    Wallet will prompt to provide your 24 or 12 word mnemonics.
    On the first run, the wallet will scan the entire chain and restore any outputs that belong to it.
---

### `Info`
The `info` command summarizes wallet account balance.

```
epic-wallet info
```
!!! text "Wallet Summary"
    ```bash
    Wallet Summary Info - Account 'default' as of height 813137
    
    Confirmed Total                  | 5779.473029600
    Awaiting Confirmation (< 10)     | 0.000000000
    Immature Coinbase (< 1440)       | 14.00000000
    Awaiting Finalization            | 139.851133700
    Locked by previous transaction   | 389.859133700
    -------------------------------- | -------------
    Currently Spendable              | 5779.473029600
    ```
!!! info "How to read balance"
    * **Confirmed Total** is your balance including both spendable coins and those awaiting confirmation.
    * **Awaiting Confirmation** denotes the balance from transactions that have appeared on-chain, 
        but for which your wallet is waiting a set number of blocks before treating them as spendable (default is 10 blocks).
    * **Immature Coinbase** will show balance of freshly mined coins, it will take 1440 confirmations 
        (~24h) to mature them and make spendable.
    * **Awaiting Finalization** is the balance from transactions that have not yet appeared on-chain. This could be 
        due to the other party not having broadcast the transaction yet. Also, when you are the sender of a transaction, 
        your change output will be denoted in this field as well.
    * **Locked by previous transaction** shows the amount of coins locked by a previous transaction you have made and 
        that is currently awaiting finalization. This is usually made up both of the amount being sent and of the change 
        outputs waiting to be returned back to your wallet. </br>
        Once the transaction appears on-chain, this balance unlocks and the output that was used will 
        again become available for spending.

### `Listen`
Listener is a long-running background process that listens for incoming transaction slates to process them. 

EPIC transactions are interactive, means both parties have to actively participate during the transaction 
to finish the process, listeners are here to automate the whole process for the user.

There are multiple transaction methods with corresponding listeners to handle them.
Your wallet will listen for requests until the process is cancelled (`<Ctrl-C>`).

=== "HTTP/S + TOR Listener"
    To start listening for transactions sent via HTTP/S or TOR method:
    ```
    epic-wallet listen -m http
    ```
    > Optional arguments:
    ```
    -n, --no_tor        Don't start TOR listener when starting HTTP listener
    -V, --version       Prints version information
    -l, --port <port>   Port on which to run the wallet listener
    -e, --external      Listen on 0.0.0.0 interface to allow external connections (default 127.0.0.1)
    ```

    !!! tip "Foreign API"
        Working HTTP/S Listener will also run local `Foreign API`, it will expose some
        of the wallet functionality needed for others to interact with your wallet.
        
        More in the [**Foreign API Methods**](/wallet/foreign) section.

    !!! note ""
        In order to use the TOR make sure its client is available in your system and added to env PATH.
    

=== "Epicbox Listener"
    To start listening for transactions sent via **epicbox** method:
    ```
    epic-wallet listen -m epicbox
    ```
    > Optional arguments:
    ```
    -i, --interval <interval>       Epicbox listener update interval duration in seconds
                                    [possible values: 2, 5, 10, 30, 60, 120]
    -V, --version                   Prints version information
    ```
---

### Web API
Run the wallet's local web API, useful in production to interact with the wallet interface via HTTP API calls.

Same as [Listeners](/wallet/cli/#listen), it is a background process accessible on the local network (by default port `3420`).
 
* Go to the [**Owner API Methods**](/wallet/owner) section for more details.

```
epic-wallet owner_api
```

> Optional arguments
    ```
    --run_foreign    Also run the Foreign API (HTTP/S Listener) using only one port.
    ```

---

### `Send`
The `send` command is the first step of building an interactive transaction. 
The transaction can either be an automated and synchronous exchange through 
`HTTP/S`, `EPICBOX` or `TOR` methods, or it can be multiple step process done manually 
by exchanging `transaction files` or `emoji strings` between the users. 

=== "HTTP/S Method"
    To use this method both sender and receiver have to run `HTTP/S Listener`. 
    
    Receiver should share the URL address (IP or domain) pointing to his listener and make sure 
    it is reachable for the sender, i.e. port (by default `3415`) is open and firewall rule created.

    Transaction will be successfully finished if and only if both parties are online during the process 
    which should take no longer than few seconds. Failed transaction can be cancelled by sender to unlock locked funds.

    ```
    epic-wallet send -d <http_address> <amount>
    ```
=== "Epicbox Method"
    To use this method both sender and receiver have to run `EPICBOX Listener`. 

    Epicbox server will work as temporary storage to make it possible to transact without the need of both parties 
    being online at the same time. It will also remove the need of sharing receivers IP address and handling the ports.

    Receiver should share with the sender the full epicbox address:

    !!! info "How to get your epicbox receiving address"
        Type `epic-wallet address` and copy the first address displayed in the console described as
        `Address for account - <account name>`.

        Full address will also require adding the epicbox domain from the `epic-wallet.toml` file
        (by default `epicbox.epic.tech`).

        The full address should look similiar to:
        > esYeNScdKxUbm2tag16xAQ4k31oQAR5V5TWUUsZPLDKM1eCsBmhF@epicbox.epic.tech

    To complete the transaction both parties have to be online at some point to receive transaction slate 
    and sign it, this process is fully automated. Failed transaction can be cancelled by sender to unlock locked funds.

    ```
    epic-wallet send -m epicbox -d <epicbox_address> <amount>
    ```
=== "TOR Method"
    To use this method both sender and receiver have to run `HTTP/S Listener`. 

    Transaction will be successfully finished if and only if both parties are online during the process 
    which should take less than a minute. Failed transaction can be cancelled by sender to unlock locked funds.
    
    !!! info "How to get your TOR receiving address"
        Type `epic-wallet address` and copy the third address displayed in the console described as 
        `TOR Onion V3 Address for account - <account name>`

        The address should look similar to:
        > 23goa5mot5phnu3vrepdmd5brsh23wp5tfgcmekdbp77rv2jsaqci6ad

    ```
    epic-wallet send -d <tor_address> <amount>
    ```

    !!! note ""
        In order to use the TOR method make sure its client is available in your system and added to env PATH.
    
=== "File Method"
    This transaction method is used to create transaction files, it is up to the users how they will exchange them, 
    i.e. using e-mails, messangers, Bluetooth, USB sticks, etc.

    This method requires few steps to complete the transaction:

    1. Sender is initializing the process and creates the transaction file with:
    > ```epic-wallet send -d <file_name> <amount>```

    2. Sender sends created transaction file to the receiver

    3. Receiver signs the transaction using received file with:
    > ```epic-wallet receive -i <file_name>```
    
    4. Receiver have to send back the created transaction file response to the sender

    5. Sender finalizes the transaction using received response file with:
    > ```epic-wallet finalize -i <response_file_name>```

    After 5th step the transaction is propagaded to the network and can not be cancelled.

=== "Emoji Method"
    This transaction method is used to create emoji strings, it is up to the users how they will exchange them, 
    i.e. using e-mails, messangers, Bluetooth, USB sticks, etc.

    This method requires few steps to complete the transaction:

    1. Sender is initializing the process and creates emoji string with:
    > ```epic-wallet send -m emoji <amount>```

    2. Sender sends created emoji string to the receiver

    3. Receiver signs the transaction using received emoji string with:
    > ```epic-wallet receive -m emoji -i <emoji_string>```
    
    4. Receiver have to send back created response emoji string to the sender

    5. Sender finalizes the transaction with received response emoji string:
    > ```epic-wallet finalize -m emoji -i <response_emoji_string>```

    After 5th step the transaction is propagaded to the network and can not be cancelled.

=== "Self Method"
    This transaction method can be used to send coins between the different wallet accounts, 
    it does not require any extra steps, i.e. running listeners or exchanging data manually.

    To use this method wallet requires to have at least 2 accounts, 
    more about creating and managing them [here](/wallet/cli/#account).

    ```
    epic-wallet -a <account_1_name> send -m self -d <account_2_name> <amount>
    ```

> Optional arguments
    ```
    -o, --change_outputs <change_outputs>     Number of change outputs to generate [default: 1]
    -g, --message <message>                   Optional participant message to include
    -c, --min_conf <minimum_confirmations>    Minimum number of confirmations required for an output to be spendable [default: 10]
    -z, --proof_address <proof_address>       Recipient proof address. If not using TOR, must be provided seprarately by the recipient
    -s, --selection <selection_strategy>      Coin/Output selection strategy [default: smallest]  [possible values: all, smallest]
    -t, --stored_tx <stored_tx>               If present, use the previously stored Unconfirmed transaction with given id
    -b, --ttl_blocks <ttl_blocks>             If present, the number of blocks from the current after which wallets should refuse to process transactions further
    ```

### `Receive`
The `receive` command processes the `transaction file` provided by the sender.

```
epic-wallet receive -i <file_name>
```
Then your wallet will output another file which should be sent back to the sender. 

---

### `Finalize`
The `finalize` command is the final step for `transaction file` method.

```
epic-wallet finalize -i <file_name>
```
The transaction building process will then be finalized and your wallet will post it to the network.


> Optional finalize arguments
    ```
    `-n` `--nopost`     transaction would be finalized but not posted (dry-run)
    ```
 
---

### `Post`
Manually post a finalized transaction to the network, specify the file path using the `-i` flag.
```
epic-wallet post -i <file_name>
```

---

### `Proof`
EPIC privacy and scalability mechanics mean users no longer have the ability to simply prove a transaction 
has happened by pointing to it on the chain. By default, whenever a transaction sent to a destination address 
using `-d`, a payment proof is created.

Payers can then use these proofs to resolve future payment disputes and prove they sent funds to the correct recipient.

The *sender* can export the payment proof by specifying the transaction id (`-i`) (obtained by [txs](#txs)) or the tx-UUID (`-t`), and choosing the path for the proof file, e.g:

```
epic-wallet export_proof -i 4 "proof.txt"
```

The sender can then provide this proof to any other wallet for verification.
Verification example:

```
epic-wallet verify_proof proof.txt
```

This will ensure that:

* The kernel for the transaction in the proof is validated and can be found on-chain.
* Both the sender and recipient's signatures correctly sign for the amount and the kernel.

On top of that, if the receiver's address in the transaction belongs to the same wallet who's verifying, 
then the user will be informed as follows:
```
epic-wallet verify_proof proof.txt
```

---

### `Outputs`
To show a list of all your wallet's outputs, type:

```
epic-wallet outputs
```
!!! text "Wallet Outputs"
    ```
    Wallet Outputs - Account 'default' - Block Height: 814491
    ---------------------------------------------------------------------------------------------------------------------------------------------------------------
     Output Commitment                                                   MMR Index  Block Height  Locked Until  Status   Coinbase?  # Confirms  Value           Tx
    ===============================================================================================================================================================
     08f4f062b99223d2d8a1ad1ae11085ab2d7b4f1bc603f9c29748f1b918861fdf23  7498573    743936        743936        Unspent  false      70556       5198.081029600  1
    ---------------------------------------------------------------------------------------------------------------------------------------------------------------
     097fe8bf1ad6a792600d5e010d0b77c40b147ea122c176476259f100a48924d40c  7832632    790025        790025        Unspent  false      24467       581.392000000   2
    ---------------------------------------------------------------------------------------------------------------------------------------------------------------
     08645896f150bfc70f36a602a7a5f41180ae8d5db42864f19f7257542cf2c7fc98  None       811501        0             Unspent  false      2991        389.859133700   9
    ---------------------------------------------------------------------------------------------------------------------------------------------------------------
    ```

> Optional outputs arguments
    ```
    -f, --show_full_history    If specified, display full outputs history
    -s                         To show spent outputs      
    ```

---

### `Txs`
Every time an action is performed in your wallet (send, receive, even if uncompleted), 
an entry is added to an internal transaction log containing vital information about the transaction. 
Because the epic blockchain contains no identifying information whatsoever, this transaction log is necessary 
for your wallet to keep track of transactions. To view the contents of your transaction log, use the command:

```
epic-wallet txs
```

!!! text "Transaction Log"
    ```text
    Transaction Log - Account 'default' - Block Height: 814448
    -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     Id  Type         Shared Transaction Id                 Creation Time        TTL Cutoff Height  Confirmed?  Confirmation Time    Num.    Num.     Amount        Amount       Fee    Net           Payment   Kernel                                                              Tx
                                                                                                                                     Inputs  Outputs  Credited      Debited             Difference    Proof                                                                         Data
    =====================================================================================================================================================================================================================================================================================
     0   Received Tx  2b2ffc5e-8fa0-4450-b270-078df29b3e23  2020-07-28 13:18:18  None               true        2020-07-28 13:18:18  0       1        389.892       0.0          0.007  389.892       None      ddec166399348a24d2893c025b4b4d4a058f81834a663284ba23fe0bd0ac025b4b  Yes
    -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     1   Sent Tx      fd9b3035-73d0-4ea3-8c3e-5d45c512ad8b  2020-08-03 15:32:19  None               true        2020-08-03 15:42:20  2       1        389.8591337   390.8661337  0.007  -1.007        Yes       0834a66310df8a8b43093c025b4b4d4a058f8188ee24d2809e338e0bd0ae9e2c2c  Yes
    -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
     2   Sent Tx      ea92fcce-8fa0-48d0-b270-078df2e22d24  2020-08-04 18:51:47  None               false       None                 1       1        139.8511337   389.8591337  0.008  -250.008      None      09fd95b4e40ce1c2d67376d46dc37ddec1aa0ae50ca9934ba271fff0b47510c72f  Yes
         - Cancelled
    -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    ```

> Optional txs arguments:
    ```
    -i, --id <id>        If specified, display transaction with given Id and all associated Inputs/Outputs
    -t, --txid <txid>    If specified, display transaction with given TxID UUID and all associated Inputs/Outputs
    ```

---

### `Cancel`
Cancels an in-progress created transaction, freeing previously [locked outputs](#info) for use again.

```
epic-wallet cancel -i <id>
```

> Optional cancel arguments
    ```    
    -i, --id <id>        The ID of the transaction to cancel
    -t, --txid <txid>    The TxID UUID of the transaction to cancel
    ```

---

### `Scan`
The `scan` command scans the entire UTXO (unspent tx outputs) set from the node, identifies which outputs are yours and updates your wallet state.

```
epic-wallet scan
```

It should not be necessary to run the scan command manually, as the wallet continually scans the 
outputs on the chain. However, if for some reason you believe your outputs and transactions 
are in an inconsistent state, you can initiate a manual scan to attempt to fix or restore them.

> Optional scan arguments
    ```
    `-d` `--delete-unconfirmed` if present, scan and cancel all pending transactions, freeing up any locked outputs.
    `-h` `--start-height` lets you specify a block height from which to start the manual scan.
    ```

---

### `Recover`
The `recover` command displays the existing wallet's 24 (or 12) word seed phrase.

```
epic-wallet recover
```

<br />
---

## Global Options
> There are several global wallet arguments which you can provide for every command.

### `Help`

It will display all the commands and every global flag. 

`epic-wallet help`

To get additional info about a specific command use `-h`, `--help` flag:

`epic-wallet <command> --help`
 
---

### `Version`
Get the wallet version 

```
epic-wallet --version
```

---

### `Network`
By default, wallet will connect to the `Mainnet` network, for testing purposes you can use the testnet:

```
epic-wallet --floonet <command>
```

---

### `Wallet Dir`
By default, wallet will try to read configuration files from the directory with the `epic-wallet` binary file, 
if that fails it will automatically try the path from `epic-wallet.toml` file. 
To set custom path use `-c`, `--current_dir` flag:

```
epic-wallet -c <wallet_dir_path> <command>
```

---

### `Account`
The `account` command is used to manage wallet accounts. To print the list of your existing accounts type:

```
epic-wallet account
```

Each account acts as a separate wallet, but they are all derived from the same master seed. 
The `default` account with ID `0` is created when the wallet is initialized.

To create a new account, pass the argument `-c` `--create` followed by name of your choice:

```
epic-wallet account -c <account_name>
```

All `epic-wallet` commands can then be used with the `-a`, `--account` flag to specify an account for the command 
(otherwise `default` account is used):

```
epic-wallet -a <account_name> <command>
```

---

### `Password`
You could specify your password on the directly command line by providing the `-p`, `--password` flag. 
Please note this will place your password in your shell's command history, so use this switch with caution.
```
epic-wallet -p <password> <command>
```
---

### `Node API Address`
The wallet should be connected to the `EPIC Node` to stay up-to-date and verify its content. 
By default, it tries to connect to the address provided in the `epic_wallet.toml` file, 
alternatively you can provide the `-r`, `--api_server_address` flag:
```
epic-wallet -r <node_api_address> <command>
```