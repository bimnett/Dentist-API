const mqtt = require('mqtt');
const config = require('../env');

// creat a new time slot 
const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in env.js
    password: config.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

const slotManagement = require('./src/slotManagement');
/*
console.log(slotManagement);  // Check what is being imported
var payload = slotManagement.create_new_slot(options, mqtt, config); 
console.log(payload);*/

options.clientId ='slotService_'+Math.random().toString(36).substring(2,10);
// connect to broker 
const client = mqtt.connect(config.BROKERURL, options);
client.on('connect', () => {
    console.log('Subscriber connected to broker');
    // subscribe to recive data about new slot
    const topic = '#';
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.log('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    switch(topic){
        /*QUESTIONS 
            - acces the db directly here or througth the db-handler?
            - ok to update the db-hnadler? so it maches to what happens here?
            - ok to update the topics?
            - help the the ascyn programming
            - referance code - shall I create it or shall we use mongoDb:s one
        */

        // create new avaliable time slot 
        case config.topic_slot_management_create:
    
        
        // LOOK UP ASYNCRONUS PROGRAMMING 
            var time = slotManagement.validate_time(message);
            var date = slotManagement.validate_date(message);
            var clinic = slotManagement.validate_clinic(message);
            var dentist = slotManagement.validate_dentist(message);
        
            var referenceCode = slotManagement.create_referance_code();

            console.log(time,date,clinic,dentist);

            // info given is ok --> cretae new slot 
            // LOOK UP!! --> ASYNCRONUS PROGRAMMING
            if(time && date && clinic && dentist){
                slotManagement.create_new_slot(topic, message);
            } else {
                console.log(time);
                console.log(date);
                console.log(clinic);
                console.log(dentist);
            }

            console.log("create new slot");
           
            break;
        

        //update info of an avaliable slot 
        case config.topic_slot_management_update:

            // validate info 
            var time = slotManagement.validate_time(message);
            var date = slotManagement.validate_date(message);
            var clinic = slotManagement.validate_clinic(message);
            var dentist = slotManagement.validate_dentist(message);
            var referenaceCode = slotManagement.validate_referance_code(message);

            // info ok --> update slot
            if(time && date && clinic && dentist){
                slotManagement.update_slot(topic, message);
            } else {
                console.log(time);
                console.log(date);
                console.log(clinic);
                console.log(dentist);
            }
        
            console.log("Update the slot");
            break;
        

        //delte an avaliable slot 
        case config.topic_slot_management_delete:

            var referance_code = slotManagement.validate_referance_code(message);

            console.log("delteSlot");
            break;

            
        default:
            console.log("topic: "+topic);
            console.log("message:\n "+message);
            break;
    }
     
});

client.on('error', (error) => {
    console.log('Subscriber connection error:', error);
});

client.on('close', () => {
    console.log('Subscriber connection closed');
});
