
#include "decfinance.hpp"

void decfinance::registeracc(login_struct payload)
{
  require_vaccount(payload.username);
  lender_tab lender(_self, _self.value);
  auto itr = lender.find(payload.username.value);
  check(itr == lender.end(), "Account already registered");

  lender.emplace(_self, [&](auto &e) {
    e.sequence = lender.available_primary_key();
    e.username = payload.username;
    e.balance = payload.balance;
    e.max_lease_period = payload.lease_period;
    e.vote_choice = payload.vote_choice;
    e.total_leaseout_amount.symbol = payload.balance.symbol;
    e.total_reward_amount.symbol = payload.balance.symbol;
  });
}

void decfinance::transfer(name payer, name reciever, asset value, std::string memo)
{
  if (reciever == _self)
  {
    vector<string> memo_split = split(memo, ":");
    if (memo_split[0] == "0") // demand side fee transfer
    {
      vector<string> order_detail = split(memo_split[1], ",");
      auto lease = std::stoi(order_detail[0]);
      asset lease_eos = asset(lease * pow(10, 4), symbol(symbol_code("EOS"), 4));
      name stake_to = name(order_detail[1].c_str());
      auto duration = std::stoi(order_detail[2]);
      std::string resource_type = order_detail[3];
      // createorder(payer, stake_to, lease_eos, value, duration, resource_type);
    }
    else if (memo_split[0] == "1") //supply side central exchange transfer
    {
      name vaccount_user = name(memo_split[1].c_str());
      modleaseblc(vaccount_user, value);
      proxytransfer(vaccount_user, value);
      //matchorder(vaccount_user, value);
    }
    else
    {
      print("in listen");
    }
    //   name user_vaccount = name(memo_split[1].c_str());
  }
}

void decfinance::modleaseblc(name vaccount_user, asset amount)
{
  lender_tab lender(_self, _self.value);
  auto itr = lender.find(vaccount_user.value);
  if (itr != lender.end())
  {
    if (itr->initial_transfer)
    {
      lender.modify(itr, get_self(), [&](auto &e) {
        e.balance += amount;
      });
    }
    else
    {
      lender.modify(itr, get_self(), [&](auto &e) {
        e.balance = amount;
        e.initial_transfer = true;
      });
    }
  }
}

void decfinance::createorder(uint64_t id, name authorizer, name stake_to, asset rent_amount, asset rent_offer, uint32_t duration, std::string resource_type)
{
  require_auth(_self);
  orders_tab order(_self, _self.value);
  order.emplace(_self, [&](auto &e) {
    e.id = id;
    e.authorizer = authorizer;
    e.stake_to = stake_to;
    e.rent_amount = rent_amount;
    e.rent_offer = rent_offer;
    e.lease_period = duration;
    e.resource_type = resource_type;
    e.order_stat = "queue";
  });
}

void decfinance::proxytransfer(name vaccount_user, asset amount)
{

  lender_tab lender(_self, _self.value);
  auto itr = lender.find(vaccount_user.value);

  if (itr != lender.end())
  {
    name proxy = itr->vote_choice;
    action(
        permission_level{get_self(), "active"_n},
        "eosio.token"_n, "transfer"_n,
        std::make_tuple(get_self(), proxy, amount, std::string("transfer to proxy ")))
        .send();
  }
}

void decfinance::matchorder(name vaccount_user, uint64_t id, uint64_t orderstat_id)
{

  lender_tab lender(_self, _self.value);
  orders_tab order(_self, _self.value);
  auto itr = lender.find(vaccount_user.value);

  if (itr != lender.end())
  {
    uint64_t orderid;
    int flag = 0;
    int apr_cal = 0;

    ///////////////////////////////////// to be calculated from backend/////
    // auto order_itr = order.begin();
    // while (order_itr != order.end())
    // {
    //   if (order_itr->order_stat == "queue" && order_itr->lease_period <= itr->max_lease_period && order_itr->rent_amount <= itr->balance)
    //   {
    //     flag = 1;
    //     if (apr_cal <= (order_itr->rent_offer.amount / order_itr->lease_period))
    //     {
    //       orderid = order_itr->id;
    //       apr_cal = order_itr->rent_offer.amount / order_itr->lease_period;
    //     }
    //   }
    //   order_itr++;
    // }
    ///////////////////////////////////////////
    // if (flag == 1)
    // {
    auto itr_orderstat = order.find(id); //orderid
    check(itr_orderstat != order.end(), "Order id not found");
    staketoorder(itr->vote_choice, itr_orderstat->stake_to, itr_orderstat->rent_amount, itr_orderstat->resource_type);

    lease_status_tab orderfill(_self, _self.value);
    orderfill.emplace(_self, [&](auto &e) {
      e.id = orderstat_id;
      e.order_id = id;
      e.lender = vaccount_user;
      e.authorizer = itr_orderstat->authorizer;
      e.stake_to = itr_orderstat->stake_to;
      e.rent_amount = itr_orderstat->rent_amount;
      e.rent_fee = itr_orderstat->rent_offer;
      e.expires_at = time_point_sec(current_time_point()) + (uint32_t)(itr_orderstat->lease_period * 24 * 60 * 60);
      e.filled_at = time_point_sec(current_time_point());
    });
    order.modify(itr_orderstat, get_self(), [&](auto &e) {
      e.order_stat = "active";
    });

    lender.modify(itr, get_self(), [&](auto &e) {
      e.balance -= itr_orderstat->rent_amount;
      e.last_lease_out = current_time_point();
      e.total_leaseout_amount += itr_orderstat->rent_amount;
    });
    // }
  }
}

