'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bridge = require('./bridge.controller');

var _bridge2 = _interopRequireDefault(_bridge);

var _util = require('../utils/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/create', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.create(req, res);
});

router.post('/signup', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.signup(req, res);
});

router.post('/user/session', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.login(req, res);
});

router.post('/generate_claim', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.generate_claim(req, res);
});

router.post('/whitelist_user', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.whitelist_user(req, res);
});

router.post('/verify_claimdata', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.verify_claimdata(req, res);
});
router.get('/get_verification_result/:result_id', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.get_verification_result(req, res);
});

router.post('/migrate_account', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.migrate_account(req, res);
});

router.get('/get_transaction_info/:transaction_id', _util2.default.verifyreqHeader, function (req, res) {
    _bridge2.default.get_transaction_info(req, res);
});

exports.default = router;
//# sourceMappingURL=bridge.routes.js.map