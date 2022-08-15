# 
## File Structure

> By default, epic will create all wallet files in the hidden directory `.epic` 
> under your home directory (i.e. `~/.epic`). You can also create and use a wallet with 
> data files in a custom directory, as will be explained later.
>
> A epic wallet maintains its state in an Lightning Memory-Mapped Database (LMDB), with the master seed 
> stored in a separate file. When creating a new wallet, the file structure should be as follows:

```text
[wallet directory]
├── epic-wallet.log
├── epic-wallet.toml
├── tor
└── wallet_data
    ├── db
    │   └── lmdb
    │
    └── wallet.seed
```

* `epic-wallet.toml` contains configuration information for the wallet. You can modify values within to change ports, the address of your epic node, or logging values.

* `wallet.seed` is your master seed file; the private keys of all your outputs are derived from it, and its contents are encrypted with your wallet password. The seed file can be recovered using the seed phrase.

* `tor` folder contains Tor configuration files used by the wallet listener. There should be no need to manipulate anything in this directory manually.

??? note "Tor Configuration"

    `epic-wallet.toml` contains a [tor] section used to configure values when sending or listening via TOR:

    * `use_tor_listener` specifies whether the Tor listener should also be invoked when starting the wallet listener via `listen` (default = true).

    * `socks_proxy_addr` contains the listening address of TOR's socks proxy port. This should generally be left alone.


## Commands

### `help`

`epic-wallet help` will display all the commands and every global flag.
</br> To get additional info about a specific command type `epic-wallet help [command]`, e.g:

```text
epic-wallet help send
```

!!! note ""
    You can also pass `--help` or `-h`.

### `init`
Before doing anything else, the wallet files need to be generated via the `init` command:

```text
epic-wallet init
```

You'll be prompted to enter a password for the new wallet. It will be used to encrypt your `master.seed` file and you'll be asked to type it for most wallet commands.

By default, your wallet files will be placed into `~/.epic`. Alternatively, if you'd like to run a wallet in a directory of your choice, you can create one in the current directory by using flag `-h`, e.g:

```text
epic-wallet init -h
```

This will create all the needed data files, including `epic-wallet.toml` and `wallet.seed`, in the current directory. When running any `epic-wallet` command, epic will check the working directory if these files exist. If not, it will use the default location `~/.epic`.

Upon a successful `init`, the wallet prints a 24-word recovery phrase, which you should write down and store in a non-digital format. This phrase can be used to re-create your master seed file if it gets lost or corrupted, or if you forget the wallet password.

!!! note ""
    If you'd prefer to use a 12-word recovery phrase, you can use the `-s` `--short_wordlist` flag.

### `init --recover`
If you need to recreate your wallet from an existing seed, you can `init` a wallet with a recovery phrase using the `-r` `--recover` flag. For example, the following command initializes a wallet in the current directory.

```text
epic-wallet init -hr
```

```text
File /home/custom_dir/epic-wallet.toml configured and created
Please enter your recovery phrase:
```
On the first run, the wallet will scan the entire chain and restore any outputs that belong to you.
<hr />

### `account`
The `account` command is used to manage wallet accounts. Let's print a list of your existing accounts:

```text
epic-wallet account
```

Accounts could be thought of as somewhat similar to different bank accounts under the same name. Each account acts as a separate wallet, but they are all derived from the same master seed. The `default` account is created when you initialize the wallet.

To create a new account, pass the argument `-c` `--create`.

```text
epic-wallet account -c freeman
```

This will create a new account called 'freeman'.

All `epic-wallet` commands can then be passed the argument `-a` to specify an account for the command (otherwise `default` account is used), e.g:

```text
epic-wallet -a freeman info
```
<hr />

### `info`
The `info` command summarizes wallet account balance.

