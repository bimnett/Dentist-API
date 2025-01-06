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

// Helper function to publish to MQTT broker
function publishToBroker(clientIdPrefix, topic, payload, res, successMessage) {
    const clientId = clientIdPrefix + Math.random().toString(36).substring(2, 10);
    const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

    client.on('connect', () => {
        console.log(`Publisher connected to broker with clientId: ${clientId}`);
        const jsonPayload = JSON.stringify(payload);

        client.publish(topic, jsonPayload, { qos: 2 }, (err) => {
            if (err) {
                console.error(`Publishing error on topic ${topic}:`, err);
                res.status(500).json({ message: `Publishing error: ${err.message}` });
            } else {
                console.log(`Message published successfully to topic ${topic}:`, jsonPayload);
                res.status(200).json({ message: successMessage });
            }
            client.end();
        });
    });

    client.on('error', (error) => {
        console.error(`MQTT connection error for clientId ${clientId}:`, error);
        res.status(500).json({ message: 'Failed to connect to MQTT broker' });
    });

    client.on('close', () => {
        console.log(`MQTT connection closed for clientId: ${clientId}`);
    });
}

// create new avaliable time slot
router.post('/newSlots', async function(req,res,next){
    try {
        const payload = {
            // ?? null - set the value to null if the user does not provide any input 
            // malformed input + error handling will be in the slot managment service
            // or in the UI itself 
            date: req.body.date ?? null,
            time: req.body.time ?? null,
            status: req.body.status ?? null,
            patient: null,
            dentist: req.body.dentist ?? null,
            clinic: req.body.clinic ?? null,
            treatment: req.body.treatment ?? null,
        };
        publishToBroker('pub_dentistServer', TOPIC.create_new_slot, payload, res, 'New time slot created successfully');
    } catch (err) {
        next(err);
    }
});

// delete an exisiting slot --> dentit will remove slot from avaliable slots too
router.patch('/updateSlots/:slotId', async function(req,res,next){
    try {
        const payload = {
            // ?? null - set the value to null if the user does not provide any input 
            // malformed input + error handling will be in the slot managment service
            // + in the UI itself 

            // update slot means dentist is still avaliable/will attend if slot is booked
            // if a patien has booked this slot and it get's chnged the patient 
            // will still have the slot but be notified 
            _id: req.body.id ?? null,
            date: req.body.date ?? null,
            time: req.body.time ?? null,
            treatment: req.body.treatment ?? null,
        };
        publishToBroker('pub_dentistServer', TOPIC.update_slot, payload, res, 'Time slot updated successfully');
    } catch (err) {
        next(err);
    }
});

router.delete('/deleteSlots/:id', async function(req,res,next){
    try {
        const payload = {
            // ?? null - set the value to null if the user does not provide any input 
            // malformed input + error handling will be in the slot management service
            // + in the UI itself
            id: req.params.id ?? null,
        };
        publishToBroker('pub_dentistServer', TOPIC.delete_slot, payload, res, 'Time slot deleted successfully');
    } catch (err) {
        next(err);
    }
});

module.exports = router;