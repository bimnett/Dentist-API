

// dentist creats new avaliable time slot
async function create_new_slot(topic,message,mqtt,options,config){
    // when reciving info about the new slot
    try{
        // validate the input 
        var [time, date, clinic, dentist] = await Promise.all([
            validate_time(message),
            validate_date(message),
            validate_clinic(message),
            validate_dentist(message)
        ]);
        console.log(time,date,clinic,dentist); 

        // info given is ok --> cretae new slot 
        if(time && date && clinic && dentist){
            
            // send new slot info via broker to db-handler
            options.client = 'pub_slotService_'+Math.random().toString(36).substring(2,10); 
            const client=mqtt.connect(config.BROKERURL, options);

            client.on('connect', () => {
                const topic = config.topic_slot_management_created;
                const payload = {
                    time : time,
                    date : date,
                    dentist : dentist,
                    clinic : clinic 
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
            console.log("create slot for this date: "+ date);
            console.log("the slot has been sent to db-handler succesfully");
        } else {
            console.log("Can't create slot\n");
        }

    } catch (error){
        console.log(error);
    }
    
};


async function update_slot(topic, message){
    // question acces db here or via mqtt?
    try{
        var[time,date,clinic,dentist,referenceCode] = await Promise.all([
            validate_time(message),
            validate_date(message),
            validate_clinic(message),
            validate_dentist(message),
            validate_reference_code(message)
        ]);

        // if everything is valid
        if(time && date && clinic && dentist && referenceCode){
            // send updated slot info via broker to db-handler
            options.client = 'pub_slotService_'+Math.random().toString(36).substring(2,10); 
            const client=mqtt.connect(config.BROKERURL, options);

            client.on('connect', () => {
                const topic = config.topic_slot_management_updated;
                const payload = {
                    time : time,
                    date : date,
                    dentist : dentist,
                    clinic : clinic, 
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


async function delete_slot(topic, message){
    // same question as above 
    try{
        var referenceCode = await Promise (validate_reference_code(message));
        if(referenceCode){
            // do pub?
            options.client = 'pub_slotService_'+Math.random().toString(36).substring(2,10); 
            const client=mqtt.connect(config.BROKERURL, options);

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
        const jsonMessage = JSON.parse(message);
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
        const jsonMessage = JSON.parse(message);
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


async function validate_clinic(message,mqtt,options,config){
    try{

        var payload = "";

        // look up if choosen clinic exist in database
        // retrive the clinic from database via broker & database handler
        options.clientId = "sub_validateClient_"+Math.random().toString(36).substring(2,10);
        const client = mqtt.connect(config.BROKERURL, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_database_retrive_clinic;
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
        const clinic = jsonMessage.clinic;

        // if the clinic exist in database
        if(clinic===payload){
            return true;
        } else {
            return false;
        }

    }catch(err){
        console.log(err);
    }
}


async function validate_dentist(message){
    try{

        var payload = "";

        // look up if dentist in choosen clinic exist in database
        // retrive the dentist from database via broker & database handler
        options.clientId = "sub_validateDentist_"+Math.random().toString(36).substring(2,10);
        const client = mqtt.connect(config.BROKERURL, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_database_retrive_dentist;
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
        const dentist = jsonMessage.dentist;

        // if the dentist in the choosen clinic exist in database
        if(dentist===payload){
            return true;
        } else {
            return false;
        }

    }catch(err){
        console.log(err);
    }
}


async function validate_reference_code(message){
    try{

        var payload = "";

        // look up if the booked slot with a referance code exist in database
        // retrive the refrence code from database via broker & database handler
        options.clientId = "sub_validateReferenceCode_"+Math.random().toString(36).substring(2,10);
        const client = mqtt.connect(config.BROKERURL, options);

        client.on('connect', () => {
            console.log('Subscriber connected to broker');
            const topic = config.topic_database_retrive_reference_code;
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