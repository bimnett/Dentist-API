var express = require('express');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');
const TOPIC = require('./topics');
const CREDENTIAL = require('./credentials')
const mqtt = require('mqtt');

const options = {
  clientId: "", // You can set a unique client ID here
  username: CREDENTIAL.username, // Use the username defined in env.js
  password: CREDENTIAL.password, // Use the password defined in env.js
  connectTimeout: 30000, // Set the connection timeout to 30 seconds
  reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}


var port = process.env.PORT || 3001;


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






// Define a basic route for /api that responds with a JSON message
app.get('/api', function(req, res) {
    res.json({'message': 'Hello! Hope that this works again!'});
});

/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< Insert all of the routes - start >>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/

// MQTT
const slotRoutes = require('./src/controllerPatient/bookSlotApi');
app.use('/api/slots', slotRoutes);


// Get available slots with given date and clinic
app.get('/api/available-slots', async (req, res) => {
  const { date, clinic } = req.query;

  if (!date) {
      return res.status(400).json({ message: "Date is required" });
  }
  if (!clinic) {
      return res.status(400).json({ message: "Clinic is required" });
  }

  try {
      options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
      const client = mqtt.connect(CREDENTIAL.broker_url, options);
      
      client.on('connect', () => {
          console.log('Subscriber connected to broker');
          client.subscribe(TOPIC.database_response_slots, { qos: 2 });
          
          // Publish request for slots
          client.publish(TOPIC.database_request_slots, JSON.stringify({
              date,
              clinic
          }));
      });

      client.on('message', (topic, message) => {
          console.log(`Received slots data on topic: ${topic}`);
          const response = JSON.parse(message.toString());
          console.log('Received response:', response);
          
          if (response.error) {
            console.error('Error from database:', response.error);
            client.end();
            return res.status(500).json({ message: response.error });
          }

          // Extract unique times from the slots
          const slots = [...new Set(response.data.map(slot => slot.time))].sort();

          client.end();
          return res.status(200).json({ slots });
      });

      client.on('error', (error) => {
          console.log('Subscriber connection error:', error);
          return res.status(500).json({ message: "Unable to connect to the server" });
      });

      // Add timeout
      setTimeout(() => {
          client.end();
          if (!res.headersSent) {
              return res.status(504).json({ message: "Request timeout" });
          }
      }, 5000);

  } catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get available dentists with given time, date, and clinic
app.get('/api/dentists', async (req, res) => {
  const { date, time, clinic } = req.query;

  if (!date || !time) {
    return res.status(400).json({ message: "Date and time are required" });
  }
  if (!clinic) {
    return res.status(400).json({ message: "Clinic is required" });
  }

  try {
    options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
    const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
    client.on('connect', () => {
      console.log('Subscriber connected to broker');
      client.subscribe(TOPIC.database_response_dentists, { qos: 2 });
      
      // Publish request for dentists
      client.publish(TOPIC.database_request_dentists, JSON.stringify({
        date,
        time,
        clinic
      }));
    });
    client.on('message', (topic, message) => {
        console.log(`Received dentists data on topic: ${topic}`);
        const response = JSON.parse(message.toString());
        
        if (response.error) {
          client.end();
          return res.status(500).json({ message: response.error });
        }
        if (!response.data || response.data.length === 0) {
          client.end();
          return res.status(404).json({ message: "No dentists available" });
        }
        client.end();
        return res.status(200).json({ dentists: response.data });
    });

      client.on('error', (error) => {
        console.log('Subscriber connection error:', error);
        return res.status(500).json({ message: "Unable to connect to the server" });
      });

      // Add timeout to avoid hanging connections
      setTimeout(() => {
        client.end();
        if (!res.headersSent) {
          return res.status(504).json({ message: "Request timeout" });
        }
      }, 5000);

  } catch(error) {
      console.error('Error:', error);
      return res.status(500).json({ message: "Internal server error" });
  }
});


// Reserve a time slot
app.post('/api/reserve-slot', async (req, res) => {
  const { dentistId, date, time } = req.body;

  if (!dentistId || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  try {
      options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
      const client = mqtt.connect(CREDENTIAL.broker_url, options);

      client.on('connect', () => {
          console.log('Subscriber connected to broker');
          client.subscribe(TOPIC.database_response_reserve, { qos: 2 });

          // Publish reservation request
          client.publish(TOPIC.database_request_reserve, JSON.stringify({
              dentistId,
              date,
              time,
          }));
      });

      client.on('message', (topic, message) => {
        console.log(`Received reservation data on topic: ${topic}`);
        const response = JSON.parse(message.toString());
        console.log('Received response:', response);
        
        // Immediately end the connection and send response
        client.end();
        
        if (response.error) {
            return res.status(500).json({ message: response.error });
        }
        return res.json(response);
    });

      client.on('error', (error) => {
          console.log('Subscriber connection error:', error);
          return res.status(500).json({ message: "Unable to connect to the server" });
      });

      // Add 5 second timeout
      setTimeout(() => {
          client.end();
          if (!res.headersSent) {
              return res.status(504).json({ message: "Request timeout" });
          }
      }, 5000);

  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: "Internal server error" });
  }
});


// Add booking for dentist with given dentistId
app.post('/api/dentists/:dentistId/bookings', (req, res) => {
    const { dentistId } = req.params;
    const { name, email, phone, treatment, date, time, clinic } = req.body;

    if(!name || !email || !phone || !treatment || !date || !time || !clinic){
      res.status(400).json({ error: "Booking data is not in the correct format" });
    }

    try {
      options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
      const client = mqtt.connect(CREDENTIAL.broker_url, options);

      client.on('connect', () => {
          console.log('Subscriber connected to broker');
          client.subscribe(TOPIC.database_response_book_slot, { qos: 2 });

          // Publish reservation request
          client.publish(TOPIC.database_request_book_slot, JSON.stringify({
              dentistId,
              name,
              email,
              phone,
              treatment,
              date,
              time,
              clinic
          }));
      });

      client.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        console.log('Received response:', response);
        
        // Immediately end the connection and send response
        client.end();
        
        if (response.error) {
            return res.status(500).json({ message: response.error });
        }

        return res.status(201).json(response);
      });

      // Add 5 second timeout
      setTimeout(() => {
        client.end();
        if (!res.headersSent) {
          return res.status(504).json({ message: "Request timeout" });
        }
      }, 5000);

    } catch(err){
      console.log("Error in booking creation endpoint:", err);
    }
});

