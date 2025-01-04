const mqtt = require('mqtt');
const mongoose = require("mongoose");
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/databaseMqttTopics');
const Timeslot = require('./models/timeslot');
const slotManagement = require('./src/slotManagement');
const dentistSchedule = require('./src/dentistSchedule');

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

const subTopic = [
    TOPIC.new_slot_data,
    TOPIC.updated_slot_data,
    TOPIC.deletion_of_slot,
    TOPIC.dentist_id,
    TOPIC.database_request_find
];


// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('databaseHandler connected to the dentist broker');

    for (var i=0; i<subTopic.length; i++){
        dentistClient.subscribe(subTopic[i], { qos: 2 }, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to topic: ${subTopic[i]}`);
            }
        });
    }

    // Fetch all dentist schedules and send to scheduleService for caching
    dentistSchedule.recurringPublish();
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
                const schedule = dentistSchedule.retrieveDentistSchedule(jsonMessage,dentistClient);
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