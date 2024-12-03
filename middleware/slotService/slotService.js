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
            - referance code - shall I create it or shall we use mongoDb:s one
        */

        // create new avaliable time slot 
        case config.topic_slot_management_create:
            slotManagement.create_new_slot(topic,message);
            break;
        

        //update info of an avaliable slot 
        case config.topic_slot_management_update:
            slotManagement.update_slot(topic, message);
            break;
        

        //delte an avaliable slot 
        case config.topic_slot_management_delete:
            slotManagement.delete_slot(topic, message);
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
