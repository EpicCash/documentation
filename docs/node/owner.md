
**Owner (private) node API**

> This API is used to query node about various information on the blockchain.
> Owner (private) API is designed to be used only by owner of the node.
> 
> This API is used mostly to manage your connections.
>
> By default, node API is exposed only for local connections and requires authentication.

<br />
 
When running `epic` node with defaults, owner API URL is available at `localhost:3413/v2/owner`.

`Basic Authentication` credentials:

- user: `epic`, 
- password saved in `~/.epic/main/.api_secret` file.

In order to change URL, authentication and other settings go to (by default) `~/.epic/main/epic-server.toml` file.

Make sure your `epic` node is running before calling API endpoints.

API call must be done via `POST` requests with `JSON` payload.

## Examples
!!! tip "How to send POST request via cURL"
    === "Windows PowerShell"
        - With authentication
        ```bash
        curl -u "epic:$(cat ~/.epic/main/.api_secret)" -d '{\"jsonrpc\": \"2.0\", \"method\": \"get_status\", \"params\": [], \"id\": 1}' -H "Content-Type: application/json" http://localhost:3413/v2/owner
        ```
        - Without authentication
        ```bash
        curl -d '{\"jsonrpc\": \"2.0\", \"method\": \"get_status\", \"params\": [], \"id\": 1}' -H "Content-Type: application/json" http://localhost:3413/v2/owner
        ```
    === "Unix Terminal"
        - With authentication
        ```bash
        curl -u "epic:$(cat ~/.epic/main/.api_secret)" -d '{"jsonrpc": "2.0", "method": "get_status", "params": [], "id": 1}' -H "Content-Type: application/json" http://localhost:3413/v2/owner
        ```
        - Without authentication
        ```bash
        curl -d '{"jsonrpc": "2.0", "method": "get_status", "params": [], "id": 1}' -H "Content-Type: application/json" http://localhost:3413/v2/owner
        ```

<br />

!!! example "Example API call:"
    === "Python"
        ```pip install requests```

        ```python title="Python 3.5+"
        --8<-- "docs/assets/code/python.py"
        ```
    === "NodeJS"
        ```npm install request```

        ```js title="NodeJS 18.0+"
        --8<-- "docs/assets/code/javascript.js"
        ```
<br />

# Methods

### `get_status`

Returns various information about the node, the network and the current sync status.

=== "Request"
    ```json 
    {
      "jsonrpc": "2.0",
      "method": "get_status",
      "params": [],
      "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
        "jsonrpc": "2.0",
        "result": {
          "Ok": {
            "protocol_version": "2",
            "user_agent": "MW/Epic 3.x.x",
            "connections": "8",
            "tip": {
              "height": 371553,
              "last_block_pushed": "00001d1623db988d7ed10c5b6319360a52f20c89b4710474145806ba0e8455ec",
              "prev_block_to_last": "0000029f51bacee81c49a27b4bc9c6c446e03183867c922890f90bb17108d89f",
              "total_difficulty": 1127628411943045
            },
            "sync_status": "header_sync",
            "sync_info": {
              "current_height": 371553,
              "highest_height": 0
            }
          }
        }
    }
    ```
<hr />

### `validate_chain`

Trigger a validation of the chain state.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "validate_chain",
        "params": [],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": null
      }
    }
    ```
<hr />

### `compact_chain`

Trigger a compaction of the chain state to regain storage space.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "compact_chain",
        "params": [],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": null
      }
    }
    ```
<hr />

### `get_peers`

Retrieves information about peers. If `null` is provided, `get_peers` will list all stored peers.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "get_peers",
        "params": ["70.50.33.130:3414"],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": [
          {
            "addr": "70.50.33.130:3414",
            "ban_reason": "None",
            "capabilities": {
              "bits": 15
            },
            "flags": "Defunct",
            "last_banned": 0,
            "last_connected": 1570129317,
            "user_agent": "MW/Epic 3.0.0"
          }
        ]
      }
    }
    ```
<hr />

### `get_connected_peers`

Retrieves a list of all connected peers.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "get_connected_peers",
        "params": [],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": [
          {
            "addr": "35.176.195.242:3414",
            "capabilities": {
              "bits": 15
            },
            "direction": "Outbound",
            "height": 374510,
            "total_difficulty": 1133954621205750,
            "user_agent": "MW/Epic 3.0.0",
            "version": 1
          },
          {
            "addr": "47.97.198.21:3414",
            "capabilities": {
              "bits": 15
            },
            "direction": "Outbound",
            "height": 374510,
            "total_difficulty": 1133954621205750,
            "user_agent": "MW/Epic 3.0.0",
            "version": 1
          },
          {
            "addr": "148.251.16.13:3414",
            "capabilities": {
              "bits": 15
            },
            "direction": "Outbound",
            "height": 374510,
            "total_difficulty": 1133954621205750,
            "user_agent": "MW/Epic 3.0.0",
            "version": 1
          },
        ]
      }
    }
    ```
<hr />

### `ban_peer`

Bans a specific peer.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "ban_peer",
        "params": ["70.50.33.130:3414"],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": null
      }
    }
    ```
<hr />

### `unban_peer`

Unbans a specific peer.

=== "Request"
    ```JSON
    {
        "jsonrpc": "2.0",
        "method": "unban_peer",
        "params": ["70.50.33.130:3414"],
        "id": 1
    }
    ```

=== "Response"
    ```JSON
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": {
        "Ok": null
      }
    }
    ```
<hr />
<br />

# RUST Implementation

```rust
pub trait OwnerRpc: Sync + Send {
    fn get_status(&self) -> Result<Status, ErrorKind>;
    
    fn validate_chain(&self) -> Result<(), ErrorKind>;
    
    fn compact_chain(&self) -> Result<(), ErrorKind>;
    
    fn get_peers(
        &self, 
        peer_addr: Option<SocketAddr>
    ) -> Result<Vec<PeerData>, ErrorKind>;
    
    fn get_connected_peers(&self) -> Result<Vec<PeerInfoDisplay>, ErrorKind>;
    
    fn ban_peer(&self, peer_addr: SocketAddr) -> Result<(), ErrorKind>;
    
    fn unban_peer(&self, peer_addr: SocketAddr) -> Result<(), ErrorKind>;
}
```