const dotenv = require('dotenv')
dotenv.config()
var rp = require('request-promise')
const { Api, JsonRpc, RpcError } = require('eosjs')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const fetch = require('isomorphic-fetch')
const { TextEncoder, TextDecoder } = require('text-encoding')

const Order = require('../model/order.model')
const Orderstat = require('../model/orderstatus.model')
const Ordercounter = require('../model/orderidcounter.model')
const Orderstatcounter = require('../model/orderstatcounter.model')
const Userbalance = require('../model/userexchangeblc.model')

const signatureProvider = new JsSignatureProvider([
  process.env.contract_key,
  process.env.proxy1_key,
  process.env.proxy2_key,
  process.env.exchange_key
])
let dspEndpt = 'https://kylin-dsp-2.liquidapps.io'
let rpc = new JsonRpc(dspEndpt, { fetch })
let api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
})

export async function pushtrx (method, data, account, actor) {
    const result = await api.transact(
      {
        actions: [
          {
            account: account,
            name: method,
            authorization: [
              {
                actor: actor,
                permission: 'active'
              }
            ],
            data: data
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      }
    )
   
    return result
 
}

export async function getid () {
  let res = await Ordercounter.find()
  console.log("ghg",res[0])
  if (res.length == 0) {
    let orderid = new Ordercounter()
    orderid.order_id = 111
    await orderid.save()
    return 111
  } else {
    let id = res[0].order_id
   
    res[0].order_id += 1
    res[0].save() 
    return ++id
  }
}

export async function getorderstatid () {
  let res = await Orderstatcounter.find()
  if (res.length == 0) {
    let orderstatid = new Orderstatcounter()
    orderstatid.orderstat_id = 222
    await orderstatid.save()
    return 222
  } else {
    let id = res[0].orderstat_id
   
    res[0].orderstat_id += 1
    res[0].save() 
    return ++id
  }
}

export async function changeorderstat (orderid) {
  let res = await Order.findOne({ order_id: orderid })

  if (res==null) {
    return 0
  } else {
    res.order_stat = 'active'
    await res.save()
    return res
  }
}

export async function getvaccountdet (vaccount) {
  var dataString1 =
    '{"contract":"' +
    process.env.contract +
    '","scope":"' +
    process.env.contract +
    '","table":"' +
    process.env.vaccount_table +
    '","key":"' +
    vaccount +
    '"}'
  var options = {
    url: process.env.get_table_row,
    method: 'POST',
    body: dataString1
  }
 
  let res = await rp(options)
  res = JSON.parse(res)
  return res
}

export async function updateexchange (account_name, amount, operation) {
  try {
    let res = await Userbalance.findOne({ user: account_name })
    console.log("response1==",res)
    if (operation == 'transfer') {
     
      if (res!=null) {
        
        let blc =
          parseFloat(res.balance.split(' ')[0]) -
          parseFloat(amount.split(' ')[0])
        res.balance = blc.toFixed(4).toString() + ' EOS'
        res.lease_out =
          (
            parseFloat(res.lease_out.split(' ')[0]) +
            parseFloat(amount.split(' ')[0])
          )
            .toFixed(4)
            .toString() + ' EOS'
        await res.save()
      } else {
        let balance = await api.rpc.get_currency_balance(
          "eosio.token",
          process.env.exchange,
          "EOS"
        )
        console.log("currency balance=",balance[0])
        if(!balance) balance = "0.0000 EOS" 
        else balance = balance[0]

        let exchngeblc = new Userbalance()
        exchngeblc.user = account_name
        exchngeblc.balance = balance
        exchngeblc.lease_out = amount
        exchngeblc.save()
      }
    } else if (operation == 'withdraw') {
      console.log("else")
      if (res!=null) {
        let balance = await api.rpc.get_currency_balance(
          'eosio.token',
          process.env.exchange,
          "EOS"
        )
        if(balance)
        {
        res.balance = balance[0]
        res.lease_out = '0.0000 EOS'
        await res.save()
        }
        
      }
    }
  } catch (err) {
    console.log("error--",err)
  }
}

export async function getcurrencybalance (account) {
  let balance = await api.rpc.get_currency_balance(
    'eosio.token',
    process.env.exchange,
    "EOS"
  )

  return balance
}
