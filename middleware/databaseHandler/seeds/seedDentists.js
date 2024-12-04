const mongoose = require('mongoose');
const CREDENTIAL = require('../../credentials');
const Dentist = require('../models/dentist');

// Connect to MongoDB
mongoose.connect(CREDENTIAL.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Hardcoded Dentists Data
const dentists = [
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890abcdef"), // Hardcoded ID for John Johnson
        name: "Dr. John Johnson",
        specialty: "Orthodontics",
        clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcba"), // Hardcoded ID for Public Dental Service
        timeslots: [
            new mongoose.Types.ObjectId("64a69f021234567890f11111"), // Timeslot ID for 10:00 AM, 2024-12-01
            new mongoose.Types.ObjectId("64a69f021234567890f22222"), // Timeslot ID for 9:30 AM, 2024-12-03
        ],
    },
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890abcdea"), // Hardcoded ID for Michael Mike
        name: "Dr. Michael Mike",
        specialty: "Pediatric Dentistry",
        clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbb"), // Hardcoded ID for Folktandvården Sannegården
        timeslots: [
            new mongoose.Types.ObjectId("64a69f021234567890f33333"), // Timeslot ID for 2:30 PM, 2024-12-02
            new mongoose.Types.ObjectId("64a69f021234567890f44444"), // Timeslot ID for 10:00 AM, 2024-12-02
        ],
    },
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890abcded"), // Hardcoded ID for Sarah Sarah
        name: "Dr. Sarah Sarah",
        specialty: "General Dentistry",
        clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Hardcoded ID for Folktandvården Lundby
        timeslots: [
            new mongoose.Types.ObjectId("64a69f021234567890f55555"), // Timeslot ID for 11:30 AM, 2024-12-01
            new mongoose.Types.ObjectId("64a69f021234567890f66666"), // Timeslot ID for 12:00 PM, 2024-12-03
        ],
    },
];

Dentist.insertMany(dentists)
    .then(() => {
        console.log('Dentists inserted successfully');
        mongoose.connection.close();
    })
    .catch((err) => console.error('Error inserting dentists:', err));