```text
epic-wallet info
```
!!! text "Wallet Summary"
    ```text
    ____ Wallet Summary Info - Account 'default' as of height 813137 ____
    
    Confirmed Total                  | 5779.473029600
    Awaiting Confirmation (< 10)     | 0.000000000
    Awaiting Finalization            | 139.851133700
    Locked by previous transaction   | 389.859133700
    -------------------------------- | -------------
    Currently Spendable              | 5779.473029600
    ```
!!! info "How to read balance"
    * **Confirmed Total** is your balance including both spendable coins and those awaiting confirmation.
    * **Awaiting Confirmation** denotes the balance from transactions that have appeared on-chain, but for which your wallet is waiting a set number of blocks before treating them as spendable (default is 10 blocks).
    * **Awaiting Finalization** is the balance from transactions that have not yet appeared on-chain. This could be due to the other party not having broadcast the transaction yet. Also, when you are the sender of a transaction, your change output will be denoted in this field as well.
    * **Locked by previous transaction** shows the amount of coins locked by a previous transaction you have made and that is currently awaiting finalization. This is usually made up both of the amount being sent and of the change outputs waiting to be returned back to your wallet. </br>
    Once the transaction appears on-chain, this balance unlocks and the output that was used will again become available for spending.

### `listen`
The `listen` command opens up a listener (by default `TOR` and `HTTP/S`).

```text
epic-wallet listen
```

This will automatically configure a TOR hidden service and makes the wallet listen for 
incoming transactions. Your wallet will listen for requests until the process is cancelled (`<Ctrl-C>`).

!!! note ""
    `tor` or `tor.exe` need to be available on the system PATH.

### `send`
The `send` command is the first step of building an interactive transaction. 
The transaction can either be an instant synchronous exchange through `TOR` and `HTTP/S`, 
or it can be an asynchronous process, in which each step is done manually by exchanging 
`transaction files`

=== "HTTP/S Method"
    ```text
    epic-wallet send -d <http_address> <amount>
    ```
=== "TOR Method"
    ```text
    epic-wallet send -d <tor_address> <amount>
    ```
=== "File Method"
    ```text
    epic-wallet send -d <file_name> <amount>
    ```
<br />

!!! info "more send flags"
    * `-f` `--fluff` if present, ignore the dandelion relay protocol. Dandelion bounces your transactions directly through several nodes in a stem phase, after which the transaction randomly fluffs (broadcast) to the rest of the network.
    * `-n` `--no_payment_proof` if present, do not request the data required for a payment proof. This shortens the slatepack message length.
    * `-e` `--estimate-selection` if present, performs a "dry-run" of creating the transaction, without actually doing anything and locking the funds. It then lists different output selection strategies (outlined below) and their possible effect on your wallet outputs, if chosen.
    * `-s` `--selection` allows you to choose between two output selection strategies, `small` and `all`. The default strategy is `small`, which includes the *minimum* number of inputs to cover the amount, starting with the smallest value output. In contrast, using `all` consolidates *all* of your outputs into a single new output, thus reducing your wallet size, increasing operation speed and reducing the UTXO-set size of the chain. The downside is that the entire contents of your wallet remain locked until the transaction is validated on-chain, and all outputs are linked to one another, a detriment to your privacy.
    * `-b` `--ttl_blocks` allows you to specify a number of blocks into the future, after which a wallet should refuse to process the transaction further. This can be useful for putting time limits on transaction finalization, but please note this is not enforced at the epic protocol level; it's up to individual wallets whether they wish to respect this flag.

### `receive`
The `receive` command processes the `transaction file` provided by the sender.

```text
epic-wallet receive -i <file_name>
```

Then your wallet will output another file to provide the other party, so they can `finalize` the transaction.
<hr />

### `finalize`

The `finalize` command is the final step to `transaction file` transaction.

```text
epic-wallet finalize -i <file_name>
```
The transaction building process will then be finalized and your wallet will post it to the network.

If the flag `-n` `--nopost` is present, the transaction would be finalized but not posted.
<hr />

### `post`
Manually post a finalized transaction to the network, specify the file path using the `-i` flag.

