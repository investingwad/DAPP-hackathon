#define VACCOUNTS_DELAYED_CLEANUP 120

#include <eosio/eosio.hpp>
#include <eosio/print.hpp>
#include <eosio/asset.hpp>
#include <eosio/transaction.hpp>
#include <eosio/crypto.hpp>
#include <string>
#include "./dist/contracts/eos/dappservices/vaccounts.hpp"
#include "./dist/contracts/eos/dappservices/ipfs.hpp"
#include "./dist/contracts/eos/dappservices/multi_index.hpp"

#define DAPPSERVICES_ACTIONS() \
  XSIGNAL_DAPPSERVICE_ACTION \
  IPFS_DAPPSERVICE_ACTIONS \
  VACCOUNTS_DAPPSERVICE_ACTIONS
#define DAPPSERVICE_ACTIONS_COMMANDS() \
  IPFS_SVC_COMMANDS()VACCOUNTS_SVC_COMMANDS() 

#define CONTRACT_NAME() moonlight

CONTRACT_START()
// CONTRACT moonlight : public eosio::contract
// {
//   using contract::contract;

// public:
//   DAPPSERVICES_ACTIONS()


struct login_struct
{
  name username;
  asset balance;
  uint8_t lease_period;
  EOSLIB_SERIALIZE(login_struct, (username)(balance)(lease_period))
};

// struct vaccount_register
// {
//   name vaccount;
//   EOSLIB_SERIALIZE(vaccount_register, (vaccount))
// };

[[eosio::action]] void registeracc(login_struct payload);


TABLE orders
{
  uint64_t id;
  name username;
  asset rent_amount;
  asset rent_offer;
  uint8_t lease_period;


  uint64_t primary_key() const { return id; }
};
typedef dapp::multi_index<"orders"_n, orders> orders_tab;
typedef eosio::multi_index<".orders"_n, orders> orders_v_abi;

TABLE orders_filled
{
  uint64_t id;
  name borrower;
  name lender;
  asset rent_amount;
  asset rent_offer;
  uint8_t lease_period;
  time_point_sec filled_at;


  uint64_t primary_key() const { return id; }
};
typedef dapp::multi_index<"ordersfilled"_n, orders_filled> orders_filled_tab;
typedef eosio::multi_index<".ordersfilled"_n, orders_filled>orders_filled_v_abi;

TABLE vramtest
{
  name username;
  asset balance;
  uint8_t lease_period;

  uint64_t primary_key() const { return username.value; }
};

typedef dapp::multi_index<"vramtest3"_n, vramtest> vramtest_tab;
typedef eosio::multi_index<".vramtest3"_n, vramtest> vramtest_v_abi;

TABLE shardbucket
{
  std::vector<char> shard_uri;
  uint64_t shard;
  uint64_t primary_key() const { return shard; }
};

typedef eosio::multi_index<"vramtest3"_n, shardbucket> vramtestdata_tab_abi;
typedef eosio::multi_index<"orders"_n, shardbucket> orders_tab_abi;
typedef eosio::multi_index<"ordersfilled"_n, shardbucket> orders_filled_tab_abi;

vector<string>
  split(const string &str, const string &delim)
  {
    vector<string> tokens;
    size_t prev = 0, pos = 0;
    do
    {
      pos = str.find(delim, prev);
      if (pos == string::npos)
      {
        pos = str.length();
      }
      string token = str.substr(prev, pos - prev);
      tokens.push_back(token);
      prev = pos + delim.length();
    } while (pos < str.length() && prev < str.length());
    return tokens;
  }

VACCOUNTS_APPLY(((login_struct)(registeracc)))
CONTRACT_END((registeracc)(regaccount)(xdcommit)(xvinit))
