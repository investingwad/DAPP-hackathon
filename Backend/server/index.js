const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Api, JsonRpc, RpcError } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig");
const fetch = require("isomorphic-fetch");
const { TextEncoder, TextDecoder } = require("text-encoding");

const defaultPrivateKey = "5KZ9RVFNytYUW1oHSVjgFoMvErvmZckgoXzwhHg6svWYDEzWsMB";
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
let dspEndpt = "https://kylin-dsp-2.liquidapps.io";
let datafetch =  '{"contract":"' +
process.env.contract +
'","scope":"' +
process.env.contract +
'","table":"' +
process.env.order_table +
'","key":'
let rpc = new JsonRpc(dspEndpt, { fetch });
let api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

const { createClient } = require("@liquidapps/dapp-client");
var client;
const getClient = async () => {
  if (client) return client;
  client = await createClient({
    network: "kylin",
    httpEndpoint: dspEndpt,
    fetch: fetch
  });
  return client;
};

let app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
console.log("WELCOME!!");

app.get("/", async (req, res) => {
  res.status(200).send("Moonlight APi");
});

app.post("/register_user", async (req, res) => {
  try {
    const service = await (await getClient()).service(
      "vaccounts",
      process.env.contract
    );
    const response_reg = await service.push_liquid_account_transaction(
      process.env.contract,
      process.env.contract_key,
      "regaccount",
      {
        vaccount: process.env.user1 // increment to new account if fails
      }
    );
    console.log("response_reg", response_reg);

    const response_registeraction = await service.push_liquid_account_transaction(
      process.env.contract,
      process.env.contract_key,
      "registeracc",
      {
        username: process.env.user1,
        balance: req.body.lease_amount,
        lease_period: req.body.lease_period,
        vote_choice: req.body.vote_choice
      }
    );
    console.log("response_registeraction", response_registeraction);
    lease_transfer(req.body.lease_amount);
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
});

async function lease_transfer(amount, lease_period) {
  try {
    const signatureProvider = new JsSignatureProvider([
      process.env.exchange_key
    ]);

    let rpc = new JsonRpc(dspEndpt, { fetch });
    let api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });

    const result = await api.transact(
      {
        actions: [
          {
            account: "eosio.token",
            name: "transfer",
            authorization: [
              {
                actor: process.env.exchange,
                permission: "active"
              }
            ],
            data: {
              from: process.env.exchange,
              to: process.env.contract,
              quantity: amount,
              memo: "1:" + process.env.user1
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      }
    );
    console.log("result", result);
  } catch (err) {
    console.log("s.m. err--", err);
  }
}

async function matchorder(amount, lease_period) {
  let key_array = [0, 1, 2];
  let max_apr
  key_array.forEach(function(item, index) {
    console.log(item, index);
    var dataString1 = datafetch +item +"}";
    var options = {
      url: process.env.get_table_row,
      method: "POST",
      body: dataString1
    }; 
    let res = await rp(options);
    res = JSON.parse(res);
    if(res.row && res.row.order_stat == "queue" && res.row.lease_period <= lease_period && res.row.rent_amount <= amount)
    {
      max_apr = parseFloat(res.row.rent_amount)
    }
  });


}
///////////////////////////////

app.listen(3000, function() {
  console.log("listening on 3000,");
});

////////////////

// const url = httpEndpoint;
// const toBound = (numStr, bytes) =>
//     `${(new Array(bytes * 2 + 1).join('0') + numStr).substring(numStr.length).toUpperCase()}`;

// const rpc = new JsonRpc(url, { fetch });

// app.post('/register', async (req, res) => {

//     let privateWif
//     //   let towif = privateWif.towif()
//     /* let abc = await PrivateKey.randomKey();

//     let privateKey = abc.toWif()
//     console.log(privateKey)
//     let pubkey = PrivateKey.fromString(privateKey).toPublic().toString()
//     console.log(pubkey) */

// let abc = await PrivateKey.randomKey();
//     const privateKey = "5JamkxEHSjkRgXk46P4MZgz5uNtghh2kCLhe6j8v9jrgD4Rs6vV";
//     //      5JamkxEHSjkRgXk46P4MZgz5uNtghh2kCLhe6j8v9jrgD4Rs6vV
//     // EOS4xQz6cjRS5F8uZzHp962yuVDd7xdz9wTpezP5wH2WAXBKYsFca
//     var account = "arunimaray12";
//      let dataValue = { username: 'organictoken',balance: "10.0000 EOS", payload: { vaccount: "organictoken" } }

//     let action = "registeracc"

//     try {

//         var res = await runTrx({
//             contract_code: "dsptestac111",
//             payload: {
//                 name: action,
//                 data: {
//                   reg_payload: dataValue
//                 }
//             },
//             wif: privateKey
//         });
//         console.log("re take action", res)
//         return res;
//     }
//     catch (err) {
//         throw (err);
//     }

// })
// async function postData(url = ``, data = {}) {
//     // Default options are marked with *
//     console.log("in post data", data)
//     try {

//           let res = await axios({
//               url: url,
//               method: 'POST',
//               data: JSON.stringify(data)
//           })
//         console.log("post data res-", res.data)
//         return res.data
//     } catch (err) {
//         console.log("err--",err.response.data.error.details)
//         return err.response.data.error.details
//     }
// }

// async function runTrx({ contract_code, payload, wif }) {
//     // Default options are marked with *
//     console.log("payload--", payload)
//     // console.log("eos--",Eos.modules)
//     const signatureProvider = new JsSignatureProvider([]);
//     const api = new Api({
//         rpc,
//         signatureProvider,
//         // chainId:"",
//         textDecoder: new TextDecoder(),
//         textEncoder: new TextEncoder(),
//     });

//     const response = await api.serializeActions([{
//         account: contract_code,
//         name: payload.name,
//         authorization: [],
//         data: payload.data
//     }]);
//     const toName = (name) => {
//         var res = new BigNumber(Eos.modules.format.encodeName(name, true));
//         res = (toBound(res.toString(16), 8));
//         return res;
//     }
//     var datasize = toBound(new BigNumber(response[0].data.length / 2).toString(16), 1).match(/.{2}/g).reverse().join('');
//     var payloadSerialized = "0000000000000000" + toName(payload.name) + "01" + "00000000000000000000000000000000" + datasize + response[0].data;
//     return await postVirtualTx({
//         contract_code,
//         wif,
//         payload: payloadSerialized
//     });

// }

// async function postVirtualTx({ contract_code, wif, payload }) {
//     // Default options are marked with *
//     console.log("in postVirtual", payload)
//     signature = ecc.sign(Buffer.from(payload, 'hex'), wif);
//     const public_key = PrivateKey.fromString(wif).toPublic().toString()
//     console.log("public key-", public_key)
//     return postData(`${endpoint}/v1/dsp/accountless1/push_action`, {
//         contract_code,
//         public_key,
//         payload,
//         signature
//     });

// }
