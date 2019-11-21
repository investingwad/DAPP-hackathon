'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

//require('now-env')

console.log("db starting-----");

//mongoose.connect("mongodb+srv://malagath:qwerty123?@cluster0-7eftm.mongodb.net/Waitlist?retryWrites=true",{ useNewUrlParser: true });
var connectWithRetry = function connectWithRetry() {
    return _mongoose2.default.connect("mongodb://localhost:27017/leaseservice", { useNewUrlParser: true });
};

_mongoose2.default.connection.on('connected', function () {
    console.log("mongodb database connected successfully");
});

_mongoose2.default.connection.on('error', function (error) {
    console.log("error connecting to the database", error);
    setTimeout(connectWithRetry, 5000);
});

var connect = function connect() {
    connectWithRetry();
};

exports.default = function (callback) {
    connect();
    callback({});
};
//# sourceMappingURL=index.js.map