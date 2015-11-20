var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    displayName: String,
    picture: String
});

module.exports = mongoose.model('User', User);