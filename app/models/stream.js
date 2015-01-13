var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreamSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    url: {type: String, required: true},
    state: {type: Number, default: 0}
}, {versionKey: false});

module.exports = mongoose.model('Stream', StreamSchema);