void decfinance::staketoorder(name proxy, name stake_to, asset amount, std::string resource_type)
{
  asset cpu_stake;
  asset net_stake;
  if (resource_type == "cpu")
  {
    cpu_stake = amount;
    net_stake.symbol = amount.symbol;
  }
  else if (resource_type == "net")
  {
    net_stake = amount;
    cpu_stake.symbol = amount.symbol;
  }
  else
  {
    net_stake = amount / 2;
    cpu_stake = net_stake;
  }
  action(
      permission_level{proxy, "active"_n},
      "eosio"_n, "delegatebw"_n,
      std::make_tuple(proxy, stake_to, net_stake, cpu_stake, false))
      .send();
}

void decfinance::checkorder(name vaccount, uint64_t id, uint64_t orderstat_id)
{
  require_auth(_self);
  lender_tab lender(_self, _self.value);
  auto itr = lender.find(vaccount.value);
  check(itr != lender.end(), "vaccount not found");
  check(itr->initial_transfer == true, "Initial amount not transferred by vaccount user");
  matchorder(vaccount, id, orderstat_id);
}

void decfinance::withdraw(unreg_struct payload)
{
  //require_auth(_self);
  require_vaccount(payload.username);
  lender_tab lender(_self, _self.value);
  lender_history_tab lenderhistory(_self, _self.value);
  auto itr = lender.find(payload.username.value);
  check(itr != lender.end(), "vaccount not found");
  check(itr->total_leaseout_amount.amount == 0, "can not withdraw. amount leased out");
  asset amount_to_transfer = itr->balance + itr->total_reward_amount;
  auto lender_h_itr = lenderhistory.find(payload.username.value);
  if (lender_h_itr == lenderhistory.end())
  {
    lenderhistory.emplace(_self, [&](auto &e) {
      e.username = payload.username;
      e.balance = itr->balance + itr->total_reward_amount;
    });
  }
  else
  {

    lenderhistory.modify(lender_h_itr, get_self(), [&](auto &e) {
      e.balance += itr->balance + itr->total_reward_amount;
    });
  }
  lender.erase(itr);
  action(
      permission_level{itr->vote_choice, "active"_n},
      "eosio.token"_n, "transfer"_n,
      std::make_tuple(itr->vote_choice, "coldwallet12"_n, amount_to_transfer, std::string("transfer to exchange ")))
      .send();
}

void decfinance::cancelorder(uint64_t orderid)
{
  orders_tab orders(_self, _self.value);
  auto itr = orders.find(orderid);
  check(itr != orders.end(), "Order id not found");
  require_auth(_self);
  check(itr->order_stat != "active", "can not withdraw. order is active and filled");

  action(
      permission_level{_self, "active"_n},
      "eosio.token"_n, "transfer"_n,
      std::make_tuple(_self, itr->authorizer, itr->rent_offer, std::string("rent fee transfer on order withdrawl")))
      .send();
  orders.erase(itr);
}

void decfinance::leaseunstake(uint64_t orderid)
{
  orders_tab orders(_self, _self.value);
  lease_status_tab orderfill(_self, _self.value);
  auto order_itr = orderfill.find(orderid);
  check(order_itr != orderfill.end(), "Order status id not found");
  check(order_itr->expires_at <= time_point_sec(current_time_point()), "Order not expired yet");
  auto order = orders.find(order_itr->order_id);
  lender_tab lender(_self, _self.value);
  auto itr = lender.find(order_itr->lender.value);
  require_auth(itr->vote_choice);
  asset cpu_stake;
  asset net_stake;
  if (order->resource_type == "cpu")
  {
    cpu_stake = order_itr->rent_amount;
    net_stake.symbol = order_itr->rent_amount.symbol;
  }
  else if (order->resource_type == "net")
  {
    net_stake = order_itr->rent_amount;
    cpu_stake.symbol = order_itr->rent_amount.symbol;
  }
  else
  {
    net_stake = order_itr->rent_amount / 2;
    cpu_stake = net_stake;
  }
  action(
      permission_level{itr->vote_choice, "active"_n},
      "eosio"_n, "undelegatebw"_n,
      std::make_tuple(itr->vote_choice, order_itr->stake_to, net_stake, cpu_stake, false))
      .send();
  action(
      permission_level{_self, "active"_n},
      "eosio.token"_n, "transfer"_n,
      std::make_tuple(_self, itr->vote_choice, order_itr->rent_fee, std::string("transfer fee to proxy on lease expiry ")))
      .send();

  orderfill.erase(order_itr);
  orders.erase(order);

  lender.modify(itr, get_self(), [&](auto &e) {
    e.balance += order_itr->rent_amount;
    e.total_leaseout_amount -= order_itr->rent_amount;
    e.total_reward_amount += order_itr->rent_fee;
  });
}

