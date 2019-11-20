const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const fetch = require('isomorphic-fetch')

const Order = require('./model/order.model')
const Orderstat = require('./model/orderstatus.model')

const eosaction = require('./eosaction/eosaction')

mongoose.connect("mongodb://localhost:27017", { useNewUrlParser: true })
mongoose.connection.on('connected', () => {
  console.log("mongodb database connected successfully")
})

const { createClient } = require('@liquidapps/dapp-client')
var client
const getClient = async () => {
  if (client) return client
  client = await createClient({
    network: 'kylin',
    httpEndpoint: dspEndpt,
    fetch: fetch
  })
  return client
}


let app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(cors())
console.log('WELCOME!!')

app.get('/', async (req, res) => {
  res.status(200).send('Moonlight APi')
})

app.post('/register_user', async (req, res) => {
  try {
    const service = await (await getClient()).service(
      'vaccounts',
      process.env.contract
    )
    const response_reg = await service.push_liquid_account_transaction(
      process.env.contract,
      process.env.contract_key,
      'regaccount',
      {
        vaccount: process.env.user1 // increment to new account if fails
      }
    )
    console.log('response_reg', response_reg)

    const response_registeraction = await service.push_liquid_account_transaction(
      process.env.contract,
      process.env.contract_key,
      'registeracc',
      {
        username: process.env.user1,
        balance: req.body.lease_amount,
        lease_period: req.body.lease_period,
        vote_choice: req.body.vote_choice
      }
    )
    console.log('response_registeraction', response_registeraction)
    res.status(200).send('Successful')
    // lease_transfer(req.body.lease_amount);
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
})

app.post('/create_order', async (req, res) => {
  try {
    let orderid = await eosaction.getid()
    let data = {
      id: orderid,
      authorizer: req.body.authorizer,
      stake_to: req.body.stake_to,
      rent_amount: req.body.rent_amount,
      rent_offer: req.body.rent_offer,
      duration: req.body.duration,
      resource_type: req.body.resource_type
    }
    const result = await eosaction.pushtrx(
      'createorder',
      data,
      process.env.contract
    )
    console.log('result', result)

    let order = new Order()
    order.id = orderid
    order.authorizer = req.body.authorizer
    order.stake_to = req.body.stake_to
    order.rent_amount = req.body.rent_amount
    order.rent_offer = req.body.rent_offer
    order.duration = req.body.duration
    order.resource_type = req.body.resource_type
    order.order_stat = 'queue'
    order.apr =
      parseFloat(req.body.rent_offer.split(' ')[0]) /
      parseFloat(req.body.duration)

    let orderobj = await order.save()
    console.log('orderobj', orderobj)
    res.status(400).send(orderobj)
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
})

app.post('/lease_transfer', async (req, res) => {
  try {
    let data = {
      from: process.env.exchange,
      to: process.env.contract,
      quantity: req.body.amount,
      memo: '1:' + req.body.account_name
    }
    const result = await eosaction.pushtrx('transfer', data, 'eosio.token')
    console.log('result', result)
  } catch (err) {
    console.log('s.m. err--', err)
  }
})

app.post('/match_order', async (req, res) => {
  let orders = await Order.aggregate([
    { $match: { order_stat: 'queue' } },
    { $sort: { apr: -1 } }
  ])

  let vaccount_det = eosaction.getvaccountdet(req.body.account_name)
  let orderid = 0
  let flag = 0
  orders.every(function (element, index) {
    // Do your thing, then:
    if (
      item.lease_period <= vaccount_det.row.lease_period &&
      parseFloat(item.rent_amount.split(' ')[0]) <=
        parseFloat(vaccount_det.row.balance.split(' ')[0])
    ) {
      orderid = item.id
      flag = 1
      return false
    } else return true
  })
  if (flag == 1) {
    let order_stat_id = await eosaction.getorderstatid()
    let orderobj = await eosaction.changeorderstat(orderid)
    if (orderobj) {
      let data = {
        vaccount: req.body.account_name,
        id: orderid,
        orderstat_id: order_stat_id
      }
      const result = await eosaction.pushtrx(
        'checkorder',
        data,
        process.env.contract
      )
      let orderstat = new Orderstat()
      orderstat.id = order_stat_id
      orderstat.order_id = orderid
      orderstat.lender = req.body.account_name
      orderstat.authorizer = orderobj.authorizer
      orderstat.stake_to = orderobj.stake_to
      orderstat.rent_amount = orderobj.rent_amount
      orderstat.rent_fee = orderobj.rent_offer
      orderstat.expires_at = orderobj.duration
      orderstat.filled_at = orderobj.resource_type

      let ordderstatres = await orderstat.save()
      res.status(200).send(ordderstatres)
    }
  } else {
    res.status(200).send('At present no match found for this lease request')
  }
})


app.post('/withdraw', async (req, res) => {
  try {
    let data = {
     vaccount : req.body.account_name
    }
    const result = await eosaction.pushtrx(
      'withdraw',
      data,
      process.env.contract
    )
    console.log('result', result)
    
    res.status(400).send("Successfully withdrawn lease-out request")
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
})

app.post('/cancelorder', async (req, res) => {
  try {
    let data = {
     orderid : req.body.order_id
    }
    const result = await eosaction.pushtrx(
      'withdraw',
      data,
      process.env.contract
    )
    console.log('result', result)
    let order = await Order.findOne({id:order_id}).remove().exec()
    
    res.status(400).send("Successfully withdrawn order request")
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
})

app.post('/leaseunstake', async (req, res) => {
  try {
    let data = {
     orderid : req.body.order_stat_id
    }
    const result = await eosaction.pushtrx(
      'leaseunstake',
      data,
      process.env.contract
    )
    console.log('result', result)
    let order = await Orderstat.findOne({id:req.body.order_stat_id})
    if(order)
    {
      await Order.findOne({id:order.order_id}).remove().exec()
      await order.remove()
      res.status(400).send("Successfully unstaked")
    }
      
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
})
/// ////////////////////////////

app.listen(3000, function () {
  console.log('listening on 3000,')
})

/// /////////////

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
