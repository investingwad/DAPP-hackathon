'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var orderschema = new Schema({
    order_id: {
        type: Number,
        unique: true,
        required: true
    },
    authorizer: {
        type: String
    },
    stake_to: {
        type: String
    },
    rent_amount: {
        type: String
    },
    rent_offer: {
        type: String
    },
    lease_period: {
        type: Number
    },
    resource_type: {
        type: String
    },
    order_stat: {
        type: String
    },
    apr: {
        type: Number
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
});

module.exports = mongoose.model('Order', orderschema);
//# sourceMappingURL=order.model.js.map