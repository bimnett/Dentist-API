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

// WORKS PUBLISH
// create new slot
router.post('/newSlots', async function(req,res,next){
    try {
        options.clientId = 'pub_dentistServer'; 

        // connect to broker 
        const client = mqtt.connect(config.brokerURL, options);
        
        client.on('connect', () => {
            console.log('Publisher connected to broker');
        
            const topic = config.topic_slot_management_create;
            
            const payload = { 
                // ?? null - set the value to null if the user does not provide any input 
                // malfomed input + error handeling will be in the slot managment service
                // or in the UI itself 
                time : req.body.time ,
                date : req.body.date,
                dentist : req.body.dentist ,
                clinic : req.body.clinic, 
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    // do not know if it's the appropriate status code
                    return res.status(503).json({message: "Unable to connect to the server"});
                } else {
                    console.log('Message published successfully!');
                    // 307 - rederecting to another server 
                    return res.status(200).json({message : " Did send the message"});
                }
            });
        });
        
        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
            return res.status(503).json({message : "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
            return res.status(200).json({message : "Close connection"});
        });
        
    }catch(e){
        next(e);
    }

    
});

// check if it's work
// see all avaliable slot for the dentist
router.get('/avaliableSlots', async function(req,res,next){
    try {
        options.clientId ='sub_dentistServer';
    
        // connect to broker 
        const client = mqtt.connect(config.brokerURL, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = config.topic_slot_dentist_avaliable;
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
            return res.status(503).json({message: "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Subscriber connection closed');
            return res.status(200).json({ message: "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});

module.exports = router;



