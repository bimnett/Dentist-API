const mqtt = require('mqtt');
const CREDENTIAL = require('../credentials');
const TOPIC = require('../topics');

// creat a new time slot 
const options = {
    clientId: "", // You can set a unique client ID here
    username: CREDENTIAL.username, // Use the username defined in env.js
    password: CREDENTIAL.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

const slotManagement = require('./src/slotManagement');

options.clientId ='slotService_'+Math.random().toString(36).substring(2,10);

// connect to broker 
const client = mqtt.connect(CREDENTIAL.broker_url, options);

client.on('connect', () => {
    console.log('Subscriber connected to broker');
    // subscribe to recive data about new slot
    const topic = TOPIC.everything;
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.log('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    console.log("In message");
    console.log("topic: "+topic);
    // message = from broker buffer obj.
    // topic the slot service subscribe to 

    switch(topic){

        // create new avaliable time slot 
        case TOPIC.create_new_slot:
            console.log(topic);
            slotManagement.create_new_slot(message,client);
            break;
        

        //update info of an avaliable slot 
        case TOPIC.update_slot:
            slotManagement.update_slot(TOPIC, message, client);
            break;
        

        //delte an avaliable slot 
        case TOPIC.delete_slot:
            slotManagement.delete_slot(topic, message);
            break;

            
        default:
            console.log("default case: ");
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
