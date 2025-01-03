const Timeslot = require('../models/timeslot');

async function update_slot_in_db(jsonMessage){
    try{
        const updatedSlot = await Timeslot.findByIdAndUpdate(
            jsonMessage._id, // the _id of the timeslot to update
            { 
                date: jsonMessage.date, // New date
                time: jsonMessage.time, // New time
                treatment: jsonMessage.treatment // New treatment type
            },
            { 
                new: true, // Return the updated document, not the original one
                runValidators: true // see so the values fit the Timeslot schema
            }
        );
        return updatedSlot;
    }catch(err){
        console.log(err);
    }
};

// currently un-used
async function retrieve_specific_clinic(TOPIC, message, client, Clinic){
    try {
         // retrive clinic name from message
        var string_message = message.toString();
        var json_message = JSON.parse(string_message);
        var clinic_name = json_message.clinic;

        // look up the clinic name in db
        var clinic = await Clinic.findOne({name:clinic_name});

        // send back the result via mqtt
        var topic = TOPIC.retrieved_specific_clinic

        // send back the result via broker
        var json_payload = JSON.stringify(clinic);
        client.publish(topic, json_payload, { qos: 2 }, (err) => {
            if (err) {
                console.log('Publish error:', err);  
            } else {
                console.log('Message published successfully!'); 
            }
        });

    }catch(err){
        console.log(err);
    }  
}

// currently unused
async function retrieve_specific_dentist(TOPIC, message, client, Clinic){
    try {
         // retrive dentist name from message
        var string_message = message.toString();
        var json_message = JSON.parse(string_message);
        var clinic_name = json_Message.clinic;
        var dentist_name = json_message.dentist;

        // look up the dentists in the desired clinic
        var clinic = await Clinic.findOne({name:clinic_name}).populate('dentists', 'name');

        // clinic exists?
        if (clinic) {
            // Search for dentist in the populated dentists
            const dentist = clinic.dentists.find(dentist => dentist.name === dentist_name);
            
            if (dentist) {
                // dentist exist in clinic

                // send back the result via mqtt
                var topic = TOPIC.retrieved_specific_dentist;

                // send back the result via broker
                var json_payload = JSON.stringify(dentist);
                client.publish(topic, json_payload, { qos: 2 }, (err) => {
                    if (err) {
                        console.log('Publish error:', err);  
                    } else {
                        console.log('Message published successfully!'); 
                    }
                });
            } else {
                // dentist does not exist in clinic
                return false;
            }
        } else {
            console.log(clinic_name+ " is not found");
            return false;
        }
    }catch(err){
        console.log(err);
    }  
}


module.exports = {
    update_slot_in_db,
    retrieve_specific_clinic,
    retrieve_specific_dentist,
}