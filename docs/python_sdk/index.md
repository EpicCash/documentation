# Introduction 

Python wrapper for EPIC wallet and node API with extra tools.

## Installation
=== "pipenv"
    ```bash title="Python >= 3.9.5"
    pipenv install epicpy cryptography coincurve requests toml
    ```

=== "pip"
    ```bash title="Python >= 3.9.5" 
    pip install epicpy cryptography coincurve requests toml
    ```

=== "github"
    ```bash title="Python >= 3.9.5" 
    git clone https://github.com/EpicCash/epicpy
    cd epicpy
    pipenv install -r requirements.txt
    ```

!!! note "Extra information"
    - python SDK will make HTTP/S request calls to epic node API
    - for local development get the latest epic software 
    - public node api available under `https://epic-radar.com/node`



## Quick Start
Set required credentials, create instance of node and wallet


```py linenums="1"
from v3 import Wallet
from src.wallet import Node

# !TODO: ALL

NODE_URL = "http://127.0.0.1:3413"

API_VER = "v3"
PUB_API_PORT = 3415
OWNER_API_PORT = 3420
API_SECRET = "~\.epic\main\.owner_api_secret"
API_URL = f"http://127.0.0.1:{OWNER_API_PORT}/{API_VER}/owner"
USER = 'epic'
PASS = 'YOUR_PASSWORD'
# print(API_URL)

remote_node = Node(url=NODE_URL)

wallet = Wallet(api_url=API_URL, api_user=USER, api_secret=API_SECRET)
wallet.init_secure_api()
wallet.open_wallet()

# Wallet operations here ...

wallet.close_wallet()
```
