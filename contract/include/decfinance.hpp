#define VACCOUNTS_DELAYED_CLEANUP 120

#include <eosio/eosio.hpp>
#include <eosio/print.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <eosio/system.hpp>
#include <eosio/singleton.hpp>
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

#define CONTRACT_NAME() decfinance

//CONTRACT_START()
using namespace eosio;

using std::string;

CONTRACT decfinance : public eosio::contract
{
  using contract::contract;

public:
  DAPPSERVICES_ACTIONS()

  void transfer(name payer, name reciever, asset value, std::string memo);
  void proxytransfer(name vaccount_user, asset amount);
  void matchorder(name vaccount_user, uint64_t id, uint64_t orderstat_id);
  void staketoorder(name proxy, name stake_to, asset amount, std::string resource_type);
  void modleaseblc(name vaccount_user, asset amount);

  struct login_struct
  {
    name username;
    asset balance;
    uint32_t lease_period;
    name vote_choice;

    EOSLIB_SERIALIZE(login_struct, (username)(balance)(lease_period)(vote_choice))
  };

  struct test_struct
  {
    name username;

    EOSLIB_SERIALIZE(test_struct, (username))
  };

  [[eosio::action]] void registeracc(login_struct payload);
  [[eosio::action]] void checkorder(name vaccount, uint64_t id, uint64_t orderstat_id);
  [[eosio::action]] void withdraw(name vaccount);
   [[eosio::action]] void testvacc(test_struct payload);
  [[eosio::action]] void leaseunstake(uint64_t orderid);
  [[eosio::action]] void addproxy(name account_name, std::string desc);
  [[eosio::action]] void addexchange(name account);
  [[eosio::action]] void cancelorder(uint64_t orderid);
  [[eosio::action]] void createorder(uint64_t id, name authorizer, name stake_to, asset rent_amount, asset rent_offer, uint32_t duration, std::string resource_type);

  TABLE orders
  {
    uint64_t id;
    name authorizer;
    name stake_to;
    asset rent_amount;
    asset rent_offer;
    uint32_t lease_period;
    std::string resource_type;
    std::string order_stat;

    uint64_t primary_key() const { return id; }
  };
  typedef dapp::multi_index<"ordersinfo1"_n, orders> orders_tab;
  typedef eosio::multi_index<".ordersinfo1"_n, orders> orders_v_abi;

  TABLE lease_status
  {
    uint64_t id;
    uint64_t order_id;
    name lender;
    name authorizer;
    name stake_to;
    asset rent_amount;
    asset rent_fee;
    time_point_sec expires_at;
    time_point_sec filled_at;

    uint64_t primary_key() const { return id; }
  };
  typedef dapp::multi_index<"orderstat1"_n, lease_status> lease_status_tab;
  typedef eosio::multi_index<".orderstat1"_n, lease_status> lease_status_v_abi;

  TABLE lender
  {
    uint64_t sequence;
    name username;
    asset balance;
    uint32_t max_lease_period;
    name vote_choice;
    time_point_sec last_lease_out;
    asset total_leaseout_amount;
    asset total_reward_amount;
    bool initial_transfer = false;

    uint64_t primary_key() const { return username.value; }
  };

  typedef dapp::multi_index<"lenderinfo2"_n, lender> lender_tab;
  typedef eosio::multi_index<".lenderinfo2"_n, lender> lender_tab_v_abi;

  TABLE lender_history
  {
    name username;
    asset balance;
    uint64_t primary_key() const { return username.value; }
  };

  typedef dapp::multi_index<"lenderrec"_n, lender_history> lender_history_tab;
  typedef eosio::multi_index<".lenderrec"_n, lender_history> lender_history_tab_v_abi;

  TABLE proxylist
  {
    name pxoxy_account;
    std::string proxy_name;

    uint64_t primary_key() const { return pxoxy_account.value; }
  };

  typedef eosio::multi_index<"proxylist"_n, proxylist> proxylist_tab;
  //typedef eosio::multi_index<".borrowerblc"_n, borrowerdepo> borrowerdepo_v_abi;

  TABLE shardbucket
  {
    std::vector<char> shard_uri;
    uint64_t shard;
    uint64_t primary_key() const { return shard; }
  };

  typedef eosio::multi_index<"lenderinfo2"_n, shardbucket> lender_tab_abi;
  typedef eosio::multi_index<"ordersinfo1"_n, shardbucket> orders_tab_abi;
  typedef eosio::multi_index<"orderstat1"_n, shardbucket> lease_status_tab_abi;
  typedef eosio::multi_index<"lenderrec"_n, shardbucket> lender_history_tab_abi;

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
  TABLE rexeosrate
  {
    asset eosperrex;
  };

  typedef eosio::singleton<"rexeosrate"_n, rexeosrate> rexeosrate_tab;
  typedef eosio::multi_index<"rexeosrate"_n, rexeosrate> rexeosrate_dummy_abi;

  TABLE exchange
  {
    name exchange_account;
  };

  typedef eosio::singleton<"exchange"_n, exchange> exchange_tab;
  typedef eosio::multi_index<"exchange"_n, exchange> exchange_dummy_abi;

  VACCOUNTS_APPLY(((login_struct)(registeracc))((test_struct)(testvacc)))
  //VACCOUNTS_APPLY(((login_struct)(registeracc))((unreg_struct)(withdraw)))
};
//CONTRACT_END((registeracc)(regaccount)(xdcommit)(xvinit))
