var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    displayName: String
    //TODO: picture
});

module.exports = mongoose.model('User', User);