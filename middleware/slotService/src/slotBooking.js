// update this - shall the logic be this way? 

// This logic shall be MOVED to PATIENT BOOKING SERVICE


/*
const config = require('../../env');

const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in env.js
    password: config.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

function try_to_publish_to_db_handeler(){
    options.clientId = 'pub_slotService'+Math.random().toString(36).substring(2,10); 

    // connect to broker 
    const client = mqtt.connect(config.brokerURL, options);

    client.on('connect', () => {
        console.log('Publisher connected to broker');
    
        const topic = config.topic_slot_management_create;
        
        const payload = { 
            // ?? null - set the value to null if the user does not provide any input 
            // malformed input + error handling will be in the slot managment service
            // or in the UI itself 
            time : req.body.time ?? null,
            date : req.body.date ?? null,
            dentist : req.body.dentist ?? null,
            clinic : req.body.clinic ?? null, 
        }

        const json_payload = JSON.stringify(payload);
    
        client.publish(topic, json_payload, { qos: 2 }, (err) => {
            if (err) {
                console.log('Publish error:', err);
                return res.status(500).json({message: "Unable to connect to the server"});
            } else {
                console.log('Message published successfully!');
                return res.status(201).json({message : " Did send the message"});
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
    
};
*/