const request = require('request');

const host = "localhost:3413"
const user = 'epic';
const api_secret = " ";  // `cat ~/.epic/main/.api_secret`
const url = `http://${user}:${api_secret}@${host}/v2`

const foreign_method = 'get_version';
const foreign_params = [];
const foreign_payload = {
    id: 1,
    method: foreign_method,
    params: foreign_params,
    jsonrpc: '2.0'
}

const owner_method = 'get_status';
const owner_params = [];
const owner_payload = {
    id: 1,
    method: owner_method,
    params: owner_params,
    jsonrpc: '2.0'
}


// Foreign API Call
request({
    url: `${url}/foreign}`,
    method: "POST",
    json: true,
    body: foreign_payload
}, function (error, response, body){
    console.log(body);
});


// Owner API Call
request({
    url: `${url}/owner}`,
    method: "POST",
    json: true,
    body: owner_payload
}, function (error, response, body){
    console.log(body);
});



