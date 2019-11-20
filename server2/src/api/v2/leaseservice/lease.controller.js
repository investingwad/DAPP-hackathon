let leaseController = {}
const dotenv = require('dotenv')
dotenv.config()
const fetch = require('isomorphic-fetch')

const Order = require('./model/order.model')
const Orderstat = require('./model/orderstatus.model')

const eosaction = require('./eosaction/eosaction')

const { createClient } = require('@liquidapps/dapp-client')
var client
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
  res.status(200).send('create user')
}

leaseController.register_user = async (req, res) => {
  try {
    let client = await createClient({
      network: 'kylin',
      httpEndpoint: dspEndpt,
      fetch: fetch
    })
    const service = await client.service(
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
}

leaseController.create_order = async (req, res) => {
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
}

leaseController.lease_transfer = async (req, res) => {
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
}

leaseController.match_order = async (req, res) => {
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
}

leaseController.withdraw = async (req, res) => {
  try {
    let data = {
      vaccount: req.body.account_name
    }
    const result = await eosaction.pushtrx(
      'withdraw',
      data,
      process.env.contract
    )
    console.log('result', result)

    res.status(400).send('Successfully withdrawn lease-out request')
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
}

leaseController.cancelorder = async (req, res) => {
  try {
    let data = {
      orderid: req.body.order_id
    }
    const result = await eosaction.pushtrx(
      'withdraw',
      data,
      process.env.contract
    )
    console.log('result', result)
    let order = await Order.findOne({ id: order_id })
      .remove()
      .exec()

    res.status(400).send('Successfully withdrawn order request')
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
}

leaseController.leaseunstake = async (req, res) => {
  try {
    let data = {
      orderid: req.body.order_stat_id
    }
    const result = await eosaction.pushtrx(
      'leaseunstake',
      data,
      process.env.contract
    )
    console.log('result', result)
    let order = await Orderstat.findOne({ id: req.body.order_stat_id })
    if (order) {
      await Order.findOne({ id: order.order_id })
        .remove()
        .exec()
      await order.remove()
      res.status(400).send('Successfully unstaked')
    }
  } catch (err) {
    console.log('error-->', err)
    res.status(400).send(err)
  }
}

export default leaseController
/// //////////////
