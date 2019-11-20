'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.eostransact = eostransact;
exports.serializetrx = serializetrx;
exports.pushonquotanull = pushonquotanull;
exports.sortDSPep = sortDSPep;
exports.getTransaction = getTransaction;
exports.getUser = getUser;
var dotenv = require('dotenv');
dotenv.config();
var axios = require('axios');

var _require = require('eos-auth'),
    OreId = _require.OreId;

var _require2 = require('eosjs'),
    Api = _require2.Api,
    JsonRpc = _require2.JsonRpc,
    RpcError = _require2.RpcError;

var erroraction = require('./errorhandler');
var configerr = require('./configpath');
var JsSignatureProvider = require('eosjs/dist/eosjs-jssig').default; // development only
var fetch = require('node-fetch'); // node only; not needed in browsers

var _require3 = require('util'),
    TextEncoder = _require3.TextEncoder,
    TextDecoder = _require3.TextDecoder;

var defaultPrivateKey = process.env.private_key;
var signatureProvider = new JsSignatureProvider([]);
//const httpEndpoint = 'https://kylin-dsp-1.liquidapps.io';
var dspEndptArr = configerr.DSP_Endpoints;
console.log("endpoint selected =>", dspEndptArr[0]);
var rpc = new JsonRpc(dspEndptArr[0], { fetch: fetch });
var api = new Api({ rpc: rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
var oreId = new OreId({ appName: process.env.APP_NAME, appId: process.env.API_ID, apiKey: process.env.API_KEY, serviceKey: process.env.SERVICE_KEY, oreIdUrl: process.env.ORE_URL });

async function eostransact(resultid) {

    var tabres = await api.rpc.get_table_rows({
        code: process.env.contract,
        json: true,
        limit: 1,
        lower_bound: resultid.toString(),
        scope: process.env.contract,
        table: process.env.verifytable,
        upper_bound: resultid.toString()
    });
    return tabres;
}

async function serializetrx(resultcontract1) {
    var result = [];
    var keys = Object.keys(resultcontract1.serializedTransaction);
    keys.forEach(function (key) {
        result.push(resultcontract1.serializedTransaction[key]);
    });
    resultcontract1.serializedTransaction = new Uint8Array(result);
    //console.log(resultcontract1);
    var resobj = {};
    try {
        console.log("hiting", dspEndptArr[0]);
        var finalres = await api.pushSignedTransaction(resultcontract1);
        resobj.res = finalres;
        return resobj;
    } catch (err) {
        console.log('err--', err);
        var msg = err.toString().split(':');
        var quotaerr = msg.find(function (a) {
            return a.includes(' not enough quota for this provider');
        });
        if (quotaerr) {
            var _result = await pushonquotanull(resultcontract1, 0);
            return _result;
        } else {
            var errmsg = await erroraction.smartcontracterr(err);
            console.log('s.m. err--', errmsg);

            resobj.err = errmsg;
            return resobj;
        }
    }
}

async function pushonquotanull(resultcontract1, i) {
    var repobj = {};
    var itr = i + 1;
    // let finddspep = sortDSPep()
    console.log("inside quota error");
    while (itr < dspEndptArr.length) {
        console.log("Tring DSP endpoint =>", dspEndptArr[itr]);
        try {
            var temphttpEndpoint = dspEndptArr[itr];
            var rpc = new JsonRpc(temphttpEndpoint, { fetch: fetch });
            var api = new Api({ rpc: rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

            var finalres = await api.pushSignedTransaction(resultcontract1);
            var defaultEndpoint = dspEndptArr[0];
            rpc = await new JsonRpc(defaultEndpoint, { fetch: fetch });
            api = await new Api({ rpc: rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
            repobj.res = finalres;
            return repobj;
        } catch (err) {
            console.log('err--', err);
            var msg = err.toString().split(':');
            var quotaerr = msg.find(function (a) {
                return a.includes(' not enough quota for this provider');
            });
            if (quotaerr) {
                itr++;
            } else {
                var errmsg = await erroraction.smartcontracterr(err);
                console.log('s.m. err--', errmsg);

                repobj.err = errmsg;
                return repobj;
            }
        }
    }

    repobj.err = configerr.errors.no_dsp_quota;
    return repobj;
}

async function sortDSPep() {
    var temphttpEndpoint = dspEndptArr[0];
    var rpc = new JsonRpc(temphttpEndpoint, { fetch: fetch });
    var api = new Api({ rpc: rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

    var tabacc = await api.rpc.get_table_rows({
        code: 'dappservices',
        json: true,
        limit: 50,
        scope: 'DAPP',
        table: 'accountext'
    });
    var tabpck = await api.rpc.get_table_rows({
        code: 'dappservices',
        json: true,
        limit: 50,
        scope: 'dappservices',
        table: 'package'
    });
    var intersection = tabpck.rows.filter(function (o1) {
        return dspEndptArr.some(function (o2) {
            return o1.api_endpoint === o2;
        });
    });
    console.log("intersection--", intersection);
    var result = tabacc.rows.find(function (acc) {
        return acc.account === process.env.contract;
    });
    // console.log("account--",result)
    var find = tabacc.rows.filter(function (result) {
        return result.account === process.env.contract;
    });
    console.log("account--", find);
    find.sort(function (a, b) {
        return a.quota > b.quota ? 1 : b.quota > a.quota ? -1 : 0;
    });
    console.log("account--", find);
}

async function getTransaction(trxid) {
    var temp = await api.rpc.history_get_transaction(trxid); //JsonRpc.history_get_transaction({id:trxid})
    console.log(temp);
    return temp;
}

async function getUser(username) {
    var temp = void 0;
    try {
        temp = await api.rpc.get_account(username);

        console.log(temp.account_name);
        return temp.account_name;
    } catch (err) {
        console.log(err);
    }
}

//sortDSPep()


//////////////////
// let msg = err.toString().split(':')
// if (msg) {
//   var quotaerr = msg.find(a => a.includes(' not enough quota for this provider'))
//   if (quotaerr){

//     try {

//     }catch(err)
//     {

//     }

//   }
//   else {
//     let errmsg = await erroraction.smartcontracterr(err)
//     console.log('s.m. err--', errmsg)
//     return res.status(400).send(errmsg)
//   }
//   ///////////////////////////////////

// }
///////////////////
//# sourceMappingURL=eosaction.js.map