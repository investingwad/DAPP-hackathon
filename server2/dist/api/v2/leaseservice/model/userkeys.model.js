'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userkeyschema = new Schema({
    user: {
        type: String,
        unique: true,
        required: true
    },
    private: {
        type: String
    },
    public: {
        type: String
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
});

module.exports = mongoose.model('Userkey', userkeyschema);
//# sourceMappingURL=userkeys.model.js.map