const mqtt = require('mqtt');
const CREDENTIAL = require('../credentials');
const TOPIC = require('../topics');
const mongoose = require("mongoose");

// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    username: CREDENTIAL.username,
    password: CREDENTIAL.password,
    connectTimeout: 30000,
    reconnectPeriod: 1000
};


const dbURI = CREDENTIAL.mongodb_url;

// Connect to MongoDB using Mongoose
mongoose.connect(dbURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,  // Set timeout for DB connection attempts
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Import the Timeslot model after the connection is established
const Timeslot = require('./models/timeslot');

// Create MQTT client and connect
const client = mqtt.connect(CREDENTIAL.broker_url, options);

// Avoid multiple listeners by ensuring they are added once
client.on('connect', () => {
    console.log('databaseHandler connected to broker');
    const topic = TOPIC.everything;
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

// Ensure that message event listener is only registered once
client.on('message', async (topic, message) => {
    console.log(`Received message on topic: ${topic}`);

    try {
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON

        // Ensure Mongoose connection is ready before saving data
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose is not connected to the database.');
            return;
        }

        if(topic === "dentist/slot/create/new/slot"){
            const newSlot = new Timeslot(jsonMessage);
            await newSlot.save();
            console.log("New slot saved successfully.");
        }
/*
        switch (topic) {
            case TOPIC.specific_clinic:
                const newSlot = new Timeslot(jsonMessage);
                await newSlot.save();
                break;
            case TOPIC.specific_dentist:
                slotManagement.retrieve_specific_dentist(TOPIC, message, client, Clinic);
                break;
            case TOPIC.new_slot_data:
                slotManagement.insert_new_slot(message, Timeslot);
                break;
            default:
                console.log('Unknown topic:', topic);
                break;
        }*/
    } catch (err) {
        console.error('Error processing message:', err);
    }
});

client.on('error', (error) => {
    console.error('DatabaseHandler mqtt connection error:', error);
});

client.on('close', () => {
    console.log('DatabaseHandler connection closed');
});

// Validate clinic function now returns a Promise to ensure asynchronous flow
async function validate_clinic(TOPIC, message, client) {
    return new Promise((resolve, reject) => {
        try {
            const string_message = message.toString();
            const json_message = JSON.parse(string_message);
            const clinic_name = json_message.clinic;

            const topic = TOPIC.specific_clinic;
            const payload = { clinic: clinic_name };
            const json_payload = JSON.stringify(payload);

            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                    reject(err);  // Reject if there was a publish error
                } else {
                    console.log('Message published successfully:', clinic_name);
                }
            });

            const subscriptionTopic = TOPIC.retrived_specific_clinic;
            client.subscribe(subscriptionTopic, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Subscription error', err);
                    reject(err);  // Reject if there was a subscription error
                } else {
                    console.log(`Subscribed to topic: ${subscriptionTopic}`);
                }
            });

            // Listen for the specific clinic response
            client.on('message', (topic, responseMessage) => {
                if (topic === subscriptionTopic) {
                    const response = responseMessage.toString();
                    try {
                        const responseJson = JSON.parse(response);
                        if (responseJson.clinic === clinic_name) {
                            resolve(true);  // Resolve with true if clinic matches
                        } else {
                            resolve(false);  // Resolve with false if clinic doesn't match
                        }
                    } catch (err) {
                        reject(err);  // Reject if there's an error parsing the response
                    }
                }
            });
        } catch (err) {
            console.log('Error in validate_clinic:', err);
            reject(err);  // Reject the Promise if there is an error
        }
    });
}
