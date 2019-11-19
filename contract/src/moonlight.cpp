
#include "moonlight.hpp"

void moonlight::registeracc(login_struct payload)
{
  require_vaccount(payload.username);
  vramtest_tab vramtest(_self, _self.value);
  auto itr = vramtest.find(payload.username.value);
  check(itr == vramtest.end(), "Account already registered");

  vramtest.emplace(_self, [&](auto &e) {
    e.username = payload.username;
    e.balance = payload.balance;
    e.lease_period = payload.lease_period;
  });
}

void moonlight::transfer(name payer, name reciever, asset value, std::string memo)
{
  auto flag = 0;
  vector<string> memo_split = split(memo, ":");
  name user_vaccount = name(memo_split[1].c_str());
  vramtest_tab vramtest(_self, _self.value);
  auto itr = vramtest.find(user_vaccount);
  if (itr != vramtest.end())
  {
    //check for orders

    orders_tab order(_self, _self.value);
    auto order_itr = order.begin();
    white(order_itr != order.end())
    {
      if (order_itr->lease_period <= itr->lease_period && order_itr->rent_amount <= value)
      {
        // fill the order :- make entry in order_fill table
        acceptbid(itr->username, order_itr->id);
        // deduct user balance from initial deposit
        vramtest.modify(itr, get_self(), [&](auto &e) {
          e.balance -= order_itr->rent_amount;
          e.is_leased = true;
        });
        flag = 1;
        break;
      }
      itr++;
    }

    // moving to rex if no order left
    buyrex(user_vaccount);
  }
}

void moonlight::acceptbid(name lender, uint64_t id)
{

  orders_filled_tab orderfill(_self, _self.value);
  orders_tab order(_self, _self.value);
  auto itr = order.find(id);
  asset cpu_net_stake = itr->rent_amount / 2;
  // delegating cpu / net
   action(
       permission_level{get_self(), "active"_n},
       "eosio"_n, "delegatebw"_n,
       std::make_tuple(get_self(), itr->username, cpu_net_stake, cpu_net_stake, false)
       .send();

  orderfill.emplace(_self, [&](auto &e) {
    e.id = id;
    e.borrower = itr->username;
    e.lender = lender;
    e.rent_amount = itr->rent_amount;
    e.rent_payable = itr->rent_amount + itr->rent_offer;
    e.expires_at = time_point_sec(current_time_point()) + (uint32_t)(itr->lease_period * 24 * 60 * 60);
    e.filled_at = time_point_sec(current_time_point());
  });
  order.erase(itr);
}

void moonlight::buyrex(name lender)
{
  vramtest_tab vramtest(_self, _self.value);
  auto itr = vramtest.find(user_vaccount);
  action(
       permission_level{get_self(), "active"_n},
       "eosio"_n, "buyrex"_n,
       std::make_tuple(get_self(), itr->username, cpu_net_stake, cpu_net_stake, false)
       .send();
}