```text
epic-wallet post -i <file_name>
```
<hr />

### `proof`
EPIC privacy and scalability mechanics mean users no longer have the ability to simply prove a transaction 
has happened by pointing to it on the chain. By default, whenever a transaction sent to a destination address 
using `-d`, a payment proof is created.

Payers can then use these proofs to resolve future payment disputes and prove they sent funds to the correct recipient.

The *sender* can export the payment proof by specifying the transaction id (`-i`) (obtained by [txs](#txs)) or the tx-UUID (`-t`), and choosing the path for the proof file, e.g:

```text
epic-wallet export_proof -i 4 "proof.txt"
```

The sender can then provide this proof to any other wallet for verification.

Verification for e.g.

```text
epic-wallet verify_proof proof.txt
```

This will ensure that:

* The kernel for the transaction in the proof is validated and can be found on-chain.
* Both the sender and recipient's signatures correctly sign for the amount and the kernel.

On top of that, if the receiver's address in the transaction belongs to the same wallet who's verifying, 
then the user will be informed as follows:

```text
epic-wallet verify_proof proof.txt
```

```text
Payment proof's signatures are valid.
The proof's recipient address belongs to this wallet.
Command 'verify_proof' completed successfully
```
<hr />

### `outputs`
To show a list of all your wallet's outputs, type:

```text
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

By default, only unspent outputs are listed. To show spent outputs, provide the `-s` flag.

```text
epic-wallet -s outputs
```
<hr />

### `txs`
Every time an action is performed in your wallet (send, receive, even if uncompleted), 
an entry is added to an internal transaction log containing vital information about the transaction. 
Because the epic blockchain contains no identifying information whatsoever, this transaction log is necessary 
for your wallet to keep track of transactions. To view the contents of your transaction log, use the command:

```text
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

To see the inputs & outputs associated with a particular transaction, as well as the payment proof associated with the transaction, use the `-i` switch and specify the id of the transaction, e.g:

```text
epic-wallet txs -i 0
```
<hr />

### `cancel`
Cancels an in-progress created transaction, freeing previously [locked outputs](#info) for use again.

```text
epic-wallet cancel -i 2
```
To specify which transaction to cancel, use the `-i` flag along with the tx id (obtained by [txs](#txs)) 
or the `-t` flag with the tx-UUID.
<hr />

### `scan`

The `scan` command scans the entire UTXO (unspent tx outputs) set from the node, identifies which outputs are yours and updates your wallet state.

```text
epic-wallet scan
```

It should not be necessary to run the scan command manually, as the wallet continually scans the 
outputs on the chain. However, if for some reason you believe your outputs and transactions 
are in an inconsistent state, you can initiate a manual scan to attempt to fix or restore them.

!!! info "Flags"
    * `-d` `--delete-unconfirmed` if present, scan and cancel all pending transactions, freeing up any locked outputs.
    * `-h` `--start-height` lets you specify a block height from which to start the manual scan.


When initializing a wallet from an existing seed via the epic-wallet `init -r command`, this scan is performed automatically on the first run.
<hr />

### `recover`
The `recover` command displays the existing wallet's 24 (or 12) word seed phrase.

```text
epic-wallet recover
```
<br />

## Arguments
!!! info
    There are several global wallet arguments which you can provide for every command.

### `account`
To set the account for a wallet command, provide the `-a` argument.

```text
epic-wallet -a freeman info
```
<hr />

### `password`
You could specify your password on the directly command line by providing the -p argument. Please note this will place your password in your shell's command history, so use this switch with caution.

```text
epic-wallet -p mypass info
```
<hr />

### `node`
The wallet needs to talk to a running epic node in order to remain up-to-date and verify its contents. 
By default, it tries to contact a node at 127.0.0.1:3413. To change this, either modify the value in the 
`epic_wallet.toml` file, or alternatively, you can provide the `-r` (se**r**ver) switch to wallet commands.
```text
epic-wallet -r "http://192.168.0.2:3413" info
```