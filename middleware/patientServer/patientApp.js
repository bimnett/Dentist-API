var express = require('express');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');


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

const slotRoutes = require('./src/controllerPatient/bookSlotApi');
app.use('/api/slots', slotRoutes);

// Get available dentist slots for a specific date
app.get('/api/available-slots', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });
  
    const slots = new Set();
    mockDentistsData.forEach((dentist) => {
      if (dentist.timetable[date]) {
        dentist.timetable[date].forEach((time) => slots.add(time));
      }
    });
  
    res.json({ slots: Array.from(slots).sort() });
  });

  // Get available dentists with specific time and date
  app.get('/api/dentists', (req, res) => {
    const { date, time } = req.query;
    if (!date || !time) return res.status(400).json({ message: "Date and time are required" });
  
    const availableDentists = mockDentistsData.filter((dentist) =>
      dentist.timetable[date]?.includes(time)
    );
  
    res.json({ dentists: availableDentists });
  });
  
  // Add booking for dentist with given dentistId
  app.post('/api/dentists/:dentistId/bookings', (req, res) => {
    const { dentistId } = req.params;
    const { name, email, phone, date, time } = req.body;
  
    const dentist = mockDentistsData.find((d) => d.id === parseInt(dentistId, 10));
    if (!dentist) return res.status(404).json({ message: "Dentist not found" });
  
    const newBooking = {
      referenceCode: `${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      dentist: dentist.name,
      clinicName: dentist.location,
      time,
      patientName: name,
      email,
      phone,
      date,
    };
  
    mockBookingData.push(newBooking);
  
    res.status(201).json({
      message: "Booking successful",
      referenceCode: newBooking.referenceCode,
    });
  });
  
  // Get booking with reference code
  app.get('/api/bookings/:referenceCode', (req, res) => {
    const { referenceCode } = req.params;
  
    const booking = mockBookingData.find((b) => b.referenceCode === referenceCode);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
  
    res.json({ booking });
  });

/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< Insert all of the routes - end >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/

/*
 <<<<<<<<<<<<<<<<<<<<<<<<<<< start of mock data to be removed after db set up >>>>>>>>>>>>>>>>
*/

const mockBookingData = [
    {
      referenceCode: "ABC123",
      time: "10:00 AM",
      date: "2024-12-01",
      clinicName: "Central Gothenburg",
      dentist: "Dr. John Johnson",
      patientName: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "123-456-7890",
    },
    {
      referenceCode: "XYZ789",
      time: "2:30 PM",
      date: "2024-12-02",
      clinicName: "North Gothenburg",
      dentist: "Dr. Michael Mike",
      patientName: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "987-654-3210",
    },
    {
      referenceCode: "JKL456",
      time: "11:30 AM",
      date: "2024-12-01",
      clinicName: "South Gothenburg",
      dentist: "Dr. Sarah Sarah",
      patientName: "Charlie Brown",
      email: "charlie.brown@example.com",
      phone: "555-123-4567",
    },
    {
      referenceCode: "MNO789",
      time: "9:30 AM",
      date: "2024-12-03",
      clinicName: "Central Gothenburg",
      dentist: "Dr. John Johnson",
      patientName: "Daisy Ridley",
      email: "daisy.ridley@example.com",
      phone: "222-333-4444",
    },
    {
      referenceCode: "PQR234",
      time: "3:00 PM",
      date: "2024-12-04",
      clinicName: "North Gothenburg",
      dentist: "Dr. Michael Mike",
      patientName: "Evan Peters",
      email: "evan.peters@example.com",
      phone: "999-888-7777",
    },
    {
      referenceCode: "STU567",
      time: "1:00 PM",
      date: "2024-12-05",
      clinicName: "South Gothenburg",
      dentist: "Dr. Sarah Sarah",
      patientName: "Frank Ocean",
      email: "frank.ocean@example.com",
      phone: "123-321-4567",
    },
  ];
  
  const mockDentistsData = [
    {
      id: 1,
      name: "Dr. John Johnson",
      specialty: "Orthodontics",
      location: "Central Gothenburg",
      timetable: {
        "2024-12-01": ["9:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"],
        "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
        "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
        "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
        "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
        "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
        "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
        "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
        "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
        "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
        "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
        "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
        "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
        "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
        "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
        "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
        "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
        "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
        "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
        "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
        "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
        "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
        "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
      },
    },
    {
      id: 2,
      name: "Dr. Michael Mike",
      specialty: "Pediatric Dentistry",
      location: "North Gothenburg",
      timetable: {
        "2024-12-01": ["9:30 AM", "10:30 AM", "1:00 PM", "3:00 PM"],
        "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
        "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
        "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
        "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
        "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
        "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
        "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
        "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
        "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
        "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
        "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
        "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
        "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
        "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
        "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
        "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
        "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
        "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
        "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
        "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
        "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
        "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
      },
    },
    {
      id: 3,
      name: "Dr. Sarah Sarah",
      specialty: "General Dentistry",
      location: "South Gothenburg",
      timetable: {
        "2024-12-01": ["9:30 AM", "10:30 AM", "1:00 PM", "3:00 PM"],
        "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
        "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
        "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
        "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
        "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
        "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
        "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
        "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
        "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
        "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
        "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
        "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
        "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
        "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
        "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
        "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
        "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
        "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
        "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
        "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
        "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
        "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
        "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
        "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
        "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
      },
    },
  ];
  
  /*
   <<<<<<<<<<<<<<<<<<<<<<<<<<< end of mock data to be removed after db set up >>>>>>>>>>>>>>>>
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