void decfinance::addexchange(name account_name)
{
  require_auth(_self);
  exchange_tab exchanges(_self, _self.value);
  exchanges.set(exchange{account_name}, _self);
  auto state = exchanges.get();
  print(state.exchange_account);
}

void decfinance::addproxy(name account_name, std::string desc)
{
  require_auth(_self);
  proxylist_tab proxy(_self, _self.value);
  auto itr = proxy.find(account_name.value);
  check(itr == proxy.end(), "Proxy account already registered");

  proxy.emplace(_self, [&](auto &e) {
    e.pxoxy_account = account_name;
    e.proxy_name = desc;
  });
}
// void decfinance::acceptbid(name lender, uint64_t id)
// {

//   orders_filled_tab orderfill(_self, _self.value);
//   orders_tab order(_self, _self.value);
//   auto itr = order.find(id);
//   asset cpu_net_stake = itr->rent_amount / 2;
//   // delegating cpu / net
//   action(
//       permission_level{get_self(), "active"_n},
//       "eosio"_n, "delegatebw"_n,
//       std::make_tuple(get_self(), itr->username, cpu_net_stake, cpu_net_stake, false))
//       .send();

//   orderfill.emplace(_self, [&](auto &e) {
//     e.id = id;
//     e.borrower = itr->username;
//     e.lender = lender;
//     e.rent_amount = itr->rent_amount;
//     e.rent_payable = itr->rent_amount + itr->rent_offer;
//     e.expires_at = time_point_sec(current_time_point()) + (uint32_t)(itr->lease_period * 24 * 60 * 60);
//     e.filled_at = time_point_sec(current_time_point());
//   });
//   order.erase(itr);
// }

// void decfinance::movetorex(name lender)
// {
//   lender_tab vramtest(_self, _self.value);
//   rexeosrate_tab rexeos(get_self(), get_self().value);
//   auto itr = vramtest.find(lender.value);
//   if (itr != vramtest.end())
//   {
//     action(
//         permission_level{get_self(), "active"_n},
//         "eosio"_n, "buyrex"_n,
//         std::make_tuple(get_self(), itr->balance))
//         .send();

//     asset equivalent_rexamt = asset(0, symbol(symbol_code("REX"), 4));
//     equivalent_rexamt.amount = itr->balance.amount / rexeos.get().eosperrex.amount;
//     vramtest.modify(itr, get_self(), [&](auto &e) {
//       e.balance -= itr->balance;
//       e.rex_balance = equivalent_rexamt;
//     });
//   }
// }

// void decfinance::sellrexbid(name lender, asset amount)
// {
//   lender_tab vramtest(_self, _self.value);
//   rexeosrate_tab rexeos(get_self(), get_self().value);
//   auto itr = vramtest.find(lender.value);
//   if (itr != vramtest.end())
//   {
//     action(
//         permission_level{get_self(), "active"_n},
//         "eosio"_n, "sellrex"_n,
//         std::make_tuple(get_self(), itr->balance))
//         .send();

//     asset equivalent_rexamt = asset(0, symbol(symbol_code("REX"), 4));
//     equivalent_rexamt.amount = itr->balance.amount / rexeos.get().eosperrex.amount;

//     vramtest.modify(itr, get_self(), [&](auto &e) {
//       e.balance -= itr->balance;
//       e.rex_balance = equivalent_rexamt;
//     });
//   }
// }

EOSIO_DISPATCH_SVC_TRX(decfinance, (registeracc)(regaccount)(xdcommit)(xvinit)(checkorder)(withdraw)(leaseunstake)(addproxy)(addexchange)(cancelorder)(createorder))

// auto flag = 0;
//   vector<string> memo_split = split(memo, ":");
//   name user_vaccount = name(memo_split[1].c_str());
//   lender_tab vramtest(_self, _self.value);
//   auto itr = vramtest.find(user_vaccount.value);
//   if (itr != vramtest.end())
//   {
//     //check for orders

//     orders_tab order(_self, _self.value);
//     auto order_itr = order.rbegin();
//     // white(order_itr != order.end())
//     // {
//     //   if (order_itr->lease_period <= itr->lease_period && order_itr->rent_amount <= value)
//     //   {
//     //     // fill the order :- make entry in order_fill table
//     //     acceptbid(itr->username, order_itr->id);
//     //     // deduct user balance from initial deposit
//     //     vramtest.modify(itr, get_self(), [&](auto &e) {
//     //       e.balance -= order_itr->rent_amount;
//     //       e.is_leased = true;
//     //     });
//     //     flag = 1;
//     //     break;
//     //   }
//     //   itr++;
//     // }

//     // moving to rex if no order left
//     movetorex(user_vaccount);