const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userblcschema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    balance: {
        type: String,
        unique: true,
        required: true
    },

}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Userbalance', userblcschema)
