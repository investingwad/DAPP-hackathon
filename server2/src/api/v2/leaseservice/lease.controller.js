let leaseController = {};
const dotenv = require("dotenv");
dotenv.config();
const fetch = require("isomorphic-fetch");

const Order = require("./model/order.model");
const Orderstat = require("./model/orderstatus.model");

const eosaction = require("./eosaction/eosaction");

const { createClient } = require("@liquidapps/dapp-client");
var client;
let dspEndpt = "https://kylin-dsp-2.liquidapps.io";
// const getClient = async () => {
//   if (client) return client
//   client = await createClient({
//     network: 'kylin',
//     httpEndpoint: dspEndpt,
//     fetch: fetch
//   })
//   return client
// }

leaseController.create = (req, res) => {
  res.status(200).send("create user");
};

leaseController.register_user = async (req, res) => {
  try {
    let client = await createClient({
      network: "kylin",
      httpEndpoint: dspEndpt,
      fetch: fetch
    });
    const service = await client.service("vaccounts", process.env.contract);
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
    res.status(200).send({ message: "Successful" });
    // lease_transfer(req.body.lease_amount);
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
};

leaseController.create_order = async (req, res) => {
  try {
    let orderid = await eosaction.getid();
    console.log("oreid received ==", orderid);
    let data = {
      id: orderid,
      authorizer: req.body.authorizer,
      stake_to: req.body.stake_to,
      rent_amount: req.body.rent_amount,
      rent_offer: req.body.rent_offer,
      duration: req.body.duration,
      resource_type: req.body.resource_type
    };
    const result = await eosaction.pushtrx(
      "createorder",
      data,
      process.env.contract,
      process.env.contract
    );
    console.log("result", result);

    let order = new Order();
    order.order_id = orderid;
    order.authorizer = req.body.authorizer;
    order.stake_to = req.body.stake_to;
    order.rent_amount = req.body.rent_amount;
    order.rent_offer = req.body.rent_offer;
    order.lease_period = req.body.duration;
    order.resource_type = req.body.resource_type;
    order.order_stat = "queue";
    order.apr =
      parseFloat(req.body.rent_offer.split(" ")[0]) /
      parseFloat(req.body.duration);

    let orderobj = await order.save();
    console.log("orderobj", orderobj);
    res.status(200).send({ message: orderobj });
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
};

leaseController.lease_transfer = async (req, res) => {
  try {
    let data = {
      from: process.env.exchange,
      to: process.env.contract,
      quantity: req.body.amount,
      memo: "1:" + req.body.account_name
    };
    const result = await eosaction.pushtrx(
      "transfer",
      data,
      "eosio.token",
      process.env.exchange
    );
    console.log("result", result);
    let updateexchange = await eosaction.updateexchange(
      req.body.account_name,
      req.body.amount,
      "transfer"
    );
    res.status(200).send({ message: "Successfully transferred" });
  } catch (err) {
    console.log("s.m. err--", err);
    let msg = err.toString().split(":");
    if (msg) {
      let errmsg = msg[msg.length - 1];
      res.status(400).send({ message: errmsg });
    } else {
      res.status(400).send({ message: "Error while transferring" });
    }
  }
};

leaseController.match_order = async (req, res) => {
 
  try {
    let orders = await Order.aggregate([
      { $match: { order_stat: "queue" } },
      { $sort: { apr: -1 } }
    ]);

    let vaccount_det = await eosaction.getvaccountdet(req.body.account_name);
    console.log("orders, vaccounts =", orders, vaccount_det);
    let orderid = 0;
    let flag = 0;
    let duration_lease = 0
    orders.every(function(element, index) {
      console.log("element", element);

      if (
        element.lease_period <= vaccount_det.row.max_lease_period &&
        parseFloat(element.rent_amount.split(" ")[0]) <=
          parseFloat(vaccount_det.row.balance.split(" ")[0])
      ) {
        orderid = element.order_id;
        duration_lease = element.lease_period
        flag = 1;
        return false;
      } else return true;
    });
    console.log("flag ==", flag);
    console.log("id selected received ==", orderid);
    if (flag == 1) {
      let order_stat_id = await eosaction.getorderstatid();
      console.log("id received==", order_stat_id);
      //
      // console.log("orderobj",orderobj)
      // if (orderobj) {
      let data = {
        vaccount: req.body.account_name,
        id: orderid,
        orderstat_id: order_stat_id
      };
      const result = await eosaction.pushtrx(
        "checkorder",
        data,
        process.env.contract,
        process.env.contract
      );
      console.log("trx =", result);
      let orderobj = await eosaction.changeorderstat(orderid);
      let filled_at = new Date();
      let duration = filled_at.setDate(filled_at.getDate() + duration_lease);

      let orderstat = new Orderstat();
      orderstat.orderstat_id = order_stat_id;
      orderstat.order_id = orderid;
      orderstat.lender = req.body.account_name;
      orderstat.authorizer = orderobj.authorizer;
      orderstat.stake_to = orderobj.stake_to;
      orderstat.rent_amount = orderobj.rent_amount;
      orderstat.rent_fee = orderobj.rent_offer;
      orderstat.expires_at = new Date(duration).toISOString().split(".")[0];
      orderstat.filled_at = new Date().toISOString().split(".")[0];

      let ordderstatres = await orderstat.save();
      res.status(200).send(ordderstatres);
      //}
    } else {
      res
        .status(200)
        .send({ message: "At present no match found for this lease request" });
    }
  } catch (err) {
    console.log("s.m. err--", err);
    let msg = err.toString().split(":");
    if (msg) {
      let errmsg = msg[msg.length - 1];
      res.status(400).send({ message: errmsg });
    } else {
      res.status(400).send({ message: "Error while transferring" });
    }
  }
};

leaseController.withdraw = async (req, res) => {
  try {
    let data = {
      vaccount: req.body.account_name
    };
    const result = await eosaction.pushtrx(
      "withdraw",
      data,
      process.env.contract,
      process.env.contract,
    );
    console.log("result", result);
    let updateexchange = await eosaction.updateexchange(
      req.body.account_name,
      req.body.amount,
      "withdraw"
    );
    res.status(200).send({message : "Successfully withdrawn lease-out request"});
  } catch (err) {
    console.log("s.m. err--", err);
    let msg = err.toString().split(":");
    if (msg) {
      let errmsg = msg[msg.length - 1];
      res.status(400).send({ message: errmsg });
    } else {
      res.status(400).send({ message: "Error while transferring" });
    }
  }
};

leaseController.cancelorder = async (req, res) => {
  try {
    let data = {
      orderid: req.body.order_id
    };
    const result = await eosaction.pushtrx(
      "cancelorder",
      data,
      process.env.contract,
      process.env.contract
    );
    console.log("result", result);
    let order = await Order.findOne({ order_id: req.body.order_id })
      .remove()
      .exec();

    res.status(200).send({message: "Successfully withdrawn order request"});
  } catch (err) {
    console.log("s.m. err--", err);
    let msg = err.toString().split(":");
    if (msg) {
      let errmsg = msg[msg.length - 1];
      res.status(400).send({ message: errmsg });
    } else {
      res.status(400).send({ message: "Error while transferring" });
    }
  }
};

leaseController.leaseunstake = async (req, res) => {
  try {
    let data = {
      orderid: req.body.order_stat_id
    };
    const result = await eosaction.pushtrx(
      "leaseunstake",
      data,
      process.env.contract,
      process.env.contract,
    );
    console.log("result", result);
    let order = await Orderstat.findOne({ id: req.body.order_stat_id });
    if (order) {
      await Order.findOne({ order_id: order.order_id })
        .remove()
        .exec();
      await order.remove();
      res.status(400).send("Successfully unstaked");
    }
  } catch (err) {
    console.log("s.m. err--", err);
    let msg = err.toString().split(":");
    if (msg) {
      let errmsg = msg[msg.length - 1];
      res.status(400).send({ message: errmsg });
    } else {
      res.status(400).send({ message: "Error while transferring" });
    }
  }
};

leaseController.get_orderdet = async (req, res) => {
  try {
    let order = await Order.find({});
    if (order) {
      res.status(200).send(order);
    } else {
      res.status(200).send("no order details found");
    }
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
};

leaseController.get_orderstatdet = async (req, res) => {
  try {
    let orderstat = await Orderstat.find({});
    if (orderstat) {
      res.status(200).send(orderstat);
    } else {
      res.status(200).send("no order details found");
    }
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
};

leaseController.get_accountblc = async (req, res) => {
  try {
    let balance = await eosaction.getcurrencybalance(req.params.vaccount)
    let vaccount_blc = await eosaction.getvaccountdet(req.params.vaccount);
    let respobj = {};
    respobj.user_exchange_blc = balance[0];
    if (vaccount_blc.row) {
      respobj.userblc_leased_out = vaccount_blc.row.balance;
      respobj.userblc_staked = vaccount_blc.row.total_leaseout_amount;
    } else respobj.user_leased_out = "0.0000 EOS";
    res.status(200).send(respobj);
  } catch (err) {
    console.log("error-->", err);
    res.status(400).send(err);
  }
};

export default leaseController;
/// //////////////
