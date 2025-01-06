/* TO DO:
when to close the connection?
currentl all 3 functions use the same client, + all sub functionlites in the 3 functionlaites
if closing it to early all connections will be closed an nothing depending on the client will
be able to continue
*/ 

const mqtt = require('mqtt');
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/topics');
const slotManagement = require('./src/slotManagement');

// creat a new time slot 
const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

options.clientId ='slotService_'+Math.random().toString(36).substring(2,10);

// create MQTT client and connect to broker 
const client = mqtt.connect(CREDENTIAL.brokerUrl, options);

// helper function to subscribe to topics
function subscribeToTopic(client, topic, logMessage) {
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.error(`Subscription error for topic ${topic}:`, err);
        } else {
            console.log(logMessage || `Subscribed to topic: ${topic}`);
        }
    });
}

// on connect
client.on('connect', () => {
    console.log('Subscriber connected to broker');
    subscribeToTopic(client, TOPIC.everything, 'Subscribed to all topics.');
});

// on message
client.on('message', (topic, message) => {
    console.log(`Message received on topic: ${topic}`);
    console.log(`Message content: ${message.toString()}`);

    try {
        switch (topic) {
            case TOPIC.create_new_slot:
                console.log('Handling create_new_slot...');
                slotManagement.create_new_slot(message, client);
                break;

            case TOPIC.update_slot:
                console.log('Handling update_slot...');
                slotManagement.update_slot(message, client);
                break;

            case TOPIC.delete_slot:
                console.log('Handling delete_slot...');
                slotManagement.delete_slot(message, client);
                break;

            default:
                console.warn(`Unhandled topic: ${topic}`);
                console.log(`Message: ${message.toString()}`);
                break;
        }
    } catch (error) {
        console.error(`Error handling message for topic ${topic}:`, error);
    }
});

// on error
client.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

// on close
client.on('close', () => {
    console.log('MQTT connection closed');
});