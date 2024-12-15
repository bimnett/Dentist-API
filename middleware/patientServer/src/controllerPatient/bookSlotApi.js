var express = require('express');
var router= express.Router();
const mqtt = require('mqtt');
const CREDENTIAL = require('../../credentials');
const TOPIC = require('../../topics');


const options = {
    clientId: "", // You can set a unique client ID here
    username: CREDENTIAL.username, // Use the username defined in env.js
    password: CREDENTIAL.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
  }
  

//  get appointment info by reference code 
router.get('/bookSlots/:appointmentId', async function(req,res,next){
    try {
        options.clientId ='sub_patientService'+Math.random().toString(36).substring(2,10);
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = TOPIC.appointment_info;
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
            return res.status(200).json(message);
        });

        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
            return res.status(500).json({message: "Could not connect to server"})
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