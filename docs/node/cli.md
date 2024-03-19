**Node Command Line API **

> You can manage your EPIC Node (server) by using built-in CLI.
> 
> Get compiled binaries from [epiccash.com/downloads](https://epiccash.com/downloads/)
> or build from source [github.com/epiccash](https://github.com/EpicCash)

## Usage
=== "Windows"
    ``` bash title="Usage"
    epic.exe [FLAGS] [SUBCOMMAND]
    ```
=== "Linux"
    ``` bash title="Usage"
    sudo ./epic [FLAGS] [SUBCOMMAND]
    ```
<hr />

## Flags 
```bash
--floonet        Run epic against the Floonet (as opposed to mainnet)
-h, --help       Prints help information
-V, --version    Prints version information
```

## Subcommands
### `client`

Communicates with the Epic server

!!! note "CLI commands"
    ```bash
    USAGE:
        epic client [SUBCOMMAND]
    
    FLAGS:
        -h, --help       Prints help information
        -V, --version    Prints version information
    
    SUBCOMMANDS:
        ban                   Ban peer
        help                  Prints this message or the help of the given subcommand(s)
        listconnectedpeers    Print a list of currently connected peers
        status                Current status of the Epic chain
        unban                 Unban peer
    ```
    
    `ban`
    ```bash
    USAGE:
        epic client ban --peer <peer>
    
    OPTIONS:
        -p, --peer <peer>    Peer ip and port (e.g. 10.12.12.13:13414)
    ```
    
    `unban`
    ```bash
    USAGE:
        epic client unban --peer <peer>
    
    OPTIONS:
        -p, --peer <peer>    Peer ip and port (e.g. 10.12.12.13:13414)
    ```
    
    `listconnectedpeers`
    ```bash
    USAGE:
        epic client listconnectedpeers
    ```
    
    `status`
    ```bash
    USAGE:
        epic client status
    ```

### `server`

Control the Epic server

!!! note "CLI commands"
    ```bash
    USAGE:
        epic server [OPTIONS] [SUBCOMMAND]
    
    FLAGS:
        -h, --help       Prints help information
        -V, --version    Prints version information
    
    OPTIONS:
        -a, --api_port <api_port>          Port on which to start the api server (e.g. transaction pool api)
        -c, --config_file <config_file>    Path to a epic-server.toml configuration file
        -p, --port <port>                  Port to start the P2P server on
        -s, --seed <seed>                  Override seed node(s) to connect to
        -w, --wallet_url <wallet_url>      The wallet listener to which mining rewards will be sent
    
    SUBCOMMANDS:
        config    Generate a configuration epic-server.toml file in the current directory
        help      Prints this message or the help of the given subcommand(s)
        run    Print    Run the Epic server in this console
    ```

