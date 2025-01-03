const mqtt = require('mqtt');
const mongoose = require("mongoose");
const CREDENTIAL = require('../resources/credentials');
const TOPIC = require('../resources/databaseMqttTopics');
const Timeslot = require('../models/timeslot');
const Clinic = require('../models/clinic');
const Dentist = require('../models/dentist');
const slotManagement = require('./slotManagement');
const dentistSchedule = require('./dentistSchedule');

// MQTT connection options
const options = {
    clientId: 'patientDatabase_' + Math.random().toString(36).substring(2, 10),
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

const dbURI = CREDENTIAL.mongodbUrl;
// Create dentist and patient MQTT clients for and connect
const patientClient = mqtt.connect(CREDENTIAL.patientUrl);
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);


// Connect to patient broker
patientClient.on('connect', async () => {
    console.log('databaseHandler connected to the patient broker');

    patientClient.subscribe('#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });
});


// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('databaseHandler connected to the dentist broker');

    dentistClient.subscribe('#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });

    // Fetch all dentist schedules and send to scheduleService for caching
    recurringPublish();
});
