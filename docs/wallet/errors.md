# Errors
There is two kind of errors that can appear when making a call on the API v2: basic JSON-RPC errors and API result errors

### JSON-RPC Errors
These errors are often due to a misconstrued JSON body, for example:

there is not enough parameters:

```JSON
{
  "error": {
    "code": -32602,
    "message": "WrongNumberOfArgs. Expected 4. Actual 5"
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

or invalid type of data entered:

```JSON
{
  "error": {
    "code": -32602,
    "message": "InvalidArgStructure \"start_height\" at position 1."
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

or method not found:

```JSON
{
  "error": {
    "code": -32601,
    "message": "Method not found"
  },
  "id": 2,
  "jsonrpc": "2.0"
}
```

this list of errors is not exhaustive, for more information about the possible error objects see the [JSON RPC 2.0 specifications](https://www.jsonrpc.org/specification#error_object).

<hr />

### API Result Errors
These type of errors are due to an API error during the query. 
This type of error is wrapped into the result.

For example, trying to ban a peer that's already banned:

```JSON
{
  "id": 2,
  "jsonrpc": "2.0",
  "result": {
    "Err": {
      "Internal": "ban peer error: PeerNotFound"
    }
  }
}
```

or a block that doesn't exist:

```JSON
{
  "id": 2,
  "jsonrpc": "2.0",
  "result": {
    "Err": "NotFound"
  }
}
```