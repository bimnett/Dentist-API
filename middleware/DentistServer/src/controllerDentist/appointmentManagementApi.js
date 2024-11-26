const mqtt = require('mqtt');
const express = require('express');
const router = express.Router();

const config = require('../../../env');

require('dotenv').config();

const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in index.js
    password: config.password, // Use the password defined in index.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}


// WORKS FOR SUBSCRIBE
// get all the appointments for a dentist 
router.get('/appointments', async function(req,res,next){
    try {
        options.clientId ='sub_dentistApi_'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(config.brokerURL, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = config.topic_test;
            client.subscribe(topic, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            console.log(" -------------- ");
            // HOW DO I GET THIS 
            console.log(message.time);
            return res.status(200).json(message);
        });

        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
            return res.status(503).json({message: "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Subscriber connection closed');
            return res.status(200).json({message : "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});

module.exports = router;