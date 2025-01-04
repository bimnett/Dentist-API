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


// get schedule for a dentist from db-handler
router.get('/:dentistId', async function(req,res,next){
    try {
        options.clientId ='pub_dentistServer'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.brokerUrl, options);
    
        client.on('connect', () => {
            console.log('Publisher connected to broker');

            const pubTopic = TOPIC.dentist_id;
            const payload = { 
                dentist : req.body.dentist,
            };

            const json_payload = JSON.stringify(payload);
            client.publish(pubTopic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // Subscribe in order to receive a certain dentist's schedule 
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
        });

        client.on('close', () => {
            console.log('Subscriber/publisher connection closed');
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
                // publish the dentist's id in order to filter the schedules in
                // dentistSchedule.js
                dentist : req.body.dentist,
            };

            const json_payload = JSON.stringify(payload);

            const pubTopic = TOPIC.cached_dentist_id;
            client.publish(pubTopic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // Subscription for the dentist's schedule 96 hours in the future 
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
                client.end(); // Close connection
                return res.status(200).json(parsedMessage);
            }catch(err){
                console.log(err);
            }
            
        });

        client.on('error', (error) => {
            console.log('Subscriber/publisher connection error:', error);
        });

        client.on('close', () => {
            console.log('Subscriber/publisher connection closed');
        });

    } catch(e) {
        return next(e);
    }
});


module.exports = router;