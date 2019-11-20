'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var bridgeController = {};
var dotenv = require('dotenv');
dotenv.config();
var config = require('../configpath');
var actiontask = require('../eosaction');
var erroraction = require('../errorhandler');
var btoa = require('btoa');
var axios = require('axios');

var _require = require('eos-auth'),
    OreId = _require.OreId;

var request = require('request');
var keccak256 = require('js-sha3').keccak256;
var oreId = new OreId({
  appName: process.env.APP_NAME,
  appId: process.env.API_ID,
  apiKey: process.env.API_KEY,
  serviceKey: process.env.SERVICE_KEY,
  oreIdUrl: process.env.ORE_URL
});

bridgeController.create = function (req, res) {
  res.status(200).send('nodejs bridge , checked header');
};

bridgeController.signup = async function (req, res) {
  var totaltime = Date.now();
  if (!req.body.email || !req.body.name || !req.body.pin || !req.body.account_type) {
    var errorobj = await erroraction.incompleteargs("signup", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }

  if (req.body.account_type != 'virtual' && req.body.account_type != 'native') {
    return res.status(400).send(config.errors.invalidacc_type);
  }

  try {
    var user = {
      accountType: req.body.account_type,
      email: req.body.email,
      name: req.body.name,
      userPassword: req.body.pin
    };

    var _ref = await oreId.custodialNewAccount(user),
        accountName = _ref.accountName;

    var userdata = await oreId.getUser(accountName);
    console.log('accn name-> ', userdata);
    var respobj = {};
    var main_acc_name = void 0;
    if (req.body.account_type == 'native') {
      var permobj = userdata.permissions.find(function (o) {
        return o.chainNetwork === process.env.chainNetwork;
      });

      respobj.main_account_name = permobj.chainAccount;
      main_acc_name = permobj.chainAccount;
    }
    /////////////////////////////////
    var authorization = [];
    var chainAcc = void 0;
    var main_accname = void 0;
    if (req.body.account_type == 'virtual') {
      chainAcc = process.env.moonservicecontract;
      main_accname = accountName;
      authorization = [{
        actor: process.env.moonservicecontract,
        permission: accountName
      }];
    } else {
      main_accname = main_acc_name;
      chainAcc = main_acc_name;
      authorization = [{
        actor: main_acc_name,
        permission: process.env.apppermission
      }];
    }
    var transactionJson = {
      account: process.env.contract,
      name: 'logintrack',
      authorization: authorization,
      data: {
        username: accountName,
        acctype: req.body.account_type,
        main_accname: main_accname
      }
    };

    var encoded = btoa(JSON.stringify(transactionJson));
    console.log('encoded-', encoded);
    var timestamp = Date.now();
    var oreresp = await axios.post('https://service.oreid.io/api/custodial/sign', {
      account: accountName,
      chain_account: chainAcc,
      transaction: encoded,
      broadcast: false,
      chain_network: process.env.chainNetwork,
      user_password: req.body.pin
    }, { headers: config.headers });
    console.log("time taken by ORE---", Date.now() - timestamp);
    // console.log(oreresp.data.signed_transaction)
    var finalres = await actiontask.serializetrx(oreresp.data.signed_transaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      respobj.account_name = accountName;
      console.log("total time taken ---", Date.now() - totaltime);
      return res.status(200).send(respobj);
    } else if (finalres.err) {
      return res.status(400).send(finalres.err);
    }
    ////////////////////////////////////
  } catch (err) {
    console.log('err--', err);
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }
};
bridgeController.login = async function (req, res) {
  var totaltime = Date.now();
  if (!req.body.account_name || !req.body.pin || !req.body.account_type) {
    var errorobj = await erroraction.incompleteargs("login", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }
  if (req.body.account_type != 'virtual' && req.body.account_type != 'native') {
    return res.status(400).send(config.errors.invalidacc_type);
  }

  if (req.body.account_type == 'native' && !req.body.main_account_name) {
    return res.status(400).send(config.errors.missing_main_accname);
  }

  try {
    var resp = await oreId.getUser(req.body.account_name);
    var permobj = resp.permissions.find(function (o) {
      return o.chainNetwork === process.env.chainNetwork;
    });
    if (req.body.account_type == 'virtual') {
      if (!permobj.accountType) {
        if (permobj.publicKey) {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      } else {
        if (permobj.accountType != "nested") {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      }
    } else {
      if (!permobj.accountType) {
        if (!permobj.publicKey) {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      } else {
        if (permobj.accountType != "chain") {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      }
    }

    // console.log('--', resp)
  } catch (err) {
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }

  try {
    var authorization = [];
    var chainAcc = void 0;
    var main_accname = void 0;
    if (req.body.account_type == 'virtual') {
      chainAcc = process.env.moonservicecontract;
      main_accname = req.body.account_name;
      authorization = [{
        actor: process.env.moonservicecontract,
        permission: req.body.account_name
      }];
    } else {
      main_accname = req.body.main_account_name;
      chainAcc = req.body.main_account_name;
      authorization = [{
        actor: req.body.main_account_name,
        permission: process.env.apppermission
      }];
    }
    var transactionJson = {
      account: process.env.contract,
      name: 'logintrack',
      authorization: authorization,
      data: {
        username: req.body.account_name,
        acctype: req.body.account_type,
        main_accname: main_accname
      }
    };

    var encoded = btoa(JSON.stringify(transactionJson));
    console.log('encoded-', encoded);
    var timestamp = Date.now();
    var oreresp = await axios.post('https://service.oreid.io/api/custodial/sign', {
      account: req.body.account_name,
      chain_account: chainAcc,
      transaction: encoded,
      broadcast: false,
      chain_network: process.env.chainNetwork,
      user_password: req.body.pin
    }, { headers: config.headers });
    console.log("time taken by ORE---", Date.now() - timestamp);

    var finalres = await actiontask.serializetrx(oreresp.data.signed_transaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      var respobj = {};
      respobj.transaction_id = finalres.res.transaction_id;
      respobj.issuccessful = true;
      console.log("total time taken ---", Date.now() - totaltime);
      return res.status(200).send(respobj);
    } else if (finalres.err) {
      return res.status(400).send(finalres.err);
    }

    /////////////////////////////////
  } catch (err) {
    var errobj = {};
    var _errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', _errmsg);
    return res.status(400).send(_errmsg);
  }
};

bridgeController.generate_claim = async function (req, res) {
  if (!req.body.claim_id || !req.body.account_name || !req.body.claim_data || !req.body.attribute_key || !req.body.pin || !req.body.account_type) {
    var errorobj = await erroraction.incompleteargs("claim", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }

  if (req.body.account_type != 'virtual' && req.body.account_type != 'native') {
    return res.status(400).send(config.errors.invalidacc_type);
  }

  if (req.body.account_type == 'native' && !req.body.main_account_name) {
    return res.status(400).send(config.errors.missing_main_accname);
  }

  try {
    var resp = await oreId.getUser(req.body.account_name);
    var permobj = resp.permissions.find(function (o) {
      return o.chainNetwork === process.env.chainNetwork;
    });
    if (req.body.account_type == 'virtual') {
      if (!permobj.accountType) {
        if (permobj.publicKey) {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      } else {
        if (permobj.accountType != "nested") {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      }
    } else {
      if (!permobj.accountType) {
        if (!permobj.publicKey) {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      } else {
        if (permobj.accountType != "chain") {
          return res.status(400).send(config.errors.wrong_acc_type);
        }
      }
    }

    console.log('--', resp);
  } catch (err) {
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }

  var headers = config.headers;
  try {
    var authorization = [];
    var chainAcc = void 0;
    var main_accname = void 0;
    if (req.body.account_type == 'virtual') {
      main_accname = req.body.account_name;
      chainAcc = process.env.moonservicecontract;
      authorization = [{
        actor: process.env.moonservicecontract,
        permission: req.body.account_name
      }];
    } else {
      main_accname = req.body.main_account_name;
      chainAcc = req.body.main_account_name;
      authorization = [{
        actor: req.body.main_account_name,
        permission: process.env.apppermission
      }];
    }
    var hash = keccak256(JSON.stringify(req.body.claim_data));
    console.log(hash);

    var transactionJson = {
      account: process.env.contract,
      name: 'claimhash',
      authorization: authorization,
      data: {
        username: req.body.account_name,
        hash: hash,
        attribute_key: req.body.attribute_key,
        witness: process.env.contract,
        witness_action: "",
        claim_id: req.body.claim_id,
        acctype: req.body.account_type,
        main_accname: main_accname
      }
    };
    var transaction = {
      provider: 'custodial',
      returnSignedTransaction: true,
      chainNetwork: process.env.chainNetwork,
      chainAccount: chainAcc,
      account: req.body.account_name,
      broadcast: false,
      transaction: transactionJson,
      userPassword: req.body.pin
    };

    var _ref2 = await oreId.sign(transaction),
        signedTransaction = _ref2.signedTransaction;

    var finalres = await actiontask.serializetrx(signedTransaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      var respobj = {};
      respobj.transaction_id = finalres.res.transaction_id;
      respobj.claim_id = req.body.claim_id;
      return res.status(200).send(respobj);
    } else if (finalres.err) {
      if (finalres.err.errcode == '2001') {
        finalres.err.message = 'Violation of unique key constraint : claim_id already exists';
      }
      return res.status(400).send(finalres.err);
    }
  } catch (err) {
    console.log('err-', err);
    var errobj = {};
    var _errmsg2 = await erroraction.oreerr(err);
    console.log('ore. err--', _errmsg2);
    return res.status(400).send(_errmsg2);
  }
};

bridgeController.whitelist_user = async function (req, res) {
  if (!req.body.account_name || !req.body.main_account_name) {
    var errorobj = await erroraction.incompleteargs("whitelist", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }

  try {
    var resp = await oreId.getUser(req.body.account_name);
    console.log('--', resp);
    ////////////////////////
    var permobj = resp.permissions.find(function (o) {
      return o.chainNetwork === process.env.chainNetwork;
    });
    if (permobj.chainAccount != req.body.main_account_name) {
      return res.status(400).send(config.errors.wrong_mainnet_acc);
    }

    if (!permobj.accountType) {
      if (!permobj.publicKey) {
        return res.status(400).send(config.errors.not_mainnet_acc);
      }
    } else {
      if (permobj.accountType != "chain") {
        return res.status(400).send(config.errors.not_mainnet_acc);
      }
    }
    ///////////////////////
  } catch (err) {
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }
  try {
    var transactionJson = {
      account: process.env.contract,
      name: 'addwhitelist',
      authorization: [{
        actor: process.env.contractpermissionacc,
        permission: process.env.apppermission
      }],
      data: {
        username: req.body.main_account_name
      }
    };

    var encoded = btoa(JSON.stringify(transactionJson));
    console.log(encoded);

    var oreresp = await axios.post('https://service.oreid.io/api/custodial/sign', {
      account: process.env.contractpermissionacc,
      chain_account: process.env.contractpermissionacc,
      transaction: encoded,
      broadcast: false,
      chain_network: process.env.chainNetwork,
      user_password: process.env.contractpermissionaccpin
    }, { headers: config.headers });

    var finalres = await actiontask.serializetrx(oreresp.data.signed_transaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      var respobj = {};
      respobj.transaction_id = finalres.res.transaction_id;
      respobj.issuccessful = true;
      return res.status(200).send(respobj);
    } else if (finalres.err) {
      if (finalres.err.errcode == '2001') {
        finalres.err.message = 'Violation of unique key constraint : main_account_name already whitelisted';
      }
      return res.status(400).send(finalres.err);
    }
  } catch (err) {
    var errobj = {};
    var _errmsg3 = await erroraction.oreerr(err);
    console.log('ore. err--', _errmsg3);
    return res.status(400).send(_errmsg3);
  }
};

bridgeController.verify_claimdata = async function (req, res) {
  if (!req.body.account_name || !req.body.claim_data || !req.body.claim_id || !req.body.result_id || !req.body.main_account_name || !req.body.pin) {
    var errorobj = await erroraction.incompleteargs("verifyres", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }
  try {
    var resp = await oreId.getUser(req.body.account_name);
    console.log('--', resp);
  } catch (err) {
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }
  var hash = keccak256(JSON.stringify(req.body.claim_data));
  console.log(hash);
  try {
    var _hash = keccak256(JSON.stringify(req.body.claim_data));
    console.log(_hash);

    var transactionJson = {
      account: process.env.contract,
      name: 'verifyresult',
      authorization: [{
        actor: req.body.main_account_name,
        permission: process.env.apppermission
      }],
      data: {
        username: req.body.main_account_name,
        resultid: req.body.result_id,
        claim_id: req.body.claim_id,
        hash: _hash
      }
    };
    var encoded = btoa(JSON.stringify(transactionJson));

    var oreresp = await axios.post('https://service.oreid.io/api/custodial/sign', {
      account: req.body.account_name,
      chain_account: req.body.main_account_name,
      transaction: encoded,
      broadcast: false,
      chain_network: process.env.chainNetwork,
      user_password: req.body.pin
    }, { headers: config.headers });

    var finalres = await actiontask.serializetrx(oreresp.data.signed_transaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      var respobj = {};
      var resultdata = await actiontask.eostransact(req.body.result_id);
      var is_verified = void 0;
      if (resultdata.rows.length != 0) {
        if (resultdata.rows[0].isverified) is_verified = true;else is_verified = false;
        respobj.transaction_id = finalres.res.transaction_id;
        respobj.isverified = is_verified;
        return res.status(200).send(respobj);
      } else {
        respobj.transaction_id = finalres.res.transaction_id;
        respobj.isverified = false;
        return res.status(200).send(respobj);
      }
    } else if (finalres.err) {
      if (finalres.err.errcode == '2001') {
        finalres.err.message = 'Violation of unique key constraint : result_id already exists';
      }
      return res.status(400).send(finalres.err);
    }
  } catch (err) {
    console.log('err--', err);
    var errobj = {};
    var _errmsg4 = await erroraction.oreerr(err);
    console.log('ore. err--', _errmsg4);
    return res.status(400).send(_errmsg4);
  }
};
bridgeController.get_verification_result = async function (req, res) {
  if (!req.params.result_id) {
    var errorobj = await erroraction.incompleteargs("get_verification_result", req.params);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }
  try {

    var resultdata = await actiontask.eostransact(req.params.result_id);
    console.log(resultdata);
    var resobj = {};
    var is_verified = void 0;
    if (resultdata.rows.length != 0) {
      if (resultdata.rows[0].isverified) is_verified = true;else is_verified = false;
      resobj.verification_result = is_verified;
      resobj.message = 'Verification result is ' + is_verified + ' for this resul_id ';
      return res.status(200).send(resobj);
    } else {
      resobj.verification_result = false;
      resobj.message = 'No entry for verification result found for this resul_id ';
      return res.status(200).send(resobj);
    }
  } catch (err) {
    console.log('err--', err);
    var errmsg = await config.errors.smartcontract_error.dspfetcherr;
    console.log('s.m. err--', errmsg);
    return res.status(400).send(errmsg);
  }
};

bridgeController.migrate_account = async function (req, res) {
  if (!req.body.pin || !req.body.account_name) {
    var errorobj = await erroraction.incompleteargs("migrate", req.body);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }

  try {
    var resp = await oreId.getUser(req.body.account_name);
    console.log('--', resp);
  } catch (err) {
    var errmsg = await erroraction.oreerr(err);
    console.log('ore. err--', errmsg);
    return res.status(400).send(errmsg);
  }

  try {
    var args = {
      chainNetwork: process.env.chainNetwork,
      chainAccount: req.body.account_name,
      account: req.body.account_name,
      toType: 'native',
      userPassword: req.body.pin
    };

    var result = await oreId.custodialMigrateAccount(args);
    console.log('received main accn name-> ', result.account);
    /////////////////////////////////////////////

    var transactionJson = {
      account: process.env.contract,
      name: 'migrateacc',
      authorization: [{
        actor: process.env.contractpermissionacc,
        permission: process.env.apppermission
      }],
      data: {
        username: req.body.account_name,
        main_accname: result.account
      }
    };

    var encoded = btoa(JSON.stringify(transactionJson));
    console.log(encoded);

    var oreresp = await axios.post('https://service.oreid.io/api/custodial/sign', {
      account: process.env.contractpermissionacc,
      chain_account: process.env.contractpermissionacc,
      transaction: encoded,
      broadcast: false,
      chain_network: process.env.chainNetwork,
      user_password: process.env.contractpermissionaccpin
    }, { headers: config.headers });

    var finalres = await actiontask.serializetrx(oreresp.data.signed_transaction);
    console.log('pushed result- ', finalres);
    if (finalres.res) {
      var respobj = {};
      respobj.main_account_name = result.account;
      respobj.account_name = req.body.account_name;
      return res.status(200).send(respobj);
    } else if (finalres.err) {
      return res.status(400).send(finalres.err);
    }
  } catch (err) {
    var errobj = {};
    var _errmsg5 = await erroraction.oreerr(err);
    console.log('ore. err--', _errmsg5);
    return res.status(400).send(_errmsg5);
  }
};

bridgeController.get_transaction_info = async function (req, res) {
  if (!req.params.transaction_id) {
    var errorobj = await erroraction.incompleteargs("gettransaction", req.params);
    console.log("errorobj-", errorobj);
    var str = errorobj.missingparams.join(",");
    config.errors.incompleteArgument.message = "Missing required parameters : " + str;
    return res.status(400).send(config.errors.incompleteArgument);
  }

  try {
    var trxinfo = await actiontask.getTransaction(req.params.transaction_id);
    console.log('info--', trxinfo);
    var respobj = {};

    if (trxinfo.trx.receipt.status == 'executed') {
      respobj.transaction_status = 'Submitted';
      respobj.message = 'Transaction submitted successfully. Pending for confirmation';
      console.log("expiration--", trxinfo.trx.trx.expiration);
      console.log("now time--", new Date(Date.now()).toISOString().replace(/\..+/, ''));
      if (trxinfo.block_num < trxinfo.last_irreversible_block && trxinfo.trx.trx.expiration < new Date(Date.now()).toISOString().replace(/\..+/, '')) {
        respobj.transaction_status = 'Confirmed';
        respobj.message = 'Transaction is confirmed (irreversible) successfully';
      } else if (trxinfo.block_num > trxinfo.last_irreversible_block) {
        if (trxinfo.trx.trx.expiration < new Date(Date.now()).toISOString().replace(/\..+/, '')) {
          respobj.transaction_status = 'Not confirmed';
          respobj.message = 'Transaction submitted and reaches its expiration yet not confirmed (irreversible)';
        }
      }
    } else {
      respobj.transaction_status = trxinfo.trx.receipt.status;
      respobj.message = 'Transaction is not executed successfully';
    }

    return res.status(200).send(respobj);
  } catch (err) {
    console.log('err--', err);
    var errmsg = await erroraction.smartcontracterr(err);
    console.log('s.m. err--', errmsg);
    var _respobj = {};
    if (errmsg.message == 'Transaction not found in history') {
      _respobj.transaction_status = 'Failed';
      _respobj.message = 'Transaction id not found. Transaction dropped or incorrect id.';
      return res.status(400).send(_respobj);
    } else {
      return res.status(400).send(errmsg);
    }
  }
};

/// ///////////////////////
exports.default = bridgeController;
//# sourceMappingURL=bridge.controller.js.map