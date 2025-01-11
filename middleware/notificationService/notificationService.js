const mqtt = require('mqtt');
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/topics');
const notifications = require('./src/notificationManager')
const parser = require('./src/parser')

// creat a new time slot
const options = {
    clientId: "", // You can set a unique client ID here
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

options.clientId ='notificationService_'+Math.random().toString(36).substring(2,10);

// connect to broker
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

// function to handle cancel appointment messages
function handleCancelAppointment(message) {
    try {
        const isBooked = parser.parseStatus(message) === "Booked";
        if (isBooked) {
            const email = parser.parseEmail(message);
            notifications.notifyCancelation(email);
            console.log(`Notification sent for appointment cancellation to ${email}`);
        }
    } catch (error) {
        console.error('Error handling cancel appointment message:', error.stack);
    }
}

// on connect
client.on('connect', () => {
    console.log('Connected to broker');
    subscribeToTopic(client, TOPIC.everything, 'Subscribed to all topics for notification service.');
});

// on message
client.on('message', (topic, message) => {
    console.log(`Received message on topic: ${topic}`);
    console.log(`Message content: ${message.toString()}`);

    switch (topic) {
        case TOPIC.cancel_appointment:
            console.log('Handling appointment cancellation...');
            handleCancelAppointment(message);
            break;

        default:
            console.warn(`Unhandled topic: ${topic}`);
            break;
    }
});

// on error
client.on('error', (error) => {
    console.error('Connection error:', error);
});

// on close
client.on('close', () => {
    console.log('Connection closed');
});