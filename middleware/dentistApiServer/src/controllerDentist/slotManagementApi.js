const mqtt = require('mqtt');
const express = require('express');
const router = express.Router();
const CREDENTIAL = require('./credentials');
const TOPIC = require('./topics');
const LOG_USER = 'dentist';
const ORIGIN_SERVER = 'dentistApiServer';


const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}


// create new avaliable time slot
router.post('/newSlots', async function(req,res,next){
    try {
        
        options.clientId = 'pub_dentistServer'+Math.random().toString(36).substring(2,10); 

        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.brokerUrl, options);
        
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
                    return res.status(500).json('Problems with publishing: '+json_payload);
                } else {
                    console.log('Message published successfully!');
                    console.log(json_payload);
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

                    return res.status(200).json({message : "Message published to broker"});
                };
            });
        });
        
        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
            // -------- Log -------------
            // Format the date into YYYY-MM-DD
            const formattedDate = formatTimestamp();

            const payloadLogs = {
                timeStamp: formattedDate,
                user: LOG_USER,
                origin: ORIGIN_SERVER,
                failure: 'error',
                reason: "Publisher lost connection"
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
            return res.status(500).json({message : "Could not connect to server"});
            
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
            return res.status(200).json({message : "Close connection"});
        });
        
    }catch(e){
        next(e);
    }  
});

// delete an exisiting slot --> dentit will remove slot from avaliable slots too
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
                _id: req.body.id ?? null,
                date : req.body.date ?? null,
                time : req.body.time ?? null,
                treatment: req.body.treatment ?? null
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    // -------- Log -------------
                    // Format the date into YYYY-MM-DD
                    const formattedDate = formatTimestamp();

                    const payloadLogs = {
                        timeStamp: formattedDate,
                        user: LOG_USER,
                        origin: ORIGIN_SERVER,
                        failure: 'error',
                        reason: "Publishing error"
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
                    return res.status(500).json('Problems with publishing');
                } else {
                    console.log('Message published successfully!');
                    console.log(json_payload);
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
                    // just sends a response back for now to close the api endpoint
                    return res.status(200).json({message : "Message published to slot-serivce"}); 
                };
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

// delete an existing slot (dentist remove slot and patent will be removed from slot)
router.delete('/deleteSlots/:id', async function(req,res,next){
    try {
        options.clientId = 'pub_dentistServer'+Math.random().toString(36).substring(2,10); 

        // connect to broker 
        const client = mqtt.connect(CREDENTIAL.broker_url, options);
        
        client.on('connect', () => {
            console.log('Publisher connected to broker');
        
            const topic = TOPIC.delete_slot;
            
            const payload = { 
                // ?? null - set the value to null if the user does not provide any input 
                // malformed input + error handling will be in the slot managment service
                // + in the UI itself 
                id: req.body.id ?? null
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    // -------- Log -------------
                    // Format the date into YYYY-MM-DD
                    const formattedDate = formatTimestamp();

                    const payloadLogs = {
                        timeStamp: formattedDate,
                        user: LOG_USER,
                        origin: ORIGIN_SERVER,
                        failure: 'error',
                        reason: "Publishing error"
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
                    return res.status(500).json('Problems with publishing: '+json_payload);
                } else {
                    console.log('Message published successfully!');
                    console.log(json_payload);
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
                    // just sends a response back for now to close the api endpoint
                    res.status(200).json({message : "Message published to broker"});
                };
            });
        });
        
        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
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
            return res.status(500).json({message : "Could not connect to server"})
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
            return res.status(200).json({message : "Close connection"});
        });
    }catch(err){
        console.log(err);
    }
});

async function formatTimestamp(){
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const date = new Date(timestamp); // Convert timestamp to a Date object

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Extract hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the full date and time as YYYY-MM-DD HH:MM:SS
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedTimestamp;
};

module.exports = router;