const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Api, JsonRpc, RpcError } = require('eosjs')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const fetch = require('isomorphic-fetch')
const { TextEncoder, TextDecoder } = require('text-encoding')

const Order = require('../model/order.model')
const Orderstat = require('../model/orderstatus.model')
const Ordercounter = require('../model/orderidcounter.model')
const Orderstatcounter = require('../model/orderstatcounter.model')

const signatureProvider = new JsSignatureProvider([
  // process.env.contract_key,
  // process.env.proxy1_key,
  // process.env.proxy2_key,
  // process.env.exchange_key
])
let dspEndpt = 'https://kylin-dsp-2.liquidapps.io'
let rpc = new JsonRpc(dspEndpt, { fetch })
let api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
})

export async function pushtrx (method, data, account) {
  let resobj = {}
  try {
    const result = await api.transact(
      {
        actions: [
          {
            account: account,
            name: method,
            authorization: [
              {
                actor: account,
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
    console.log('result', result)
    resobj.res = result
    return resobj
  } catch (err) {
    console.log('s.m. err--', err)
    return err
  }
}

export async function getid () {
  let res = await Ordercounter.findOne({}, {}, { sort: { created_at: -1 } })
  if (!res) {
    return 1
  } else {
    res.id = id++
    await res.save()
    return res.id
  }
}

export async function getorderstatid () {
  let res = await Orderstatcounter.findOne({}, {}, { sort: { created_at: -1 } })
  if (!res) {
    return 1
  } else {
    res.id = id++
    await res.save()
    return res.id
  }
}

export async function changeorderstat (orderid) {
  let res = await Order.findOne({ id: orderid })
  
  if (!res) return 0
  else {

    res.order_stat = "active"
    await res.save()
    return res
  }
}
