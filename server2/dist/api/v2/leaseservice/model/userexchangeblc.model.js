'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userblcschema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    balance: {
        type: String
    },
    lease_out: {
        type: String
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
});

module.exports = mongoose.model('Userbalance', userblcschema);
//# sourceMappingURL=userexchangeblc.model.js.map