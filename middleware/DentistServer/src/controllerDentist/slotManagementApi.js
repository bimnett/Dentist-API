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


// create new avaliable time slot
router.post('/newSlots', async function(req,res,next){
    try {
        
        options.clientId = 'pub_dentistServer'+Math.random().toString(36).substring(2,10); 

        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
        
        client.on('connect', () => {
            console.log('Publisher connected to broker');
        
            const topic = TOPIC.create_new_slot;
            
            const payload = { 
                // ?? null - set the value to null if the user does not provide any input 
                // malformed input + error handling will be in the slot managment service
                // or in the UI itself 
                date : req.body.date ?? null,
                time : req.body.time ?? null,
                status: req.body.status ?? null,
                patient: null,
                dentist : req.body.dentist ?? null,
                clinic : req.body.clinic ?? null, 
                treatment: req.body.treatment ?? null
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    res.status(500).json('Problems with publishing: '+json_payload);
                } else {
                    console.log('Message published successfully!');
                    console.log(json_payload);
                    // THNIK IT THROUGH!!!
                    // just sends a response back for now to close the api endpoint
                    res.status(200).json({message : "Message published to broker"});
                }
            });
        });
        
        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
            return res.status(500).json({message : "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
            return res.status(200).json({message : "Close connection"});
        });
        
    }catch(e){
        next(e);
    }  
});

// update an exisiting slot's time, date and treatment
router.patch('/updateSlots/:slotId', async function(req,res,next){
    try {
        
        options.clientId = 'pub_dentistServer'+Math.random().toString(36).substring(2,10); 

        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
        
        client.on('connect', () => {
            console.log('Publisher connected to broker');
        
            const topic = TOPIC.update_slot;
            
            const payload = { 
                // ?? null - set the value to null if the user does not provide any input 
                // malformed input + error handling will be in the slot managment service
                // + in the UI itself 

                // update slot means dentist is still avaliable/will attend if slot is booked
                // if a patien has booked this slot and it get's chnged the patient 
                // will still have the slot but be notified 
                _id: req.body.id,
                date : req.body.date ?? null,
                time : req.body.time ?? null,
                treatment: req.body.treatment ?? null
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    res.status(500).json('Problems with publishing');
                } else {
                    console.log('Message published successfully!');
                    console.log(json_payload);
                    // THNIK IT THROUGH!!!
                    // just sends a response back for now to close the api endpoint
                    res.status(200).json({message : "Message published to slot-serivce"});
                }
            });
        });
        
        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
            return res.status(500).json({message : "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
            return res.status(200).json({message : "Close connection"});
        });
        
    }catch(e){
        next(e);
    }
});


// MOVE to SCHEDULE SERVICE

/*
// see all avaliable slot for the dentist
router.get('/avaliableSlots', async function(req,res,next){
    try {
        options.clientId ='sub_dentistServer'+Math.random().toString(36).substring(2,10);
    
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = TOPIC.slot_dentist_avaliable;
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
            return res.status(200).json({ message: "Closed connection"});
        });

    } catch(e) {
        return next(e);
    }
});
*/

module.exports = router;



