const mongoose = require('mongoose');
const CREDENTIAL = require('../../credentials');
const Clinic = require('../models/clinic');

// Connect to MongoDB
mongoose.connect(CREDENTIAL.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Hardcoded Clinics Data
const clinics = [
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890fedcba"), // Hardcoded ID for Public Dental Service
        name: "Public Dental Service",
        coordinates: { lat: 57.69956, long: 11.94658 },
        address: "Första Långgatan 26, 413 28 Göteborg",
        openingTime: "08:00",
        closingTime: "17:00",
        dentists: [{
            _id: new mongoose.Types.ObjectId("64a69f021234567890abcdef")
        }]
    },
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890fedcbb"), // Hardcoded ID for Folktandvården Sannegården
        name: "Folktandvården Sannegården",
        coordinates: { lat: 57.70891, long: 11.92699 },
        address: "Vintergatan 1A, 417 58 Göteborg",
        openingTime: "09:00",
        closingTime: "18:00",
    },
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Hardcoded ID for Folktandvården Lundby
        name: "Folktandvården Lundby",
        coordinates: { lat: 57.7215, long: 11.93631 },
        address: "Wieselgrensplatsen 6, 417 39 Göteborg",
        openingTime: "09:30",
        closingTime: "17:30",
    },
    {
        _id: new mongoose.Types.ObjectId("64a69f021234567890fedcbd"), // Hardcoded ID for City Tandvård
        name: "City Tandvård",
        coordinates: { lat: 57.70345, long: 11.93789 },
        address: "Södra Vägen 27, 411 35 Göteborg",
        openingTime: "10:00",
        closingTime: "19:00",
    },
];

Clinic.insertMany(clinics)
    .then(() => {
        console.log('Clinics inserted successfully');
        mongoose.connection.close();
    })
    .catch((err) => console.error('Error inserting clinics:', err));