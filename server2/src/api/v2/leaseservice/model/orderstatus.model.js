const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderstatschema = new Schema({
    orderstat_id: {
        type: Number,
        unique: true,
        required: true
    },
    order_id: {
        type: Number,
    },
    lender: {
        type: String,
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
    rent_fee: {
        type: String
    },
    expires_at: {
        type: String
    },
    filled_at: {
        type: String
    },
}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Orderstat', orderstatschema)
