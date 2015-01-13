var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: {type: String, required: true},
    streams : [{ type: Schema.Types.ObjectId, ref: 'Stream' }]
}, {versionKey: false});

module.exports = mongoose.model('Event', EventSchema);