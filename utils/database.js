var mongo = require('mongoskin');
var database = mongo.db(process.env.MONGOLAB_URI, { native_parser: true });

//bind helpers here

module.exports = database;