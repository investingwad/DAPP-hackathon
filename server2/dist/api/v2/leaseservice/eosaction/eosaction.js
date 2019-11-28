'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushtrx = pushtrx;
exports.getid = getid;
exports.getorderstatid = getorderstatid;
exports.changeorderstat = changeorderstat;
exports.getvaccountdet = getvaccountdet;
exports.getvaccounthistory = getvaccounthistory;
exports.updateexchange = updateexchange;
exports.getcurrencybalance = getcurrencybalance;
var dotenv = require('dotenv');
dotenv.config();
var rp = require('request-promise');

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

var signatureProvider = new JsSignatureProvider([process.env.contract_key, process.env.proxy1_key, process.env.proxy2_key, process.env.exchange_key]);
var dspEndpt = 'https://kylin-dsp-2.liquidapps.io';
var rpc = new JsonRpc(dspEndpt, { fetch: fetch });
var api = new Api({
  rpc: rpc,
  signatureProvider: signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

async function pushtrx(method, data, account, actor) {
  var result = await api.transact({
    actions: [{
      account: account,
      name: method,
      authorization: [{
        actor: actor,
        permission: 'active'
      }],
      data: data
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30
  });

  return result;
}

async function getid() {
  var res = await Ordercounter.find();
  console.log("ghg", res[0]);
  if (res.length == 0) {
    var orderid = new Ordercounter();
    orderid.order_id = 111;
    await orderid.save();
    return 111;
  } else {
    var id = res[0].order_id;

    res[0].order_id += 1;
    res[0].save();
    return ++id;
  }
}

async function getorderstatid() {
  var res = await Orderstatcounter.find();
  if (res.length == 0) {
    var orderstatid = new Orderstatcounter();
    orderstatid.orderstat_id = 222;
    await orderstatid.save();
    return 222;
  } else {
    var id = res[0].orderstat_id;

    res[0].orderstat_id += 1;
    res[0].save();
    return ++id;
  }
}

async function changeorderstat(orderid) {
  var res = await Order.findOne({ order_id: orderid });

  if (res == null) {
    return 0;
  } else {
    res.order_stat = 'active';
    await res.save();
    return res;
  }
}

async function getvaccountdet(vaccount) {

  try {
    var dataString1 = '{"contract":"' + process.env.contract + '","scope":"' + process.env.contract + '","table":"' + process.env.vaccount_table + '","key":"' + vaccount + '"}';
    var options = {
      url: process.env.get_table_row,
      method: 'POST',
      body: dataString1
    };

    var res = await rp(options);
    res = JSON.parse(res);
    return res;
  } catch (err) {
    var _res = {};
    return _res;
  }
}

async function getvaccounthistory(vaccount) {
  try {
    var dataString1 = '{"contract":"' + process.env.contract + '","scope":"' + process.env.contract + '","table":"' + process.env.vaccount_history + '","key":"' + vaccount + '"}';
    var options = {
      url: process.env.get_table_row,
      method: 'POST',
      body: dataString1
    };

    var res = await rp(options);
    res = JSON.parse(res);
    return res;
  } catch (err) {
    var _res2 = {};
    return _res2;
  }
}

async function updateexchange(account_name, amount, operation) {
  try {
    var res = await Userbalance.findOne({ user: account_name });
    console.log("response1==", res);
    if (operation == 'transfer') {

      if (res != null) {

        var blc = parseFloat(res.balance.split(' ')[0]) - parseFloat(amount.split(' ')[0]);
        res.balance = blc.toFixed(4).toString() + ' EOS';
        res.lease_out = (parseFloat(res.lease_out.split(' ')[0]) + parseFloat(amount.split(' ')[0])).toFixed(4).toString() + ' EOS';
        await res.save();
      } else {
        var balance = await api.rpc.get_currency_balance("eosio.token", process.env.exchange, "EOS");
        console.log("currency balance=", balance[0]);
        if (!balance) balance = "0.0000 EOS";else balance = balance[0];

        var exchngeblc = new Userbalance();
        exchngeblc.user = account_name;
        exchngeblc.balance = balance;
        exchngeblc.lease_out = amount;
        exchngeblc.save();
      }
    } else if (operation == 'withdraw') {
      console.log("else");
      if (res != null) {
        var _balance = await api.rpc.get_currency_balance('eosio.token', process.env.exchange, "EOS");
        if (_balance) {
          res.balance = _balance[0];
          res.lease_out = '0.0000 EOS';
          await res.save();
        }
      }
    }
  } catch (err) {
    console.log("error--", err);
  }
}

async function getcurrencybalance(account) {
  var balance = await api.rpc.get_currency_balance('eosio.token', process.env.exchange, "EOS");

  return balance;
}
//# sourceMappingURL=eosaction.js.map