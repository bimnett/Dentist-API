const mqtt = require('mqtt');
const mongoose = require("mongoose");
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/databaseMqttTopics');
const Timeslot = require('./models/timeslot');
const slotManagement = require('./src/slotManagement');
//const dentistSchedule = require('./src/dentistSchedule');


// Connect to MongoDB using Mongoose
mongoose.connect(CREDENTIAL.mongodbUrl, { 
    serverSelectionTimeoutMS: 5000,  // Set timeout for DB connection attempts
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));


// Create and connect to dentist MQTT client
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);

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
    //dentistSchedule.recurringPublish();
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

                try {
                    const deletedSlot = await Timeslot.findByIdAndDelete(jsonMessage.id);
                    console.log(deletedSlot);

                    let payload = JSON.stringify({data: deletedSlot, error: null});

                    dentistClient.publish(TOPIC.notification_cancel, payload);
                } catch(err){
                    console.log("Error deleting slot:", err);
                    dentistClient.publish(TOPIC.notification_cancel, JSON.stringify({data: null, error: err}));
                }
            
                break;

            case TOPIC.dentist_id:
                console.log('retrive dentist schedule and send to dentist-ui');
                //const schedule = dentistSchedule.retrieveDentistSchedule(jsonMessage,dentistClient);
                //console.log(schedule);
                dentistClient.publish(TOPIC.dentist_schedule, JSON.stringify([]));
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