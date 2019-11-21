'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushtrx = pushtrx;
exports.getid = getid;
exports.getorderstatid = getorderstatid;
exports.changeorderstat = changeorderstat;
exports.getaccountblc = getaccountblc;
exports.updateexchange = updateexchange;
var dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var _require = require('eosjs'),
    Api = _require.Api,
    JsonRpc = _require.JsonRpc,
    RpcError = _require.RpcError;

var _require2 = require('eosjs/dist/eosjs-jssig'),
    JsSignatureProvider = _require2.JsSignatureProvider;

var fetch = require('isomorphic-fetch');

var _require3 = require('text-encoding'),
    TextEncoder = _require3.TextEncoder,
    TextDecoder = _require3.TextDecoder;

var Order = require('../model/order.model');
var Orderstat = require('../model/orderstatus.model');
var Ordercounter = require('../model/orderidcounter.model');
var Orderstatcounter = require('../model/orderstatcounter.model');
var Userbalance = require('../model/userexchangeblc.model');

var signatureProvider = new JsSignatureProvider([
  // process.env.contract_key,
  // process.env.proxy1_key,
  // process.env.proxy2_key,
  // process.env.exchange_key
]);
var dspEndpt = 'https://kylin-dsp-2.liquidapps.io';
var rpc = new JsonRpc(dspEndpt, { fetch: fetch });
var api = new Api({
  rpc: rpc,
  signatureProvider: signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

async function pushtrx(method, data, account) {
  var resobj = {};
  try {
    var result = await api.transact({
      actions: [{
        account: account,
        name: method,
        authorization: [{
          actor: account,
          permission: 'active'
        }],
        data: data
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
    console.log('result', result);
    resobj.res = result;
    return resobj;
  } catch (err) {
    console.log('s.m. err--', err);
    return err;
  }
}

async function getid() {
  var res = await Ordercounter.findOne({}, {}, { sort: { created_at: -1 } });
  if (!res) {
    var orderid = new Ordercounter();
    orderid.order_id = 1;
    await orderid.save();
    return 1;
  } else {
    res.id = id++;
    await res.save();
    return res.id;
  }
}

async function getorderstatid() {
  var res = await Orderstatcounter.findOne({}, {}, { sort: { created_at: -1 } });
  if (!res) {
    var orderstatid = new Orderstatcounter();
    orderstatid.orderstat_id = 1;
    await orderstatid.save();
    return 1;
  } else {
    res.id = id++;
    await res.save();
    return res.id;
  }
}

async function changeorderstat(orderid) {
  var res = await Order.findOne({ id: orderid });

  if (!res) {
    return 0;
  } else {
    res.order_stat = 'active';
    await res.save();
    return res;
  }
}

async function getaccountblc(vaccount) {
  var dataString1 = '{"contract":"' + process.env.contract + '","scope":"' + process.env.contract + '","table":"' + process.env.vaccount_table + '","key":"' + vaccount + '"}';
  var options = {
    url: process.env.get_table_row,
    method: 'POST',
    body: dataString1
  };
  resobj.res = {};
  res = await rp(options);
  resobj.res = JSON.parse(res);
  console.log(res);
  return resobj;
}

async function updateexchange(account_name, amount, operation) {
  try {
    var _res = await Userbalance.findOne({ user: account_name });
    if (operation == 'transfer') {
      if (_res) {
        var blc = parseFloat(_res.balance.split(' ')[0]) - parseFloat(amount.split(' ')[0]);
        _res.balance = blc.toFixed(4).toString() + ' EOS';
        _res.lease_out = (parseFloat(_res.lease_out.split(' ')[0]) + parseFloat(amount.split(' ')[0])).toFixed(4).toString() + ' EOS';
        await _res.save();
      } else {
        var balance = await api.rpc.get_currency_balance({
          code: 'eosio.token',
          account: process.env.exchange
        });
        var exchngeblc = new Userbalance();
        exchngeblc.balance = balance;
        exchngeblc.lease_out = amount;
        exchngeblc.save();
      }
    } else if (operation == 'withdraw') {
      if (_res) {
        var _balance = await api.rpc.get_currency_balance({
          code: 'eosio.token',
          account: process.env.exchange
        });
        var _blc = parseFloat(_res.balance.split(' ')[0]) - parseFloat(_res.lease_out.split(' ')[0]);
        _res.balance = _balance;
        _res.lease_out = '0.0000 EOS';
        await _res.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
}
//# sourceMappingURL=eosaction.js.map