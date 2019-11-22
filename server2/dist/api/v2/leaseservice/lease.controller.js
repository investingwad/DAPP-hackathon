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

var eosaction = require('./eosaction/eosaction');

var _require = require('@liquidapps/dapp-client'),
    createClient = _require.createClient;

var client;
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
  try {
    var _client = await createClient({
      network: 'kylin',
      httpEndpoint: dspEndpt,
      fetch: fetch
    });
    var service = await _client.service('vaccounts', process.env.contract);
    var response_reg = await service.push_liquid_account_transaction(process.env.contract, process.env.contract_key, 'regaccount', {
      vaccount: process.env.user1 // increment to new account if fails
    });
    console.log('response_reg', response_reg);

    var response_registeraction = await service.push_liquid_account_transaction(process.env.contract, process.env.contract_key, 'registeracc', {
      username: process.env.user1,
      balance: req.body.lease_amount,
      lease_period: req.body.lease_period,
      vote_choice: req.body.vote_choice
    });
    console.log('response_registeraction', response_registeraction);
    res.status(200).send('Successful');
    // lease_transfer(req.body.lease_amount);
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.create_order = async function (req, res) {
  try {
    var orderid = await eosaction.getid();
    var data = {
      id: orderid,
      authorizer: req.body.authorizer,
      stake_to: req.body.stake_to,
      rent_amount: req.body.rent_amount,
      rent_offer: req.body.rent_offer,
      duration: req.body.duration,
      resource_type: req.body.resource_type
    };
    var result = await eosaction.pushtrx('createorder', data, process.env.contract);
    console.log('result', result);

    var _order = new Order();
    _order.id = orderid;
    _order.authorizer = req.body.authorizer;
    _order.stake_to = req.body.stake_to;
    _order.rent_amount = req.body.rent_amount;
    _order.rent_offer = req.body.rent_offer;
    _order.duration = req.body.duration;
    _order.resource_type = req.body.resource_type;
    _order.order_stat = 'queue';
    _order.apr = parseFloat(req.body.rent_offer.split(' ')[0]) / parseFloat(req.body.duration);

    var orderobj = await _order.save();
    console.log('orderobj', orderobj);
    res.status(400).send(orderobj);
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.lease_transfer = async function (req, res) {
  try {
    var data = {
      from: process.env.exchange,
      to: process.env.contract,
      quantity: req.body.amount,
      memo: '1:' + req.body.account_name
    };
    var result = await eosaction.pushtrx('transfer', data, 'eosio.token');
    console.log('result', result);
    var updateexchange = await eosaction.updateexchange(req.body.account_name, req.body.amount, 'transfer');
  } catch (err) {
    console.log('s.m. err--', err);
  }
};

leaseController.match_order = async function (req, res) {
  var orders = await Order.aggregate([{ $match: { order_stat: 'queue' } }, { $sort: { apr: -1 } }]);

  var vaccount_det = eosaction.getvaccountdet(req.body.account_name);
  var orderid = 0;
  var flag = 0;
  orders.every(function (element, index) {
    // Do your thing, then:
    if (item.lease_period <= vaccount_det.row.lease_period && parseFloat(item.rent_amount.split(' ')[0]) <= parseFloat(vaccount_det.row.balance.split(' ')[0])) {
      orderid = item.id;
      flag = 1;
      return false;
    } else return true;
  });
  if (flag == 1) {
    var order_stat_id = await eosaction.getorderstatid();
    var orderobj = await eosaction.changeorderstat(orderid);
    if (orderobj) {
      var data = {
        vaccount: req.body.account_name,
        id: orderid,
        orderstat_id: order_stat_id
      };
      var result = await eosaction.pushtrx('checkorder', data, process.env.contract);

      var filled_at = new Date();
      var duration = filled_at.setDate(filled_at.getDate() + duration);
      sevenDaysFromNow = new Date(sevenDaysFromNow).toISOString();

      var orderstat = new Orderstat();
      orderstat.id = order_stat_id;
      orderstat.order_id = orderid;
      orderstat.lender = req.body.account_name;
      orderstat.authorizer = orderobj.authorizer;
      orderstat.stake_to = orderobj.stake_to;
      orderstat.rent_amount = orderobj.rent_amount;
      orderstat.rent_fee = orderobj.rent_offer;
      orderstat.expires_at = new Date(duration).toISOString().split('.')[0];
      orderstat.filled_at = filled_at.toISOString().split('.')[0];

      var ordderstatres = await orderstat.save();
      res.status(200).send(ordderstatres);
    }
  } else {
    res.status(200).send('At present no match found for this lease request');
  }
};

leaseController.withdraw = async function (req, res) {
  try {
    var data = {
      vaccount: req.body.account_name
    };
    var result = await eosaction.pushtrx('withdraw', data, process.env.contract);
    console.log('result', result);
    var updateexchange = await eosaction.updateexchange(req.body.account_name, req.body.amount, 'withdraw');
    res.status(400).send('Successfully withdrawn lease-out request');
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.cancelorder = async function (req, res) {
  try {
    var data = {
      orderid: req.body.order_id
    };
    var result = await eosaction.pushtrx('withdraw', data, process.env.contract);
    console.log('result', result);
    var _order2 = await Order.findOne({ id: order_id }).remove().exec();

    res.status(400).send('Successfully withdrawn order request');
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.leaseunstake = async function (req, res) {
  try {
    var data = {
      orderid: req.body.order_stat_id
    };
    var result = await eosaction.pushtrx('leaseunstake', data, process.env.contract);
    console.log('result', result);
    var _order3 = await Orderstat.findOne({ id: req.body.order_stat_id });
    if (_order3) {
      await Order.findOne({ id: _order3.order_id }).remove().exec();
      await _order3.remove();
      res.status(400).send('Successfully unstaked');
    }
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.get_orderdet = async function (req, res) {
  try {
    var _order4 = await Orderstat.find({});
    if (_order4) {
      res.status(200).send(_order4);
    } else {
      res.status(200).send('no order details found');
    }
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.get_orderstatdet = async function (req, res) {
  try {
    var orderstat = await Orderstat.find({});
    if (orderstat) {
      res.status(200).send(order);
    } else {
      res.status(200).send('no order details found');
    }
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

leaseController.get_accountblc = async function (req, res) {
  try {
    var balance = await api.rpc.get_currency_balance({
      code: 'eosio.token',
      account: process.env.exchange
    });
    var vaccount_blc = getaccountblc(req.params.vaccount);
    var respobj = {};
    respobj.user_exchange_blc = balance;
    if (vaccount_blc.res.row) {
      respobj.userblc_leased_out = vaccount_blc.res.row.balance;
      respobj.userblc_staked = vaccount_blc.res.row.total_leaseout_amount;
    } else respobj.user_leased_out = '0.0000 EOS';
    res.status(200).send(respobj);
  } catch (err) {
    console.log('error-->', err);
    res.status(400).send(err);
  }
};

exports.default = leaseController;
/// //////////////
//# sourceMappingURL=lease.controller.js.map