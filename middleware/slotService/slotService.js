/* TO DO:
when to close the connection?
currentl all 3 functions use the same client, + all sub functionlites in the 3 functionlaites
if closing it to early all connections will be closed an nothing depending on the client will
be able to continue
*/ 

const mqtt = require('mqtt');
const CREDENTIAL = require('./credentials');
const TOPIC = require('./topics');
const slotManagement = require('./src/slotManagement');

// creat a new time slot 
const options = {
    clientId: "", // You can set a unique client ID here
    username: CREDENTIAL.username, // Use the username defined in env.js
    password: CREDENTIAL.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

options.clientId ='slotService_'+Math.random().toString(36).substring(2,10);

// connect to broker 
const client = mqtt.connect(CREDENTIAL.brokerUrl, options);

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

    switch(topic){

        // create new avaliable time slot 
        case TOPIC.create_new_slot:
            console.log("create_new_slot");
            slotManagement.create_new_slot(message,client);
            break;
        

        //update info of an avaliable slot 
        case TOPIC.update_slot:
            console.log("update_slot");
            slotManagement.update_slot(message, client);
            break;
        

        //delte an avaliable slot 
        case TOPIC.delete_slot:
            slotManagement.delete_slot(message, client);
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
