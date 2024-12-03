var express = require('express');
var router= express.Router();
const mqtt = require('mqtt');
const config = require('../../../env');


const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in env.js
    password: config.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
  }

// // MQTT Client (For persistent Connection)
// const mqttClient = mqtt.connect(config.BROKERURL, {
//     clientId: "patientServer_" + Math.random().toString(16).substr(2, 8),
//     username: config.username,
//     password: config.password,
//     connectTimeout: 30000,
//     reconnectPeriod: 1000,
// });

// mqttClient.on('connect', () => {
//     console.log('Connected to MQTT broker');
// });
// mqttClient.on('error', (error) => {
//     console.error('MQTT connection error:', error);
// });
// mqttClient.on('close', () => {
//     console.log('MQTT connection closed');
// });

// get all clinics 
router.get('/bookAppointments/clinics', async function(req,res,next){
    try {
       
        options.clientId = "sub_patientServer"+Math.random().toString(36).substring(2,10);
         // subscribe to the topic that will give us all the clinics 
        const client = mqtt.connect(config.BROKERURL, options);
          
        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_all_clinics;
            
            client.subscribe(topic, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });
          
        client.on('message', (topic, message) => {
            console.log(`Received message in json format: + ${message} + on topic: + ${topic}`);
            // response to end user
            return res.status(200).json(message);
        });
        
        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
            return res.status(500).json({ message : "Unable to connect to the server"})
        });
        
        client.on('close', () => {
            console.log('Subscriber connection closed');
            return res.status(200).json({message : "Closed connection"});
        });

    } catch(e){
        return next(e);
    }
});

// get all dentists in a specific clinic by clinicId
router.get('/bookAppointments/clinics/:clinicId/dentists', async function(req, res, next){
    try {
        options.clientId = "sub_patienService"+Math.random().toString(36).substring(2,10); // random clientId
        const client = mqtt.connect(config.BROKERURL, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = config.topic_clinic_dentists;
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
            return res.status(500).json({message: "Could not connect to server"});
        });

        client.on('close', () => {
            console.log('Subscriber connection closed');
            return res.status(200).json({message : "Closed connection"});
        });

    }catch(e){
        return next(e);
    }
});

// get a dentist time-slots 
router.get('/bookAppointments/clinics/:clinicId/:dentistId/timeschedual', async function(req,res,next){
    try {
        options.clientId = "sub_patientService"+Math.random().toString(36).substring(2,10); // random clientId
        const client = mqtt.connect(config.BROKERURL, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_clinic_dentist_slots;

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

    }catch(e){
        return next(e);
    }
});

// get the info from a newly posted slot 
router.get('/bookAppointments', async function(req,res,next){

    try {

        options.clientId =  'sub_patientService'+Math.random().toString(36).substring(2,10);
        // connect to broker 
        const client = mqtt.connect(config.BROKERURL, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_dentist_new_slots;

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

//  get appointment info by reference code 
router.get('/bookAppointments/:appointmentId', async function(req,res,next){
    try {
        options.clientId ='sub_patientService'+Math.random().toString(36).substring(2,10);
        const client = mqtt.connect(config.BROKERURL, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = config.topic_appointment_info;
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