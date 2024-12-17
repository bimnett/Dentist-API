var express = require('express');
var router= express.Router();
const mqtt = require('mqtt');
const CREDENTIAL = require('../credentials');
const TOPIC = require('../topics');
const LOG_USER = 'patient';
const ORIGIN_SERVER = 'patientServer';

const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
};


// get all clinics 
router.get('/bookSlots/clinics', async function(req,res,next){
    try {
       
        options.clientId = "sub_patientServer"+Math.random().toString(36).substring(2,10);
         // subscribe to the topic that will give us all the clinics 
        const client = mqtt.connect(CREDENTIAL.brokerUrl, options);
          
        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = TOPIC.all_clinics;
            
            client.subscribe(topic, { qos: 2 }, (err) => {
                if (err) {
                    // -------- Log -------------
                    // Format the date into YYYY-MM-DD
                    const formattedDate = formatTimestamp();

                    const payloadLogs = {
                        timeStamp: formattedDate,
                        user: LOG_USER,
                        origin: ORIGIN_SERVER,
                        failure: 'error',
                        reason: "Could not subscribe"
                    }
                    const jsonLogs = JSON.parse(payloadLogs);
                    
                    // publish to db-handler to insert db, logs
                    client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                        if (err) {
                            console.error('Publishing error:', err);
                        } else {
                            console.log('Message published successfully!');
                        }
                    });
                    // ----------- Log end --------
                    console.log('Subscription error:', err);
                } else {
                    // -------- Log -------------
                    // Format the date into YYYY-MM-DD
                    const formattedDate = formatTimestamp();

                    const payloadLogs = {
                        timeStamp: formattedDate,
                        user: LOG_USER,
                        origin: ORIGIN_SERVER,
                        failure: '-',
                        reason: "Subscribed sucessfully"
                    }
                    const jsonLogs = JSON.parse(payloadLogs);
                    
                    // publish to db-handler to insert db, logs
                    client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                        if (err) {
                            console.error('Publishing error:', err);
                        } else {
                            console.log('Message published successfully!');
                        }
                    });
                    // ----------- Log end --------
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });
          
        client.on('message', (topic, message) => {
            console.log(`Received message in json format: + ${message} + on topic: + ${topic}`);
            // Unsubscribe from the topic and close the connection
            

            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: '-',
                reason: "Published message to slotService"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
            // response to end user
            res.status(200).json(message);
            return client.unsubscribe(topic, () => {
                console.log(`Unsubscribed from topic: ${topic}`);
            });
        });
        
        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: 'error',
                reason: "Connection error"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
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
router.get('/bookSlots/clinics/:clinicId/dentists', async function(req, res, next){
    try {
        options.clientId = "sub_patienService"+Math.random().toString(36).substring(2,10); // random clientId
        const client = mqtt.connect(CREDENTIAL.broker_url, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');

            const topic = TOPIC.clinic_dentists;
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
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: '-',
                reason: "Recived message sucessfully"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
            res.status(200).json(message);
            return client.unsubscribe(topic, () => {
                console.log(`Unsubscribed from topic: ${topic}`);
            });
        });

        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: 'error',
                reason: "Connection error"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
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
router.get('/bookSlots/clinics/:clinicId/:dentistId/timeschedual', async function(req,res,next){
    try {
        options.clientId = "sub_patientService"+Math.random().toString(36).substring(2,10); // random clientId
        const client = mqtt.connect(CREDENTIAL.broker_url, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = TOPIC.clinic_dentist_slots;

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
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: '-',
                reason: "Recived message sucessfully"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
            res.status(200).json(message);
            return client.unsubscribe(topic, () => {
                console.log(`Unsubscribed from topic: ${topic}`);
            });
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
router.get('/bookSlots', async function(req,res,next){

    try {

        options.clientId =  'sub_patientService'+Math.random().toString(36).substring(2,10);
        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
    
        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = TOPIC.dentist_new_slots;

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
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: '-',
                reason: "Recived message sucessfully"
            }
            const jsonLogs = JSON.parse(payloadLogs);
            
            // publish to db-handler to insert db, logs
            client.publish(TOPIC.logs, jsonLogs, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publishing error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });
            // ----------- Log end --------
            res.status(200).json(message);
            return client.unsubscribe(topic, () => {
                console.log(`Unsubscribed from topic: ${topic}`);
            }); 
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