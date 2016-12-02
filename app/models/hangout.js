// load the things we need
var mongoose = require('mongoose');

// define the schema for our hangout model
var hangoutSchema = mongoose.Schema({
    user: String,
    plans: Object
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Hangout', hangoutSchema);