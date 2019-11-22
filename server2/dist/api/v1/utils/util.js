'use strict';

var util = {};
var dotenv = require('dotenv');
dotenv.config();
var config = require('../configpath');

util.verifyreqHeader = async function (req, res, next) {
    if (config.headerValidation) {
        if (req.get(process.env.headername) == process.env.headervalue) {
            console.log("verified---header value");
            next();
        } else {
            var respobj = {};
            respobj.errormessage = "Problem handling the request. Missing required parameter(s) in request header";
            return res.status(401).send(respobj);
        }
    } else {
        next();
    }
};

module.exports = util;
//# sourceMappingURL=util.js.map