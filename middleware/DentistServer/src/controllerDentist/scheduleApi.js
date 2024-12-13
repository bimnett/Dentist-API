const mqtt = require('mqtt');
const express = require('express');
const router = express.Router();
const CREDENTIAL = require('../../../credentials');
const TOPIC = require('../../../topics');



const options = {
    clientId: "", // You can set a unique client ID here
    username: CREDENTIAL.username, // Use the username defined in env.js
    password: CREDENTIAL.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}


// get all schedule for a dentist 
router.get('/schedules/:dentistId', async function(req,res,next){
    try {
        options.clientId ='pub_dentistServer'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Publisher connected to broker');

            const topic = TOPIC.dentist_id;
            const payload = { 
                // date - to see between which dates the schedual shall be shown
                // need to know which dentist's schedual
                date : req.body.date,
                dentist : req.body.dentist,
            };

            const json_payload = JSON.stringify(payload);
            
            // Publishes to a topic with a certain payload ( change the payload to what you want to publish)
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // ADD SUBSCRIPTION TOO

        });

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            return res.status(200).json(message);
        });

        client.on('error', (error) => {
            console.log('Subscriber/publisher connection error:', error);
            return res.status(500).json({message: "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Subscriber/publisher connection closed');
            return res.status(200).json({message : "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});

module.exports = router;