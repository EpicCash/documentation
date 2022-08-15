from typing import Union

import requests

api_secret_path = '~\.epic\main\.api_secret'
api_secret = open(api_secret_path, 'r').read()
api_user = 'epic'
api_url = "http://localhost:3413/v2"


def api_call(method: str, params: Union[list, dict], api_type: str):
    payload = {
        'jsonrpc': '2.0',
        'id': 1,
        'method': method,
        'params': params
        }

    url = f"{api_url}/{api_type}"
    auth = (api_user, api_secret)
    response = requests.post(url=url, json=payload, auth=auth)

    try:
        if response.status_code in [200, 201]:
            return response.json()
    except Exception as e:
        print(e)

    return response.text


foreign_call = api_call(method='get_version', params=[], api_type='foreign')
print(foreign_call)

owner_call = api_call(method='get_status', params=[], api_type='owner')
print(owner_call)
