

// dentist creats new avaliable time slot
async function create_new_slot(TOPIC,message,client){
// message = from broker, buffer obj.

    // when reciving info about the new slot
    try{
        // validate the input 
        var [time, date, clinic, dentist] = await Promise.all([
            validate_time(message),
            validate_date(message),
            /*
            validate_clinic(TOPIC,message,client),
            validate_dentist(TOPIC,message,client)*/
        ]);
        console.log(time,date); 

        // info given is ok --> cretae new slot 
        if(time && date ){
            // send new slot info via broker to db-handler
            client.on('connect', () => {
                const topic = TOPIC.new_slot_data;
                const payload = {
                    date : date,
                    time : time,
                    status: status,
                    patient: patient,
                    dentist : dentist,
                    clinic : clinic,
                    treatment: treatment
                }

                // broker has to send strings so transform json --> string 
                const string_payload = JSON.stringify(payload);

                client.publish(topic, string_payload, { qos: 2 }, (err) => {
                    if (err) {
                        console.log('Publish error:', err);
                    } else {
                        console.log('Message published successfully!');
                        console.log(string_payload);
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
            console.log("create slot for this date: "+ date);
            console.log("the slot has been sent to db-handler succesfully");
        } else {
            console.log("Can't create slot\n");
        }

    } catch (error){
        console.log(error);
    }
    
};


async function update_slot(topic, message,client){
    // question acces db here or via mqtt?
    try{
        var[time,date,clinic,dentist,referenceCode] = await Promise.all([
            validate_time(message),
            validate_date(message),
            /*
            validate_clinic(message),
            validate_dentist(message),
            */
            validate_reference_code(message)
        ]);

        // if everything is valid
        if(time && date && referenceCode){
            // send updated slot info via broker to db-handle

            // can only updat the date, time, status, treatment
            client.on('connect', () => {
                const topic = config.topic_slot_management_updated;
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
                        return res.status(500).json({message: "Unable to connect to the server"});
                    } else {
                        console.log('Message published successfully!');
                        return res.status(201).json({message : " Did send the message"});
                    }
                });
            });

            client.on('error', (error) => {
                console.log('Publisher connection error:', error);
                return res.status(500).json({message : "Could not connect to server"})
            });
    
            client.on('close', () => {
                console.log('Publisher connection closed');
                return res.status(200).json({message : "Close connection"});
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
        var referenceCode = await Promise (validate_reference_code(message));
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
                        return res.status(500).json({message: "Unable to connect to the server"});
                    } else {
                        console.log('Message published successfully!');
                        return res.status(201).json({message : " Did send the message"});
                    }
                });
            });

            client.on('error', (error) => {
                console.log('Publisher connection error:', error);
                return res.status(500).json({message : "Could not connect to server"})
            });
    
            client.on('close', () => {
                console.log('Publisher connection closed');
                return res.status(200).json({message : "Close connection"});
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


async function validate_time(message){
    try {
        console.log(message);
        // maybe need this to makeit as a string first
        const jsonMessage = JSON.parse(message.toString());
        console.log(jsonMessage);
        //const jsonMessage = JSON.parse(message);
        const date = jsonMessage.date;
        const time = jsonMessage.time;
        const messageHour = time.slice(0,2);
        const messageMinutes = time.slice(3,5);
        
        const currentDate = new Date().toJSON().slice(0, 10);
        const currentHour = new Date().toJSON().slice(11,13);
        const currentMinutes = new Date().toJSON().slice(14,16);
        
        // Number --> to compare to numbers instead of strings 
        // valid time: hour 0-23, min 00:59
        if(Number(messageHour)<Number(0) || Number(messageHour)>Number(23) || Number(messageMinutes)<Number(0) || Number(messageMinutes)>Number(59)){
            return false;
        }

        // book the same day
        if(date == currentDate){
            // time have passed today, e.g today now 12:00 but want to insert today at 10:00
            if( Number(messageHour) < Number(currentHour) ){
                return false;
            }
            // now 15:34 but want to book 15:10
            if( Number(messageMinutes) < Number(currentMinutes) ){
                return false;
            }
            // now 12:15 but want to book 18:00
            return true;
        }

        // everything ok
        return true;
        
    }catch(error){
        console.log(error)
    }
};


async function validate_date(message){
    try {
        // maybe need this to makeit as a string first
        const jsonMessage = JSON.parse(message.toString());
        //const jsonMessage = JSON.parse(message);
        const date = jsonMessage.date;
        const currentDate = new Date().toJSON().slice(0, 10);

        // date has paased
        if(date<currentDate){
            return false;
        }

        //everything ok
        return true;

    }catch(error){
        console.log(error);
    }
};


async function validate_clinic(TOPIC,message,client){
    return new Promise((resolve, reject) => {
    // message = from broker, buffer obj.
        try{
            console.log(message);
            // extract the clinic name from message
            var string_message = message.toString();
            console.log(string_message);
            var json_message = string_message;
            var clinic_name = json_message.clinic;

            // what will be published to the broker
            var payload = {};

            // look up if choosen clinic exist in database
            // retrive the clinic from database via broker & database handler
            client.on('connect', () => {
                
                // also connect the same client to enable publishing
                var topic = TOPIC.specific_clinict;
                const payload = { 
                    clinic : clinic_name
                }

                // prepare the clinic name so it can be sent via broker
                const json_payload = JSON.stringify(payload);
            
                // publish desierd clinic name via broker to db-handler
                client.publish(topic, json_payload, { qos: 2 }, (err) => {
                    if (err) {
                        console.log('Publish error:', err);
                    } else {
                        console.log('Message published successfully!: ' + clinic_name);
                    }
                });


                // subscribing to the db to see if clinic exists 
                topic = TOPIC.retrived_specific_clinic;
                client.subscribe(topic, {qos:2}, (err) => {
                    if(err){
                        console.log('Subscrition error', err);
                    }else {
                        console.log(`Subscribed to topic: ${topic}`);
                    }
                });
            });

            // when reciving the clinic name
            client.on('message', (topic, message) => {
                //console.log(`Received message: + ${message} + on topic: + ${topic}`);
                payload = message;

                // validate the clinic 
                if(payload==null){
                    return false;
                }

                // prepare the clinic name so it can be validated 
                const jsonMessage = JSON.parse(payload);
                const clinic = jsonMessage.clinic;

                // if the clinic exist in database
                if(clinic===payload){
                    return true;
                } else {
                    return false;
                }
            });

            client.on('error', (error) => {
                console.log('Subscriber connection error:', error);
            });

            client.on('close', () => {
                console.log('Subscriber connection closed');
            });


        }catch(err){
            console.log(err);
        }
    });
}


async function validate_dentist(TOPIC,message,client){
    try{
        // extract the clinic name from message
        var string_message = message.toString();
        var json_message = JSON.parse(string_message);
        var dentist_name = json_message.dentist;

        // what will be published to the broker
        var payload = {};

        client.on('connect', () => {

            var topic = TOPIC.specific_dentist;
            const payload = { 
                dentist : dentist_name
            }

            const json_payload = JSON.stringify(payload);
        
            client.publish(topic, json_payload, { qos: 2 }, (err) => {
                if (err) {
                    console.log('Publish error:', err);
                } else {
                    console.log('Message published successfully!');
                }
            });


            topic = TOPIC.retrieve_specific_dentist;
            client.subscribe(topic, {qos:2}, (err) => {
                if(err){
                    console.log('Subscrition error', err);
                }else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        // look up if dentist in choosen clinic exist in database
        // retrive the dentist from database via broker & database handler

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            payload = message;
            const jsonMessage = JSON.parse(payload);
            const dentist = jsonMessage.dentist;

            // if the dentist in the choosen clinic exist in database
            if(dentist===payload){
                return true;
            } else {
                return false;
            }
            });

        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
        });

        client.on('close', () => {
            console.log('Subscriber connection closed');
        });

        

    }catch(err){
        console.log(err);
    }
}


async function validate_reference_code(TOPIC,message,client){
    try{

        var payload = "";

        // look up if the booked slot with a referance code exist in database
        // retrive the refrence code from database via broker & database handler
        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = TOPIC.reference_code;
            client.subscribe(topic, {qos:2}, (err) => {
                if(err){
                    console.log('Subscrition error', err);
                }else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        client.on('message', (topic, message) => {
            console.log(`Received message: + ${message} + on topic: + ${topic}`);
            payload = message;
        });

        client.on('error', (error) => {
            console.log('Subscriber connection error:', error);
        });

        client.on('close', () => {
            console.log('Subscriber connection closed');
        });

        const jsonMessage = message.JSON.parse();
        const reference_code = jsonMessage.reference_code;

        // if the reference code exist in database
        if(reference_code===payload){
            return true;
        } else {
            return false;
        }

    }catch(err){
        console.log(err);
    }
}


module.exports = {
    create_new_slot, 
    update_slot,
    delete_slot
}