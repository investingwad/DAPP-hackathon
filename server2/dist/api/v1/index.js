'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bridge = require('./moonbridge/bridge.routes');

var _bridge2 = _interopRequireDefault(_bridge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    console.log("initiallizing routes");
    app.use('/api/v1/', _bridge2.default);
};
//# sourceMappingURL=index.js.map