// Get booking by reference code
app.get('/api/bookings/:referenceCode', (req, res) => {
    const { referenceCode } = req.params;

    if(!referenceCode){
      return res.status(400).json({ message: "Reference code is missing." });
    }

    try {
      options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
      const client = mqtt.connect(CREDENTIAL.broker_url, options);

      client.on('connect', () => {
          console.log('Subscriber connected to broker');
          client.subscribe(TOPIC.database_response_reference_code, { qos: 2 });

          // Publish reference code for fetching booking request
          client.publish(TOPIC.database_request_reference_code, JSON.stringify(referenceCode));
      });

      client.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        console.log('Received response:', response);
        
        // Immediately end the connection and send response
        client.end();
        
        if (response.error) {
            return res.status(500).json({ message: response.error });
        }

        return res.status(200).json(response);
      });

      // Add 5 second timeout
      setTimeout(() => {
        client.end();
        if (!res.headersSent) {
          return res.status(504).json({ message: "Request timeout" });
        }
      }, 5000);

    } catch(err){
      console.log("Error in getting booking from reference code:", err);
    }
});

// Cancel booking by reference code
app.delete('/api/bookings/:referenceCode', (req, res) => {
  const { referenceCode } = req.params;

  if(!referenceCode){
    return res.status(400).json({ message: "Reference code is missing." });
  }

  try {
    options.clientId = "patientServer" + Math.random().toString(36).substring(2, 10);
    const client = mqtt.connect(CREDENTIAL.broker_url, options);

    client.on('connect', () => {
        console.log('Subscriber connected to broker');
        client.subscribe(TOPIC.database_response_delete_reference_code, { qos: 2 });

        // Publish reference code for fetching booking request
        client.publish(TOPIC.database_request_delete_reference_code, JSON.stringify(referenceCode));
    });

    client.on('message', (topic, message) => {
      const response = JSON.parse(message.toString());
      console.log('Received response:', response);
      
      // Immediately end the connection and send response
      client.end();
      
      if (response.error) {
          return res.status(500).json({ message: response.error });
      }

      return res.status(200);
    });

    // Add 5 second timeout
    setTimeout(() => {
      client.end();
      if (!res.headersSent) {
        return res.status(504).json({ message: "Request timeout" });
      }
    }, 5000);

  } catch(err){
    console.log("Error deleting:", err);
  }
});


/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< Insert all of the routes - end >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
    console.log(`Express server for patients listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
});

module.exports = app;