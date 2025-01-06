const mqtt = require('mqtt');
const mongoose = require("mongoose");
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/databaseMqttTopics');
const Timeslot = require('./models/timeslot');
const slotManagement = require('./src/slotManagement');
//const dentistSchedule = require('./src/dentistSchedule');
//const date = reqiure('date');


// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

const dbURI = CREDENTIAL.mongodbUrl;
// Create dentist and MQTT client for and connect
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);
exports.dentistClient = dentistClient;


// Connect to MongoDB using Mongoose
mongoose.connect(CREDENTIAL.mongodbUrl, { 
    serverSelectionTimeoutMS: 5000,  // Set timeout for DB connection attempts
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// For sending cahsed dentistSchedule to the scheduleService
const recurringPublish = async () => {

    try {
        // Fetch all schedules from the Timeslot collection
        //const schedules = await Timeslot.find({});

        const currentDate = new Date().toISOString().split('T')[0];  // Get the current date in 'YYYY-MM-DD' format

        const schedules = await Timeslot.find({
        status: 'Booked',
        date: { $gte: currentDate }  // Compare dates, ensuring 'date' field is from today onward
        });

        console.log('Fetched schedules:', schedules);

        // Ensure schedules are in JSON format
        // Define the topic for publishing cached schedules
        const payload = JSON.stringify(schedules);
        const pubTopic = TOPIC.cached_schedule;

        // Publish the fetched schedules to the MQTT broker
        dentistClient.publish(pubTopic, payload, { qos: 2 }, (err) => {
            if (err) {
                console.error('Publish error:', err);
            } else {
                console.log('Cached schedule published successfully at:', Date.now());
            }
        });
    } catch (err) {
        console.error('Error fetching schedules:', err);
    }

    // Schedule the next execution of the task
    setTimeout(recurringPublish, 1000 * 60 * 60 * 6); // Call it every 6th hour for caching in scheduleService.js
};



// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('databaseHandler connected to the dentist broker');

    dentistClient.subscribe('+/database/#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'+/database/#'}`);
        }
    });

    dentistClient.subscribe('/database/#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'/database/#'}`);
        }
    });

    // Fetch all dentist schedules and send to scheduleService for caching
    recurringPublish();
});

// Ensure that message event listener is only registered once
dentistClient.on('message', async (topic, message) => {

    // Ignore messages that we send
    if(topic.startsWith('database/response')){
        return;
    }

    try {
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON to enable to save it in db

        console.log('Incoming topic:', topic);

        // Ensure Mongoose connection is ready before saving data
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose is not connected to the database.');
            return;
        }

        switch (topic){

            // insert new time slot in db
            case TOPIC.new_slot_data:
                console.log(jsonMessage);
                const newSlot = new Timeslot(jsonMessage);
                await newSlot.save();
                console.log("New slot saved successfully.");
                break;

            // update an existing slot in db
            case TOPIC.updated_slot_data:
                console.log("try to update\n");
                var updatedSlot = await slotManagement.updateSlotInDb(jsonMessage);
                console.log(updatedSlot);
                break;

            // delete slot from db
            //case TOPIC.dentist_delete_slot:
            case TOPIC.deletion_of_slot:
                console.log("try to delete\n");
                const deletedSlot = await Timeslot.findByIdAndDelete(jsonMessage.id);
                console.log(deletedSlot);

                let publish_topic = TOPIC.notification_cancel;
                let payload = JSON.stringify(deletedSlot);

                dentistClient.publish(TOPIC.notification_cancel, JSON.stringify({
                    data: deletedSlot,
                    error: null
                }));

                break;

            case TOPIC.dentist_id:
                console.log('retrive dentist schedule and send to dentist-ui');
                const schedule = retrieveDentistSchedule(jsonMessage,dentistClient);
                console.log(schedule);
                break;

            // Queries a specific timeslot ???
            case TOPIC.database_request_find:
                console.log("Processing find request");
                try {
                    const { requestId, query } = jsonMessage;
                    const slot = await Timeslot.findOne(query);

                    // Publish response
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/find`, JSON.stringify({
                        requestId,
                        data: slot,
                        error: null
                    }));

                } catch (error) {

                    // Publish error
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/find`, JSON.stringify({
                        requestId: jsonMessage.requestId,
                        data: null,
                        error: error.message
                    }));
                }
                break;
               
            default:
                console.log("Default case hit. Received topic:", topic);
                break;
        }

    } catch (err) {
        console.error('Error processing message:', err);
    }
});



async function retrieveDentistSchedule(jsonMessage,dentistClient){
    try {
        console.log(jsonMessage);


        const dentistSchedule = await Timeslot.find({
            dentist: jsonMessage.dentist,
        });


        payload = dentistSchedule;

        // MQTT client has to send strings, so transform json --> string 
        const string_payload = JSON.stringify(payload);

        const topic = TOPIC.dentist_schedule;

        dentistClient.publish(topic, string_payload, { qos: 2 }, (err) => {
            if (err) {
                console.log('Publish error:', err);
            } else {
                // only need to forward the info with pub to db-handler on the rigth topic 
                // db-handler will insert the new slot in db   
                console.log('Message published successfully!\n');
                console.log("the new topic the payload got sent to: "+topic+"\n");
                console.log(string_payload);
            }
        });
        
        return dentistSchedule;
    }catch(err){
        console.log(err);
    }
};