'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.smartcontracterr = smartcontracterr;
exports.oreerr = oreerr;
exports.incompleteargs = incompleteargs;
var dotenv = require('dotenv');
dotenv.config();
var config = require('./configpath');

async function smartcontracterr(err) {
  // console.log("err--", err)
  var msg = err.toString().split(':');
  if (msg) {
    console.log('msg--', msg);
    var ermsg = void 0;
    var errorObj = {};
    var errmsg = msg[msg.length - 1];
    ermsg = errmsg;
    var el = msg.find(function (a) {
      return a.includes('FetchError') || a.includes('ECONNREFUSED');
    });
    var trx = msg.find(function (a) {
      return a.includes('not found in history');
    });
    var quotaerr = msg.find(function (a) {
      return a.includes(' not enough quota for this provider');
    });
    var keyexist = msg.find(function (a) {
      return a.includes('uniqueness constraint was violated');
    });
    var irreleventauth = msg.find(function (a) {
      return a.includes('action declares irrelevant authority');
    });
    if (trx) ermsg = 'TRXNOTFOUND';
    if (el) ermsg = 'econnrefused';
    if (irreleventauth) ermsg = 'irreleventauth';
    if (quotaerr) ermsg = 'quotanull';
    if (keyexist) ermsg = ' key already exists';
    switch (ermsg.toString().toLowerCase()) {
      case ' key already exists':
        console.log('key constarints');
        errorObj = config.errors.smartcontract_error.uniquekey;
        break;
      case 'econnrefused':
        console.log('connection error');
        errorObj = config.errors.smartcontract_error.smserver;
        break;
      case 'trxnotfound':
        console.log('transaction not found');
        errorObj = config.errors.smartcontract_error.trxnotfound;
        break;

      case ' transaction exceeded the current network usage limit imposed on the transaction':
        console.log('limited CPU');
        errorObj = config.errors.smartcontract_error.cpulimit;
        break;

      case ' account using more than allotted ram':
        console.log('RAM shortage');
        errorObj = config.errors.smartcontract_error.ramlimit;
        break;

      case ' invalid packed transaction':
        console.log('packed transaction');
        errorObj = config.errors.smartcontract_error.invalidtrx;
        break;
      case ' singleton does not exist':
        console.log('singleton does not exist');
        errorObj = config.errors.smartcontract_error.singletonerr;
        break;
      case ' hash validation failed':
        console.log('validation of hash failed');
        errorObj = config.errors.smartcontract_error.hashvalidation;
        break;
      case ' claim data not present':
        console.log('claim data not found');
        errorObj = config.errors.smartcontract_error.claimnotfound;
        break;
      case ' user entry not present in usertrack table':
        console.log('claim data not found');
        errorObj = config.errors.smartcontract_error.usernotfound;
        break;
      case ' whitelisted user not present':
        console.log('whitelisted user not present');
        errorObj = config.errors.smartcontract_error.whitelistnotpresent;
        break;
      case ' transaction took too long':
        console.log('transaction took too long');
        errorObj = config.errors.smartcontract_error.transactiontooklong;
        break;
      case 'quotanull':
        console.log('quota consumed');
        errorObj = config.errors.smartcontract_error.quotaerror;
        break;
      case 'irreleventauth':
        console.log('irreleventauth');
        errorObj = config.errors.smartcontract_error.irrelevantauth;
        break;
      default:
        console.log('default');
        errorObj = config.errors.smartcontract_error.default;
    }
    return errorObj;
  }
}

