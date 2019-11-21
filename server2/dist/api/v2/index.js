'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lease = require('./leaseservice/lease.routes');

var _lease2 = _interopRequireDefault(_lease);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    console.log("initiallizing routes");
    app.use('/api/v1/', _lease2.default);
};
//# sourceMappingURL=index.js.map