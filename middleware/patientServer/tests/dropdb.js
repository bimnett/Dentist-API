var mongoose = require('mongoose');
const credentials = require('../src/controllerPatient/credentials')

// Variables
var mongoURI = credentials.mongodb_url;

// Drop database
mongoose.connect(mongoURI).catch(function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
});
mongoose.connection.dropDatabase().then(function () {
    console.log(`Dropped database: ${mongoURI}`);
    process.exit(0);
});
