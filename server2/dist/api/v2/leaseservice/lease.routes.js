'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _lease = require('./lease.controller');

var _lease2 = _interopRequireDefault(_lease);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/create', function (req, res) {
    _lease2.default.create(req, res);
});
router.post('/register_user', function (req, res) {
    _lease2.default.register_user(req, res);
});
router.post('/create_order', function (req, res) {
    _lease2.default.create_order(req, res);
});

router.post("/lease_transfer", function (req, res) {
    _lease2.default.lease_transfer(req, res);
});
router.post("/match_order", function (req, res) {
    _lease2.default.match_order(req, res);
});

router.post("/withdraw", function (req, res) {
    _lease2.default.withdraw(req, res);
});
router.post("/cancelorder", function (req, res) {
    _lease2.default.cancelorder(req, res);
});

router.post("/leaseunstake", function (req, res) {
    _lease2.default.leaseunstake(req, res);
});

router.get('/get_orderdet/:authorizer', function (req, res) {
    _lease2.default.get_orderdet(req, res);
});

router.get('/get_orderstatdet', function (req, res) {
    _lease2.default.get_orderstatdet(req, res);
});

router.get('/get_orderstatdet_byaccount/:account_name', function (req, res) {
    _lease2.default.get_orderstatdet_byaccount(req, res);
});

router.get('/get_accountblc/:vaccount', function (req, res) {
    _lease2.default.get_accountblc(req, res);
});

exports.default = router;
//# sourceMappingURL=lease.routes.js.map