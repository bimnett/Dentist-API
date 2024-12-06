const validation = require('./validation');
const TOPIC = require('./../../topics');

// dentist creats new avaliable time slot
async function create_new_slot(message,client){
// message = from broker, buffer obj.
    //const topic = TOPIC.new_slot_data;
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

            // broker has to send strings so transform json --> string 
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


async function update_slot(TOPIC, message,client){
    try{
        var[time,date,,referenceCode] = await Promise.all([
            validation.validate_time(message),
            validation.validate_date(message),
            /*
            validation.validate_clinic(message),
            validation.validate_dentist(message),
            */
            
            // USE LATER
            //validation.validate_reference_code(message)
        ]);

        // only for now
        referenceCode = true;

        // if everything is valid
        if(time && date && referenceCode){
            // send updated slot info via broker to db-handle

            // can only updat the date, time, treatment
            client.on('connect', () => {

                //UPDATE TOPIC
                const topic = TOPIC.update_slot_data;
                const payload = {
                    date : date,
                    time : time,
                    referenceCode : referenceCode
                }

                // broker has to send strings so transform json --> string 
                const string_payload = JSON.stringify(payload);

                client.publish(topic, string_payload, { qos: 2 }, (err) => {
                    if (err) {
                        console.log('Publish error:', err);
                    } else {
                        console.log('Message published successfully!');
                    }
                });
            });

            client.on('error', (error) => {
                console.log('Publisher connection error:', error);
            });
    
            client.on('close', () => {
                console.log('Publisher connection closed');
            });

            // only need to forward the info with pub to db-handler on the rigth topic 
            // db-handler will insert the new slot in db
            console.log("update slot with referance code: "+ referenceCode);
            console.log("the slot updates has been sent to db-handler succesfully");
        } else {
            console.log("Can't update the slot")
        }
    }catch(error){
        console.log(error);
    }
}


async function delete_slot(topic, message,client){

    // same question as above 
    try{
        var referenceCode = await Promise (validation.validate_reference_code(message));
        if(referenceCode){
            // do pub?

            client.on('connect', () => {
                const topic = config.topic_slot_management_deleted;
                const payload = {
                    referenceCode : referenceCode
                }

                // broker has to send strings so transform json --> string 
                const string_payload = JSON.stringify(payload);

                client.publish(topic, string_payload, { qos: 2 }, (err) => {
                    if (err) {
                        console.log('Publish error:', err);
                    } else {
                        console.log('Message published successfully!');
                    }
                });
            });

            client.on('error', (error) => {
                console.log('Publisher connection error:', error);
            });
    
            client.on('close', () => {
                console.log('Publisher connection closed');
            });

            console.log("delete slot with referance code: "+ referenceCode);
            console.log("the question to delete the slot has been sent to db-handler succesfully");
        } else {
            // do pub here to?
            console.log("Can't delete slot");
        }
    }catch(error){
        console.log(error);
    }
}


module.exports = {
    create_new_slot, 
    update_slot,
    delete_slot
}