async function oreerr(err) {
  var ermsg = void 0;
  var errdet = void 0;
  var errorObj = {};
  console.log("err:", err);
  if (err.response.status == 400) {
    ermsg = err.response.data.error;
  } else if (err.response.status == 500) {
    ermsg = err.response.data.errorCode;
    errdet = err.response.data.errorMessage;
  }
  console.log('-->', ermsg);
  switch (ermsg.toString().toLowerCase()) {
    case 'transactionrejected':
      console.log('transaction got rejected');
      errorObj = config.errors.ORE_error.trxrejected;
      break;
    case 'econnrefused':
      console.log('key constarints');
      errorObj = config.errors.ORE_error.oreserver;
      break;
    case 'badwalletpassword':
      console.log('invalid pin');
      errorObj = config.errors.ORE_error.badWalletPassword;
      break;

    case 'useralreadyexists':
      console.log('user exist');
      errorObj = config.errors.ORE_error.userexist;
      break;

    case 'errorCreateWallet':
      console.log('Issue creating chain account permissions');
      errorObj = config.errors.ORE_error.errorcreatewallet;
      break;

    case 'error: user not found':
      console.log('user not found');
      errorObj = config.errors.ORE_error.usernotfound;
      break;

    case 'migratecustodialaccounterror':
      console.log('migrate error');
      if (errdet.includes('Invalid existing account type: native')) {
        errorObj = config.errors.ORE_error.migrate_native;
      } else if (errdet.includes("doesn't have an existing virtual account")) {
        errorObj = config.errors.ORE_error.migrate_not_virtual;
      } else if (errdet.includes("Account is already a native account")) {
        errorObj = config.errors.ORE_error.migrate_native;
      } else errorObj = config.errors.ORE_error.migrate_err;

      break;

    default:
      console.log('default');
      errorObj = config.errors.ORE_error.default;
  }
  return errorObj;
}

async function incompleteargs(method, parameter) {
  console.log('-->', method);
  var errorObj = {};
  var missingparams = [];
  switch (method) {
    case 'signup':
      console.log('signup');
      if (!parameter.email) missingparams.push('email');
      if (!parameter.name) missingparams.push('name');
      if (!parameter.pin) missingparams.push('pin');
      if (!parameter.account_type) missingparams.push('account_type');
      errorObj.missingparams = missingparams;
      break;

    case 'login':
      console.log('login');
      if (!parameter.account_name) missingparams.push('account_name');
      if (!parameter.pin) missingparams.push('pin');
      if (!parameter.account_type) missingparams.push('account_type');
      errorObj.missingparams = missingparams;
      break;

    case 'claim':
      console.log('claim');
      if (!parameter.account_name) missingparams.push('account_name');
      if (!parameter.pin) missingparams.push('pin');
      if (!parameter.account_type) missingparams.push('account_type');
      if (!parameter.claim_id) missingparams.push('claim_id');
      if (!parameter.claim_data) missingparams.push('claim_data');
      if (!parameter.attribute_key) missingparams.push('attribute_key');
      errorObj.missingparams = missingparams;
      break;

    case 'whitelist':
      console.log('whitelist');
      if (!parameter.account_name) missingparams.push('account_name');
      if (!parameter.main_account_name) missingparams.push('main_account_name');
      errorObj.missingparams = missingparams;
      break;

    case 'verifyres':
      console.log('verifyresult');
      if (!parameter.account_name) missingparams.push('account_name');
      if (!parameter.pin) missingparams.push('pin');
      if (!parameter.main_account_name) missingparams.push('main_account_name');
      if (!parameter.claim_id) missingparams.push('claim_id');
      if (!parameter.claim_data) missingparams.push('claim_data');
      if (!parameter.result_id) missingparams.push('result_id');
      errorObj.missingparams = missingparams;
      break;

    case 'get_verification_result':
      console.log('verification result');
      if (!parameter.result_id) missingparams.push('result_id');
      errorObj.missingparams = missingparams;
      break;

    case 'migrate':
      console.log('migrate');
      if (!parameter.account_name) missingparams.push('account_name');
      if (!parameter.pin) missingparams.push('pin');
      errorObj.missingparams = missingparams;
      break;

    case 'gettransaction':
      console.log('get transaction');
      if (!parameter.transaction_id) missingparams.push('transaction_id');
      errorObj.missingparams = missingparams;
      break;

    default:
      console.log('default');
      errorObj = config.errors.ORE_error.default;
  }
  return errorObj;
}
//# sourceMappingURL=errorhandler.js.map