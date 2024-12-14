/*
shall send mqtt to another service --> schedual service 
rename to schedualApi.js
*/


const mqtt = require('mqtt');
const express = require('express');
const router = express.Router();
const CREDENTIAL = require('./credentials');
const TOPIC = require('./topics');


const options = {
    clientId: "", // You can set a unique client ID here
    username: CREDENTIAL.username, // Use the username defined in env.js
    password: CREDENTIAL.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}


// get all schedule for a dentist from db-handler
router.get('/:dentistId', async function(req,res,next){
    try {
        options.clientId ='pub_dentistServer'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Publisher connected to broker');

            const pubTopic = TOPIC.dentist_id;
            const payload = { 
                // date - to see between which dates the schedual shall be shown
                // need to know which dentist's schedual
                //date : req.body.date,
                dentist : req.body.dentist,
            };

            const json_payload = JSON.stringify(payload);
            
            // Publishes to a topic with a certain payload ( change the payload to what you want to publish)
            client.publish(pubTopic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // ADD SUBSCRIPTION TOO
            const subTopic = TOPIC.dentist_schedule;
            client.subscribe(subTopic, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${subTopic}`);
                }
            });

        });

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            const parsedMessage = JSON.parse(message.toString());
            
            // Unsubscribe from the topic and close the connection
            client.unsubscribe(topic, () => {
                console.log(`Unsubscribed from topic: ${topic}`);
            });
            client.end(); // Close the connection
            return res.status(200).json(parsedMessage);
        });

        client.on('error', (error) => {
            console.log('Subscriber/publisher connection error:', error);
            //return res.status(500).json({message: "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Subscriber/publisher connection closed');
            //return res.status(200).json({message : "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});


// get all schedule for a dentist from scheduleService
router.get('/cached/:dentistId', async function(req,res,next){
    try {
        options.clientId ='pub_dentistServer'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Publisher connected to broker');
            
            const payload = { 
                // date - to see between which dates the schedual shall be shown
                // need to know which dentist's schedual
                dentist : req.body.dentist,
            };

            const json_payload = JSON.stringify(payload);

            const pubTopic = TOPIC.cached_dentist_id;
            // Publishes to a topic with a certain payload ( change the payload to what you want to publish)
            client.publish(pubTopic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // ADD SUBSCRIPTION TOO

            const subTopic = TOPIC.cached_dentist_schedule;
            client.subscribe(subTopic, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${subTopic}`);
                }
            });

        });

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            try {
                const parsedMessage = JSON.parse(message.toString());
                
                // Unsubscribe from the topic and close the connection
                client.unsubscribe(topic, () => {
                    console.log(`Unsubscribed from topic: ${topic}`);
                });
                client.end(); // Close the connection
                return res.status(200).json(parsedMessage);
            }catch(err){
                console.log(err);
            }
            
        });

        client.on('error', (error) => {
            console.log('Subscriber/publisher connection error:', error);
            //return res.status(500).json({message: "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Subscriber/publisher connection closed');
            //return res.status(200).json({message : "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});


module.exports = router;