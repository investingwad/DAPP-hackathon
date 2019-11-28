'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var leaseController = {};
var dotenv = require('dotenv');
dotenv.config();
var fetch = require('isomorphic-fetch');

var Order = require('./model/order.model');
var Orderstat = require('./model/orderstatus.model');
var Userkey = require('./model/userkeys.model');
var errorhandler = require('./errorhandler');
var eosaction = require('./eosaction/eosaction');

var _require = require('eosjs-ecc'),
    PrivateKey = _require.PrivateKey,
    PublicKey = _require.PublicKey,
    Signature = _require.Signature,
    Aes = _require.Aes,
    key_utils = _require.key_utils,
    config = _require.config;

var _require2 = require('@liquidapps/dapp-client'),
    createClient = _require2.createClient;

var client;
var dspEndpt = 'https://kylin-dsp-2.liquidapps.io';
// const getClient = async () => {
//   if (client) return client
//   client = await createClient({
//     network: 'kylin',
//     httpEndpoint: dspEndpt,
//     fetch: fetch
//   })
//   return client
// }

leaseController.create = function (req, res) {
  res.status(200).send('create user');
};

leaseController.register_user = async function (req, res) {
  if (!req.body.lease_amount || !req.body.lease_period || !req.body.vote_choice || !req.body.account_name) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }
  try {
    var _client = await createClient({
      network: 'kylin',
      httpEndpoint: dspEndpt,
      fetch: fetch
    });
    var service = await _client.service('vaccounts', process.env.contract);
    var prv_key = await PrivateKey.randomKey();
    prv_key = prv_key.toWif();
    console.log(prv_key);
    var pubkey = PrivateKey.fromString(prv_key).toPublic().toString();
    console.log(pubkey);
    var response_reg = await service.push_liquid_account_transaction(process.env.contract, prv_key, 'regaccount', {
      vaccount: req.body.account_name // process.env.user1 // increment to new account if fails
    });
    console.log('response_reg', response_reg);

    var response_registeraction = await service.push_liquid_account_transaction(process.env.contract, prv_key, 'registeracc', {
      vaccount: req.body.account_name, // process.env.user1,
      balance: req.body.lease_amount,
      lease_period: req.body.lease_period,
      vote_choice: req.body.vote_choice
    });
    console.log('response_registeraction', response_registeraction);
    var userkeys = new Userkey();
    userkeys.user = req.body.account_name;
    userkeys.private = prv_key;
    userkeys.public = pubkey;
    await userkeys.save();
    return res.status(200).send({ message: 'Successful' });
    // lease_transfer(req.body.lease_amount);
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.create_order = async function (req, res) {
  if (!req.body.authorizer || !req.body.stake_to || !req.body.rent_amount || !req.body.rent_offer || !req.body.duration || !req.body.resource_type) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }

  try {
    var orderid = await eosaction.getid();
    console.log('oreid received ==', orderid);
    var data = {
      id: orderid,
      authorizer: req.body.authorizer,
      stake_to: req.body.stake_to,
      rent_amount: req.body.rent_amount,
      rent_offer: req.body.rent_offer,
      duration: req.body.duration,
      resource_type: req.body.resource_type
    };
    var result = await eosaction.pushtrx('createorder', data, process.env.contract, process.env.contract);
    console.log('result', result);

    var order = new Order();
    order.order_id = orderid;
    order.authorizer = req.body.authorizer;
    order.stake_to = req.body.stake_to;
    order.rent_amount = req.body.rent_amount;
    order.rent_offer = req.body.rent_offer;
    order.lease_period = req.body.duration;
    order.resource_type = req.body.resource_type;
    order.order_stat = 'queue';
    order.apr = parseFloat(req.body.rent_offer.split(' ')[0]) / parseFloat(req.body.duration);

    var orderobj = await order.save();
    console.log('orderobj', orderobj);
    return res.status(200).send({ message: orderobj });
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.lease_transfer = async function (req, res) {
  if (!req.body.amount || !req.body.account_name) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }
  try {
    var data = {
      from: process.env.exchange,
      to: process.env.contract,
      quantity: req.body.amount,
      memo: '1:' + req.body.account_name
    };
    var result = await eosaction.pushtrx('transfer', data, 'eosio.token', process.env.exchange);
    console.log('result', result);
    return res.status(200).send({ message: 'Successfully transferred' });
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.match_order = async function (req, res) {
  if (!req.body.account_name) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }

  try {
    var orders = await Order.aggregate([{ $match: { order_stat: 'queue' } }, { $sort: { apr: -1 } }]);

    var vaccount_det = await eosaction.getvaccountdet(req.body.account_name);
    if (!vaccount_det.row) {
      return res.status(400).send({ message: 'No vaccount found' });
    }
    console.log('orders, vaccounts =', orders, vaccount_det);
    var orderid = 0;
    var flag = 0;
    var duration_lease = 0;
    orders.every(function (element, index) {
      console.log('element', element);

      if (element.lease_period <= vaccount_det.row.max_lease_period && parseFloat(element.rent_amount.split(' ')[0]) <= parseFloat(vaccount_det.row.balance.split(' ')[0])) {
        orderid = element.order_id;
        duration_lease = element.lease_period;
        flag = 1;
        return false;
      } else return true;
    });
    console.log('flag ==', flag);
    console.log('id selected received ==', orderid);
    if (flag == 1) {
      var order_stat_id = await eosaction.getorderstatid();
      console.log('id received==', order_stat_id);
      //
      // console.log("orderobj",orderobj)
      // if (orderobj) {
      var data = {
        vaccount: req.body.account_name,
        id: orderid,
        orderstat_id: order_stat_id
      };
      var result = await eosaction.pushtrx('checkorder', data, process.env.contract, process.env.contract);
      console.log('trx =', result);
      var orderobj = await eosaction.changeorderstat(orderid);
      var filled_at = new Date();
      var duration = filled_at.setDate(filled_at.getDate() + duration_lease);

      var orderstat = new Orderstat();
      orderstat.orderstat_id = order_stat_id;
      orderstat.order_id = orderid;
      orderstat.lender = req.body.account_name;
      orderstat.authorizer = orderobj.authorizer;
      orderstat.stake_to = orderobj.stake_to;
      orderstat.rent_amount = orderobj.rent_amount;
      orderstat.rent_fee = orderobj.rent_offer;
      orderstat.expires_at = new Date(duration).toISOString().split('.')[0];
      orderstat.filled_at = new Date().toISOString().split('.')[0];

      var ordderstatres = await orderstat.save();
      return res.status(200).send({ message: ordderstatres });
      // }
    } else {
      return res.status(200).send({ message: 'At present no match found for this lease request' });
    }
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.withdraw = async function (req, res) {
  if (!req.body.account_name) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }
  try {
    var _client2 = await createClient({
      network: 'kylin',
      httpEndpoint: dspEndpt,
      fetch: fetch
    });
    var service = await _client2.service('vaccounts', process.env.contract);

    var userkeys = await Userkey.findOne({ user: req.body.account_name });
    console.log(userkeys);
    if (userkeys != null) {
      var response_registeraction = await service.push_liquid_account_transaction(process.env.contract, userkeys.private, 'withdraw', {
        vaccount: req.body.account_name // process.env.user1,
      });
      console.log('response_registeraction', response_registeraction);
      return res.status(200).send({ message: 'Successfully withdrawn lease-out request' });
    } else {
      return res.status(400).send({ message: 'No private key found for this vaccount' });
    }
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.cancelorder = async function (req, res) {
  if (!req.body.order_id) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }
  try {
    var data = {
      orderid: req.body.order_id
    };
    var result = await eosaction.pushtrx('cancelorder', data, process.env.contract, process.env.contract);
    console.log('result', result);
    var order = await Order.findOne({ order_id: req.body.order_id }).remove().exec();

    return res.status(200).send({ message: 'Successfully withdrawn order request' });
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.leaseunstake = async function (req, res) {
  if (!req.body.order_stat_id) {
    return res.status(400).send({ message: 'Missing required body parameter' });
  }
  try {
    var data = {
      orderid: req.body.order_stat_id
    };
    var result = await eosaction.pushtrx('leaseunstake', data, process.env.contract, process.env.contract);
    console.log('result', result);
    var order = await Orderstat.findOne({ id: req.body.order_stat_id });
    if (order) {
      await Order.findOne({ order_id: order.order_id }).remove().exec();
      await order.remove();
      return res.status(200).send({ message: 'Successfully unstaked' });
    }
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.get_orderdet = async function (req, res) {
  if (!req.params.authorizer) {
    return res.status(400).send({ message: 'Missing required parameter' });
  }
  try {
    var order = await Order.find({ authorizer: req.params.authorizer });
    if (order) {
      return res.status(200).send({ message: order });
    } else {
      return res.status(400).send({ message: 'no order details found' });
    }
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.get_orderstatdet = async function (req, res) {
  try {
    var orderstat = await Orderstat.find({});
    if (orderstat) {
      return res.status(200).send({ message: orderstat });
    } else {
      return res.status(400).send({ message: 'no order status details found' });
    }
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

leaseController.get_accountblc = async function (req, res) {
  if (!req.params.vaccount) {
    return res.status(400).send({ message: 'Missing required parameter' });
  }
  try {
    var vaccount_blc = await eosaction.getvaccountdet(req.params.vaccount);
    var vaccount_history = await eosaction.getvaccounthistory(req.params.vaccount);
    var respobj = {};
    if (vaccount_blc.row) {
      respobj.userblc_leaseout = vaccount_blc.row.balance;
      respobj.userblc_totalstaked = vaccount_blc.row.total_leaseout_amount;
      respobj.userblc_totalreward = vaccount_blc.row.total_reward_amount;
    } else if (vaccount_history.row) {
      respobj.userblc_leaseout_history = vaccount_history.row.balance;
    } else respobj.userblc_leaseout = '0.0000 EOS';
    return res.status(200).send({ message: respobj });
  } catch (err) {
    var errmsg = await errorhandler.smartcontracterr(err);
    return res.status(400).send(errmsg);
  }
};

exports.default = leaseController;
/// //////////////
//# sourceMappingURL=lease.controller.js.map