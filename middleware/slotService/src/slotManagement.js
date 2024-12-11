const validation = require('./validation');
const TOPIC = require('../../topics');

// dentist creats new avaliable time slot
async function create_new_slot(message,client){
    // when reciving info about the new slot
    try{
        // validate the input 
        var [time, date, clinic, dentist] = await Promise.all([
            validation.validate_time(message),
            validation.validate_date(message),
            /*
            validation.validate_clinic(TOPIC,message,client),
            validation.validate_dentist(TOPIC,message,client)
            */
        ]);
        console.log(time,date); 

        console.log(message);

        // prepare info to be transform to json to then send via broker to db
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse to JSON
        console.log(jsonMessage);

        // info given is ok --> create new slot 
        // send new slot info via broker to db-handler
        if(time && date){
            const topic = TOPIC.new_slot_data;
            const payload = {
                date : jsonMessage.date,
                time : jsonMessage.time,
                status: jsonMessage.status,
                patient: jsonMessage.patient,
                dentist : jsonMessage.dentist,
                clinic : jsonMessage.clinic,
                treatment: jsonMessage.treatment
            }

            // broker has to send strings, so transform json --> string 
            const string_payload = JSON.stringify(payload);

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

        } else {
            console.log("Could not publish message");
        }

        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
        }); 

    } catch (error){
        console.log(error);
    }
    
};


async function update_slot(message,client){
    try{
        var[time,date,,referenceCode] = await Promise.all([
            validation.validate_time(message),
            validation.validate_date(message),
            //validation.validate_reference_code(message)
        ]);

        // only for now
        referenceCode = true;

        console.log(time,date,referenceCode);
        console.log(message);

        // prepare info to be transform to json to then send via broker to db
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse to JSON
        console.log(jsonMessage);

        // if everything is valid
        if(time && date && referenceCode){
            // send updated slot info via broker to db-handle
            // can only update the date, time, treatment

            // send the valid updated info via broker to db-handler
            const topic = TOPIC.updated_slot_data;
            const payload = {
                _id : jsonMessage._id, // the reference code is the mongoDb autogenerated id
                date : jsonMessage.date,
                time : jsonMessage.time,
                treatment: jsonMessage.treatment,
                referenceCode : jsonMessage.referenceCode
            }

            // broker has to send strings, so transform json --> string 
            const string_payload = JSON.stringify(payload);

            client.publish(topic, string_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            // only need to forward the info with pub to db-handler on the rigth topic 
            // db-handler will insert the new slot in db
            console.log("update slot with referance code: "+ referenceCode);
            console.log("the slot updates has been sent to db-handler succesfully");
        } else {
            console.log("Can't update the slot")
        }

        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
        });

    }catch(error){
        console.log(error);
    }
}


async function delete_slot(message,client){
    try{
        //will use it later when doing error handeling
        //var referenceCode = await Promise (validation.validate_reference_code(message));

        var id = true;
        console.log(id);
        console.log(message);

        
        // if the referance code exist mening a slot exist in db
        if(id){
            // prepare info to be transform to json to then send via broker to db
            const messageString = message.toString();  // Convert Buffer to string
            const jsonMessage = JSON.parse(messageString);  // Parse to JSON
            console.log(jsonMessage);

            
            const topic = TOPIC.deletion_of_slot;
            const payload = {
                id : jsonMessage.id
            }

            // broker has to send strings, so transform json --> string 
            const string_payload = JSON.stringify(payload);

            client.publish(topic, string_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });

            console.log("delete slot with referance code: "+ id);
            console.log("the question to delete the slot has been sent to db-handler succesfully");
        } else {
            console.log("Can't delete slot");
        }

        client.on('error', (error) => {
            console.log('Publisher connection error:', error);
        });

        client.on('close', () => {
            console.log('Publisher connection closed');
        });

    }catch(error){
        console.log(error);
    }
}


module.exports = {
    create_new_slot, 
    update_slot,
    delete_slot
}