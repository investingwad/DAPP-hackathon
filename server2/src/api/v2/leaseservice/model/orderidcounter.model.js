const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ordercounterschema = new Schema({
    order_id: {
        type: Number,
        unique: true,
        required: true
    },

}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Ordercounter', ordercounterschema)
