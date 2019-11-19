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
void createorder(name authorizer, name stake_to, asset rent_amount, asset rent_offer, uint32_t duration, std::string resource_type);
void proxytransfer(name vaccount_user, asset amount);
void matchorder(name vaccount_user, asset amount);
void staketoorder(name proxy, name stake_to, asset amount, std::string resource_type);
void checkorder(name vaccount);
void withdraw(name vaccount);
void leaseunstake(uint64_t orderid);

struct login_struct
{
  name username;
  asset balance;
  uint32_t lease_period;
  name vote_choice;
  
  EOSLIB_SERIALIZE(login_struct, (username)(balance)(lease_period)(vote_choice))
};

[[eosio::action]] void registeracc(login_struct payload);

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
typedef dapp::multi_index<"orders"_n, orders> orders_tab;
typedef eosio::multi_index<".orders"_n, orders> orders_v_abi;

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
typedef dapp::multi_index<"leasestat"_n, lease_status> lease_status_tab;
typedef eosio::multi_index<".leasestat"_n, lease_status> lease_status_v_abi;

TABLE lender
{
  name username;
  asset balance;
  uint32_t max_lease_period;
  name vote_choice;
  time_point_sec last_lease_out;
  asset total_leaseout_amount;

  uint64_t primary_key() const { return username.value; }
};

typedef dapp::multi_index<"lenderinfo"_n, lender> lender_tab;
typedef eosio::multi_index<".lenderinfo"_n, lender> lender_tab_v_abi;

TABLE borrowerdepo
{
  name username;
  asset balance;

  uint64_t primary_key() const { return username.value; }
};

typedef dapp::multi_index<"borrowerblc"_n, borrowerdepo> borrowerdepo_tab;
typedef eosio::multi_index<".borrowerblc"_n, borrowerdepo> borrowerdepo_v_abi;

TABLE shardbucket
{
  std::vector<char> shard_uri;
  uint64_t shard;
  uint64_t primary_key() const { return shard; }
};

typedef eosio::multi_index<"lenderinfo"_n, shardbucket> lender_tab_abi;
typedef eosio::multi_index<"orders"_n, shardbucket> orders_tab_abi;
typedef eosio::multi_index<"leasestat"_n, shardbucket> lease_status_tab_abi;
typedef eosio::multi_index<"borrowerblc"_n, shardbucket> borrowerdepo_tab_abi;

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
    uint64_t primary_key() const { return eosperrex.symbol.code().raw(); }
  };

  typedef eosio::singleton<"rexeosrate"_n, rexeosrate> rexeosrate_tab;

VACCOUNTS_APPLY(((login_struct)(registeracc)))
};
//CONTRACT_END((registeracc)(regaccount)(xdcommit)(xvinit))
