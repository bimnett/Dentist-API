var express = require('express');
var router= express.Router();
const mqtt = require('mqtt');
const CREDENTIAL = require('../resources/credentials');
const TOPIC = require('../resources/topics');

const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
};

// helper function to handle MQTT subscription
function subscribeToTopic(clientIdPrefix, topic, res, successMessage) {
    const clientId = clientIdPrefix + Math.random().toString(36).substring(2, 10);
    const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

    client.on('connect', () => {
        console.log(`Subscriber connected to broker with clientId: ${clientId}`);
        client.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.error(`Subscription error for topic ${topic}:`, err);
                res.status(500).json({ message: `Subscription error: ${err.message}` });
                client.end(); // Close the connection on error
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    });

    client.on('message', (subscribedTopic, message) => {
        console.log(`Received message from topic ${subscribedTopic}: ${message}`);
        res.status(200).json(JSON.parse(message.toString())); // Assuming JSON messages
        client.end(); // Close the connection after processing the message
    });

    client.on('error', (error) => {
        console.error(`MQTT client error for topic ${topic}:`, error);
        res.status(500).json({ message: 'Could not connect to the broker' });
    });

    client.on('close', () => {
        console.log(`Connection closed for clientId: ${clientId}`);
    });
}

// get all clinics 
router.get('/bookSlots/clinics', async function(req,res,next){
    try {
        subscribeToTopic('sub_patientServer', TOPIC.all_clinics, res, 'Fetched all clinics successfully');
    } catch (err) {
        next(err);
    }
});

// get all dentists in a specific clinic by clinicId
router.get('/bookSlots/clinics/:clinicId/dentists', async function(req, res, next){
    try {
        subscribeToTopic('sub_patientService', TOPIC.clinic_dentists, res, 'Fetched all dentists for the clinic');
    } catch (err) {
        next(err);
    }
});

// get a dentist time-slots 
router.get('/bookSlots/clinics/:clinicId/:dentistId/timeschedual', async function(req,res,next){
    try {
        subscribeToTopic('sub_patientService', TOPIC.clinic_dentist_slots, res, 'Fetched dentist time slots');
    } catch (err) {
        next(err);
    }
});

// get the info from a newly posted slot 
router.get('/bookSlots', async function(req,res,next){
    try {
        subscribeToTopic('sub_patientService', TOPIC.dentist_new_slots, res, 'Fetched new slot information');
    } catch (err) {
        next(err);
    }
});