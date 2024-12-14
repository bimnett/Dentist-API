const mqtt = require('mqtt');
const CREDENTIAL = require('./credentials');
const TOPIC = require('./databaseMqttTopics');
const mongoose = require("mongoose");
const Timeslot = require('./models/timeslot');
const slotManagement = require('./slotManagement');
const dentistSchedule = require('./dentistSchedule');

// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    username: CREDENTIAL.username,
    password: CREDENTIAL.password,
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

const dbURI = CREDENTIAL.mongodb_url;
// Create MQTT client and connect
const client = mqtt.connect(CREDENTIAL.broker_url, options);


// Connect to MongoDB using Mongoose
mongoose.connect(dbURI, { 
    serverSelectionTimeoutMS: 5000,  // Set timeout for DB connection attempts
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));



// Avoid multiple listeners by ensuring they are added once
client.on('connect', () => {
    console.log('databaseHandler connected to broker');
    const topic = '#';
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });

    /*
    const sendDentistSchedule = async () => {
        try {
            const schedule = await Timeslot.find({ dentist: dentistId });
            const topic = TOPIC.dentist_schedule;
            client.publish(topic, JSON.stringify(schedule), { qos: 2 }, (err) => {
                if (err) {
                    console.error('Failed to publish:', err);
                } else {
                    console.log(`Published schedule to ${topic}`);
                }
            });
        } catch (error) {
            console.error('Error fetching or publishing schedule:', error);
        }
    };

    // Call the async function in a setInterval wrapper
    setInterval(() => {
        sendDentistSchedule().catch(err => console.error('Error in schedule interval:', err));
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    */

    // Set a daily interval to query the database and publish timeslots to scheduleService.js
    const publishDailyTimeslots = async () => {
        try {
            const today = new Date();
            const endOf96Hours = new Date(today.getTime() + 96 * 60 * 60 * 1000); // 96 hours ahead

            // Query timeslots for the next 96 hours
            const dentistSchedule = await Timeslot.find({
                date: {
                    $gte: today.toISOString(),
                    $lte: endOf96Hours.toISOString()
                }
            });

            // Publish the timeslots to the scheduleService
            const payload = JSON.stringify(dentistSchedule);
            const topic = TOPIC.cached_schedule;

            client.publish(topic, payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publish error:', err);
                } else {
                    console.log('Daily schedule published successfully');
                }
            });
        } catch (error) {
            console.error('Error querying timeslots or publishing:', error);
        }
    };
    // Schedule the function to run every 6 hours
    const now = new Date();
    const nextSixHours = new Date(
        Math.ceil(now.getTime() / (6 * 60 * 60 * 1000)) * (6 * 60 * 60 * 1000)
    ); 
    // Calculate the next 6-hour mark
    const delay = nextSixHours - now;

    // Publish dentists schedules every 6 hours to scheduleService
    setTimeout(() => {
        publishDailyTimeslots(); // First execution
        //setInterval(publishDailyTimeslots, 6 * 60 * 60 * 1000); 
        setInterval(publishDailyTimeslots, 1 * 60 * 1000); 
    }, delay);

});

// Ensure that message event listener is only registered once
client.on('message', async (topic, message) => {
    console.log(`Received message on topic: ${topic}`);

    try {
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON to enable to save it in db

        // Ensure Mongoose connection is ready before saving data
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose is not connected to the database.');
            return;
        }

        switch (topic){

            case TOPIC.new_slot_data:
                console.log(jsonMessage);
                const newSlot = new Timeslot(jsonMessage);
                await newSlot.save();
                console.log("New slot saved successfully.");
                break;

            case TOPIC.updated_slot_data:
                console.log("try to update\n");
                var updatedSlot = await slotManagement.update_slot_in_db(jsonMessage);
                console.log(updatedSlot);
                break;

            case TOPIC.deletion_of_slot:
                console.log("try to delete\n");
                const deletedSlot = await Timeslot.findByIdAndDelete(jsonMessage.id);
                console.log(deletedSlot);
                break;

            case TOPIC.dentist_id:
                console.log('retrive dentist schedule and send to dentist-ui');
                const schedule = dentistSchedule.retrieveDentistSchedule(jsonMessage,client);
                console.log(schedule);
                break;

            default:
                console.log("default:\n")
                console.log(topic);
                break;                
        }

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
