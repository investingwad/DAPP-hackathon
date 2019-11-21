'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var orderstatcounterschema = new Schema({
    orderstat_id: {
        type: Number,
        unique: true,
        required: true
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdate' }
});

module.exports = mongoose.model('Orderstatcounter', orderstatcounterschema);
//# sourceMappingURL=orderstatcounter.model.js.map