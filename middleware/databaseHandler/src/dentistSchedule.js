//const Timeslot = require('../models/timeslot');
//const TOPIC = require('../resources/databaseMqttTopics');
//const { dentistClient } = require('../databaseHandler');
//
//async function retrieveDentistSchedule(jsonMessage,client){
//    try {
//        console.log(jsonMessage);
//
//
//        const dentistSchedule = await Timeslot.find({
//            dentist: jsonMessage.dentist,
//        });
//
//
//        payload = dentistSchedule;
//
//        // MQTT client has to send strings, so transform json --> string 
//        const string_payload = JSON.stringify(payload);
//
//        const topic = TOPIC.dentist_schedule;
//
//        client.publish(topic, string_payload, { qos: 2 }, (err) => {
//            if (err) {
//                console.log('Publish error:', err);
//            } else {
//                // only need to forward the info with pub to db-handler on the rigth topic 
//                // db-handler will insert the new slot in db   
//                console.log('Message published successfully!\n');
//                console.log("the new topic the payload got sent to: "+topic+"\n");
//                console.log(string_payload);
//            }
//        });
//        
//        return dentistSchedule;
//    }catch(err){
//        console.log(err);
//    }
//};
//
//// Function for publishing
//const recurringPublish = async () => {
//
//    try {
//        // Fetch all schedules from the Timeslot collection
//        const schedules = await Timeslot.find({});
//        console.log('Fetched schedules:', schedules);
//
//        // Ensure schedules are in JSON format
//        // Define the topic for publishing cached schedules
//        const payload = JSON.stringify(schedules);
//        const pubTopic = TOPIC.cached_schedule;
//
//        // Publish the fetched schedules to the MQTT broker
//        dentistClient.publish(pubTopic, payload, { qos: 2 }, (err) => {
//            if (err) {
//                console.error('Publish error:', err);
//            } else {
//                console.log('Cached schedule published successfully at:', Date.now());
//            }
//        });
//    } catch (err) {
//        console.error('Error fetching schedules:', err);
//    }
//
//    // Schedule the next execution of the task
//    setTimeout(recurringPublish, 1000 * 60 * 60 * 6); // Call it every 6th hour for caching in scheduleService.js
//};
//
//module.exports = {
//    retrieveDentistSchedule,
//    recurringPublish
//}