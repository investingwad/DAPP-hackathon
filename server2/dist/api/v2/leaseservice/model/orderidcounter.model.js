'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ordercounterschema = new Schema({
    order_id: {
        type: Number,
        unique: true,
        required: true
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
});

module.exports = mongoose.model('Ordercounter', ordercounterschema);
//# sourceMappingURL=orderidcounter.model.js.map