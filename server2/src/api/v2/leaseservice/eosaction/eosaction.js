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
    let orderid = new Ordercounter()
    orderid.order_id = 1
    await orderid.save()
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
    let orderstatid = new Orderstatcounter()
    orderstatid.orderstat_id = 1
    await orderstatid.save()
    return 1
  } else {
    res.id = id++
    await res.save()
    return res.id
  }
}

export async function changeorderstat (orderid) {
  let res = await Order.findOne({ id: orderid })

  if (!res) {
    return 0
  } else {
    res.order_stat = 'active'
    await res.save()
    return res
  }
}

export async function getaccountblc (vaccount) {
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
  resobj.res = {}
  res = await rp(options)
  resobj.res = JSON.parse(res)
  console.log(res)
  return resobj
}

export async function updateexchange (account_name, amount, operation) {
  try {
    let res = await Userbalance.findOne({ user: account_name })
    if (operation == 'transfer') {
      if (res) {
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
        let balance = await api.rpc.get_currency_balance({
          code: 'eosio.token',
          account: process.env.exchange
        })
        let exchngeblc = new Userbalance()
        exchngeblc.balance = balance
        exchngeblc.lease_out = amount
        exchngeblc.save()
      }
    } else if (operation == 'withdraw') {
      if (res) {
        let balance = await api.rpc.get_currency_balance({
          code: 'eosio.token',
          account: process.env.exchange
        })
        let blc =
          parseFloat(res.balance.split(' ')[0]) -
          parseFloat(res.lease_out.split(' ')[0])
        res.balance = balance
        res.lease_out = '0.0000 EOS'
        await res.save()
      }
    }
  } catch (err) {
    console.log(err)
  }
}
