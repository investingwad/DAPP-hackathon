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
    },
    lease_out: {
        type: String,
    }

}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Userbalance', userblcschema)
