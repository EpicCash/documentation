/* Sample Code for connecting to the V3 Secure API via Node
 *
 * With thanks to xiaojay of Niffler Wallet:
 * https://github.com/epicfans/Niffler/blob/gw3/src/shared/walletv3.js
 *
 */

let password = ""; // your wallet pass
let port = "3420"; // :13420 = default floonet port, :3420 default mainnet port
let api_secret = ""; //`cat ~/.epic/main/.owner_api_secret` or `cat ~/.epic/floo/.owner_api_secret`

const jayson = require('jayson/promise');
const crypto = require('crypto');



const client = jayson.client.http('http://epic:'+ api_secret +'@127.0.0.1:' + port + '/v3/owner');

// Demo implementation of using `aes-256-gcm` with node.js's `crypto` lib.
const aes256gcm = (shared_secret) => {
    const ALGO = 'aes-256-gcm';

    // encrypt returns base64-encoded ciphertext
    const encrypt = (str, nonce) => {
        let key = Buffer.from(shared_secret, 'hex')
        const cipher = crypto.createCipheriv(ALGO, key, nonce)
        const enc = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()])
        const tag = cipher.getAuthTag()
        return Buffer.concat([enc, tag]).toString('base64')
    };

    // decrypt decodes base64-encoded ciphertext into a utf8-encoded string
    const decrypt = (enc, nonce) => {
        //key,nonce is all buffer type; data is base64-encoded string
        let key = Buffer.from(shared_secret, 'hex')
        const data_ = Buffer.from(enc, 'base64')
        const decipher = crypto.createDecipheriv(ALGO, key, nonce)
        const len = data_.length
        const tag = data_.slice(len-16, len)
        const text = data_.slice(0, len-16)
        decipher.setAuthTag(tag)
        const dec = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
        return dec
    };

    return {
        encrypt,
        decrypt,
    };
};

class JSONRequestEncrypted {
    constructor(id, method, params) {
        this.jsonrpc = '2.0'
        this.method = method
        this.id = id
        this.params = params
    }

    async send(key){
        const aesCipher = aes256gcm(key);
        const nonce = new Buffer.from(crypto.randomBytes(12));
        let enc = aesCipher.encrypt(JSON.stringify(this), nonce);
        //console.log("Encrypted: " + enc)
        let params = {
            'nonce': nonce.toString('hex'),
            'body_enc': enc,
        }
        let response = await client.request('encrypted_request_v3', params);

        if (response.err) {
            throw response.err
        }

        const nonce2 = Buffer.from(response.result.Ok.nonce, 'hex');
        const data = Buffer.from(response.result.Ok.body_enc, 'base64');

        let dec = aesCipher.decrypt(data, nonce2)
        return dec
    }
}

async function initSecure() {
    let ecdh = crypto.createECDH('secp256k1')
    ecdh.generateKeys()
    let publicKey = ecdh.getPublicKey('hex', 'compressed')
    const params = {
        'ecdh_pubkey': publicKey
    }
    let response = await client.request('init_secure_api', params);
    if (response.err) {
        throw response.err
    }

    return ecdh.computeSecret(response.result.Ok, 'hex', 'hex')
}

async function main() {
    let shared_key = await initSecure();

    let response = await new JSONRequestEncrypted(1, 'open_wallet', {
        "name": null,
        "password": password,
    }).send(shared_key);


    let token = JSON.parse(response).result.Ok;

    let sendtx_response = await new JSONRequestEncrypted(1, 'init_send_tx', {

        "token": token,
        "args": {
            "src_acct_name": null,
            "amount": "10000000",
            "minimum_confirmations": 3,
            "max_outputs": 500,
            "num_change_outputs": 1,
            "selection_strategy_is_use_all": true,
            "message": "my message - test",
            "target_slate_version": null,
            "payment_proof_recipient_address": null,
            "ttl_blocks": null,
            "send_args": {
                "method": "http",
                "dest": "https://1038-41-285-93-201.ngrok-free.app",
                "finalize": true,
                "post_tx": true,
                "fluff": false
              }
        }
    }

    ).send(shared_key);

    console.log(sendtx_response)  // Prints the response of init_send_tx method  
    
}

main();
