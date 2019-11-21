// 'use strict';

// var dotenv = require('dotenv');
// dotenv.config();

// module.exports = {

//     headerValidation: true,

//     corsValidation: true,

//     whitelisted_domain: ['https://www.moonlightingapi.com', 'https://www.moonlighting.com'],

//     DSP_Endpoints: [process.env.endpoint1, process.env.endpoint2],

//     headers: {
//         'api-key': process.env.API_KEY,
//         'service-key': process.env.SERVICE_KEY,
//         'Content-Type': 'application/json'
//     },
//     errors: {
//         incompleteArgument: {
//             code: 401,
//             message: "Incomplete Argument. Missing Body Parameter"
//         },

//         invalidacc_type: {
//             code: 402,
//             message: "Account type cannot be anything other than 'virtual' or 'native'"
//         },
//         missing_main_accname: {
//             code: 403,
//             message: "Missing main net account name for 'native' account_type"
//         },
//         not_mainnet_acc: {
//             code: 404,
//             message: "Not a mainnet account. Please pass any native account name"
//         },
//         wrong_mainnet_acc: {
//             code: 405,
//             message: "The mainnet account name corresponding to the account_name (registered with ORE) doesn't match with the provided main_account_name"
//         },
//         wrong_acc_type: {
//             code: 406,
//             message: "account_type mismatch. Please pass the correct account_type "
//         },
//         no_dsp_quota: {
//             code: 407,
//             message: "No DSP with sufficient quota is available for pushing action"
//         },
//         smartcontract_error: {
//             uniquekey: {
//                 errcode: 2001,
//                 message: "Violation of unique key constraint"
//             },
//             smserver: {
//                 errcode: 2002,
//                 message: "Problem with DSP server. Please try again later"
//             },
//             cpulimit: {
//                 errcode: 2003,
//                 message: "Account has limited CPU"
//             },
//             invalidtrx: {
//                 errcode: 2004,
//                 message: "Signature / transaction body altered. Invalid transaction"
//             },
//             dspfetcherr: {
//                 errcode: 2005,
//                 message: "Problem in fetching data from smart contract"
//             },
//             singletonerr: {
//                 errcode: 2006,
//                 message: "Account name not added as singleton"
//             },
//             hashvalidation: {
//                 errcode: 2007,
//                 message: "Hash generated from provided claim data doesn't match with the one stored in smart contract"
//             },
//             whitelistnotpresent: {
//                 errcode: 2008,
//                 message: "Whitelisted User entry doesn't exist in smart contract table"
//             },
//             claimnotfound: {
//                 errcode: 2009,
//                 message: "Claim data not found in smart contract table for provided claim id"
//             },
//             ramlimit: {
//                 errcode: 2010,
//                 message: "Account needs more RAM"
//             },
//             transactiontooklong: {
//                 errcode: 2011,
//                 message: "Transaction deadline expired. Please try again"
//             },
//             trxnotfound: {
//                 errcode: 2012,
//                 message: "Transaction not found in history"
//             },
//             quotaerror: {
//                 errcode: 2013,
//                 message: "Quota is fully consumed for this provider"
//             },
//             usernotfound: {
//                 errcode: 2014,
//                 message: "User not found in user info table"
//             },
//             irrelevantauth: {
//                 errcode: 2015,
//                 message: "Action declares irrelevant authority"
//             },
//             default: {
//                 errcode: 2016,
//                 message: "Problem in handling DSP request"
//             }
//         },
//         ORE_error: {
//             userexist: {
//                 errcode: 3001,
//                 message: "User has already been registered in ore"
//             },
//             trxrejected: {
//                 errcode: 3002,
//                 message: "transaction rejected by ORE"
//             },
//             oreserver: {
//                 errcode: 3003,
//                 message: "Problem with ORE server. Please try again later"
//             },
//             badWalletPassword: {
//                 errcode: 3004,
//                 message: "Incorrect User Pin"
//             },
//             usernotfound: {
//                 errcode: 3005,
//                 message: "Provided account_name not found to be registered with ORE"
//             },
//             errorcreatewallet: {
//                 errcode: 3006,
//                 message: "Issue creating chain account permissions"
//             },
//             migrate_not_virtual: {
//                 errcode: 3007,
//                 message: "Account to be migrated doesn't have an existing virtual account"
//             },
//             migrate_native: {
//                 errcode: 3008,
//                 message: "Account to be migrated is already native. Account type should be 'virtual'"
//             },
//             migrate_err: {
//                 errcode: 3009,
//                 message: "Error from ORE while migrating account"
//             },
//             default: {
//                 errcode: 3010,
//                 message: "Problem in handling ORE request"
//             }
//         }

//     }

// };
// //# sourceMappingURL=configpath.js.map