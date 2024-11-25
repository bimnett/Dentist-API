var express = require('express');
// var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');


// var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dentist_app'; 
var port = process.env.PORT || 3001;

/*
To be implemented: 
// Connect to MongoDB
mongoose.connect(mongoURI, { autoIndex: false }).catch(function(err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
}).then(function() {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`); // mistake when forward porting
});
*/

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan('dev'));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

// Import controllers and mount routes
app.get('/api', function(req, res) {
    res.json({'message': 'Hello! Hope that this works again!'});
});







/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< Insert all of the routes - start >>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/


/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< Insert all of the routes - end >>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/






// Catch all non-error handler for api (i.e., 404 Not Found)
app.use('/api/*', function (req, res) {
    res.status(404).json({ 'message': 'Not Found (non-error handler)' });
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + '/..');
var client = path.join(root, 'client', 'dist');
app.use(express.static(client));

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get('env');
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        // Return sensitive stack trace only in dev mode
        err_res['error'] = err.stack;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server for dentists listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
