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

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _v = require('./api/v2');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import autoIncrement from 'mongoose-auto-increment'
//export const autoIncrement = require('mongoose-auto-increment'); // import


var app = (0, _express2.default)();
// app.server = http.createServer(app)

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({
	extended: true
}));
app.use((0, _cors2.default)());
app.use((0, _morgan2.default)('dev'));
app.use((0, _compression2.default)());

(0, _db2.default)(function (cb) {});

app.get('/', function (req, res) {
	// res.status(200).send("Equastart API")
	res.json({
		version: '1.0.0'
	});
});
(0, _v2.default)(app);
app.listen(8081);
exports.default = app;
//# sourceMappingURL=index.js.map