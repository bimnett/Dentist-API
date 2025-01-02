const mqtt = require('mqtt');
const CREDENTIAL = require('./credentials');
const TOPIC = require('./topics');
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

client.on('connect', () => {
    console.log('Connected to broker');
    // subscribe to receive data about new slot
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
    console.log(`Received message on topic ${topic}`);

    if(topic === TOPIC.cancel_appointment){
        try{
            let isBooked = parser.parseStatus(message) === "Booked";
            if(isBooked){
                let email = parser.parseEmail(message);
                notifications.notifyCancelation(email);
            }
        } catch (error) {
            console.log(error.stack);
        }

    }

});

client.on('error', (error) => {
    console.log('Connection error:', error);
});

client.on('close', () => {
    console.log('Connection closed');
});
