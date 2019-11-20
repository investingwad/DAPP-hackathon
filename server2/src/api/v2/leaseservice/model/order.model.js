const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderschema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    authorizer: {
        type: String,
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
        type: String
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
})

module.exports = mongoose.model('Order', orderschema)
