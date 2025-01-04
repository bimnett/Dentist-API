/*
shall send mqtt to another service --> schedual service 
rename to schedualApi.js
*/


const mqtt = require('mqtt');
const express = require('express');
const router = express.Router();
const CREDENTIAL = require('../resources/credentials');
const TOPIC = require('../resources/topics');


const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

// Helper function to connect, publish, and subscribe to MQTT
function connectAndPublish(clientIdPrefix, pubTopic, subTopic, payload, res, successMessage) {
    const clientId = clientIdPrefix + Math.random().toString(36).substring(2, 10);
    const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

    client.on('connect', () => {
        console.log(`Publisher connected to broker with clientId: ${clientId}`);

        // Publish payload
        const jsonPayload = JSON.stringify(payload);
        client.publish(pubTopic, jsonPayload, { qos: 2 }, (err) => {
            if (err) {
                console.error(`Publishing error to topic ${pubTopic}:`, err);
                res.status(500).json({ message: `Publishing error: ${err.message}` });
                client.end(); // Makesure client connection is closed on error
            } else {
                console.log(`Message published successfully to topic ${pubTopic}`);
            }
        });

        // Subscribe to a topic
        client.subscribe(subTopic, { qos: 2 }, (err) => {
            if (err) {
                console.error(`Subscription error to topic ${subTopic}:`, err);
                res.status(500).json({ message: `Subscription error: ${err.message}` });
                client.end();
            } else {
                console.log(`Subscribed to topic: ${subTopic}`);
            }
        });
    });

    client.on('message', (topic, message) => {
        console.log(`Received message from topic ${topic}:`, message.toString());
        try {
            const parsedMessage = JSON.parse(message.toString());
            res.status(200).json(parsedMessage);
        } catch (err) {
            console.error('Error parsing received message:', err);
            res.status(500).json({ message: 'Error processing received message' });
        }
        client.unsubscribe(topic, () => console.log(`Unsubscribed from topic: ${topic}`));
        client.end();
    });

    client.on('error', (error) => {
        console.error(`MQTT connection error for clientId ${clientId}:`, error);
        res.status(500).json({ message: 'Failed to connect to MQTT broker' });
    });

    client.on('close', () => {
        console.log(`MQTT connection closed for clientId: ${clientId}`);
    });
}

// get schedule for a dentist from db-handler
router.get('/:dentistId', async function(req,res,next){
    try {
        const payload = {
            dentist: req.body.dentist ?? null,
        };
        connectAndPublish(
            'pub_dentistServer',
            TOPIC.dentist_id,
            TOPIC.dentist_schedule,
            payload,
            res,
            'Fetched dentist schedule successfully'
        );
    } catch (err) {
        next(err);
    }
});


// get all cached schedules for a dentist from scheduleService
router.get('/cached/:dentistId', async function(req,res,next){
    try {
        const payload = {
            // publish the dentist's id in order to filter the schedules in
            // dentistSchedule.js
            dentist: req.body.dentist ?? null,
        };
        connectAndPublish(
            'pub_dentistServer',
            TOPIC.cached_dentist_id,
            TOPIC.cached_dentist_schedule,
            payload,
            res,
            'Fetched cached dentist schedule successfully'
        );
    } catch (err) {
        next(err);
    }
});


module.exports = router;