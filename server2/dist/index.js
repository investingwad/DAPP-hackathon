'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _config = require('./config.json');

var _config2 = _interopRequireDefault(_config);

var _v = require('./api/v1');

var _v2 = _interopRequireDefault(_v);

var _expressWinston = require('express-winston');

var _expressWinston2 = _interopRequireDefault(_expressWinston);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _configpath = require('./api/v1/configpath');

var _configpath2 = _interopRequireDefault(_configpath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
// app.server = http.createServer(app)

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({
	extended: true
}));
_morgan2.default.token('host', function (req, res) {
	return req.hostname;
});
app.use((0, _morgan2.default)(':method :host :status :res[content-length] - :response-time ms'));
app.use((0, _compression2.default)());

if (_configpath2.default.corsValidation) {
	var whitelist = _configpath2.default.whitelisted_domain;
	console.log("whitelisted url", whitelist);
	var corsOptions = {
		origin: function origin(_origin, callback) {
			console.log("origin", _origin);
			if (whitelist.indexOf(_origin) !== -1 || !_origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		}
	};

	app.use((0, _cors2.default)(corsOptions));
} else {
	app.use((0, _cors2.default)());
}

(0, _v2.default)(app);
app.get('/', function (req, res) {
	res.json({
		status: "server running!", version: "1.0.0"
	});
});
app.listen(8081, function () {
	console.log('listening on 8081,');
});
exports.default = app;
//# sourceMappingURL=index.js.map