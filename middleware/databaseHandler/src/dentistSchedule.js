/*const Timeslot = require('../models/timeslot');
const TOPIC = require('../resources/databaseMqttTopics');
const { dentistClient } = require('../databaseHandler');

async function retrieveDentistSchedule(jsonMessage,client){
    try {
        console.log(jsonMessage);


        const dentistSchedule = await Timeslot.find({
            dentist: jsonMessage.dentist,
        });


        payload = dentistSchedule;

        // MQTT client has to send strings, so transform json --> string 
        const string_payload = JSON.stringify(payload);

        const topic = TOPIC.dentist_schedule;

        client.publish(topic, string_payload, { qos: 2 }, (err) => {
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



module.exports = {
    retrieveDentistSchedule
}*/