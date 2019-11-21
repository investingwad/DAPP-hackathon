const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderstatcounterschema = new Schema({
    orderstat_id: {
        type: Number,
        unique: true,
        required: true
    },

}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Orderstatcounter', orderstatcounterschema)