const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userkeyschema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    private: {
        type: String,  
    },
    public: {
        type: String,
    }

}, {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
})

module.exports = mongoose.model('Userkey', userkeyschema)
