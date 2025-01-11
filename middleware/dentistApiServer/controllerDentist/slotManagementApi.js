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


// create new avaliable time slot
router.post('/newSlots', async function(req,res,next){
    try {
        const payload = {
            date: req.body.date ?? null,
            time: req.body.time ?? null,
            status: req.body.status ?? null,
            patient: null,
            dentist: req.body.dentist ?? null,
            clinic: req.body.clinic ?? null,
            treatment: req.body.treatment ?? null,
        };

        const clientId = 'pub_dentistServer' + Math.random().toString(36).substring(2, 10);
        const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

        client.on('connect', () => {
            console.log(`Publisher connected to broker with clientId: ${clientId}`);
            const jsonPayload = JSON.stringify(payload);
    
            client.publish(TOPIC.create_new_slot, jsonPayload, { qos: 2 }, (err) => {
                if (err) {
                    console.error(`Publishing error on topic ${TOPIC.create_new_slot}:`, err);
                    res.status(500).json({ message: `Internal server error` });
                } else {
                    console.log(`Message published successfully to topic ${TOPIC.create_new_slot}:`, jsonPayload);
                    return res.status(201).json({ message: "Slot successfully created" });
                }
                client.end();
            });
        });
    
        client.on('error', (error) => {
            console.error(`MQTT connection error for clientId ${clientId}:`, error);
            res.status(500).json({ message: 'MQTT error' });
        });
    
        client.on('close', () => {
            console.log(`MQTT connection closed for clientId: ${clientId}`);
        });
    } catch (err) {
        next(err);
    }
});

// delete an exisiting slot --> dentit will remove slot from avaliable slots too
router.patch('/updateSlots/:slotId', async function(req,res,next){
    try {
        const payload = {
            _id: req.body.id ?? null,
            date: req.body.date ?? null,
            time: req.body.time ?? null,
            treatment: req.body.treatment ?? null,
        };
        const clientId = 'pub_dentistServer' + Math.random().toString(36).substring(2, 10);
        const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

        client.on('connect', () => {
            console.log(`Publisher connected to broker with clientId: ${clientId}`);
            const jsonPayload = JSON.stringify(payload);
    
            client.publish(TOPIC.update_slot, jsonPayload, { qos: 2 }, (err) => {
                if (err) {
                    console.error(`Publishing error on topic ${TOPIC.update_slot}:`, err);
                    res.status(500).json({ message: `Internal server error` });
                } else {
                    console.log(`Message published successfully to topic ${TOPIC.update_slot}:`, jsonPayload);
                    return res.status(200).json({ message: "Time slot updated successfully" });
                }
                client.end();
            });
        });
    
        client.on('error', (error) => {
            console.error(`MQTT connection error for clientId ${clientId}:`, error);
            res.status(500).json({ message: 'MQTT error' });
        });
    
        client.on('close', () => {
            console.log(`MQTT connection closed for clientId: ${clientId}`);
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/deleteSlots/:id', async function(req,res,next){
    try {
        const payload = {
            id: req.params.id ?? null,
        };
        const clientId = 'pub_dentistServer' + Math.random().toString(36).substring(2, 10);
        const client = mqtt.connect(CREDENTIAL.brokerUrl, { ...options, clientId });

        client.on('connect', () => {
            console.log(`Publisher connected to broker with clientId: ${clientId}`);
            const jsonPayload = JSON.stringify(payload);
    
            client.publish(TOPIC.delete_slot, jsonPayload, { qos: 2 }, (err) => {
                if (err) {
                    console.error(`Publishing error on topic ${TOPIC.delete_slot}:`, err);
                    res.status(500).json({ message: `Internal server error` });
                } else {
                    console.log(`Message published successfully to topic ${TOPIC.delete_slot}:`, jsonPayload);
                    return res.status(200).json({ message: "Time slot deleted successfully" });
                }
                client.end();
            });
        });
    
        client.on('error', (error) => {
            console.error(`MQTT connection error for clientId ${clientId}:`, error);
            res.status(500).json({ message: 'MQTT error' });
        });
    
        client.on('close', () => {
            console.log(`MQTT connection closed for clientId: ${clientId}`);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;