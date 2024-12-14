const mqtt = require('mqtt');
require('dotenv').config(); // Load .env variables

const options = {
    clientId: 'insertinsert', // Set unique client ID
    username: process.env.USERNAME, // Load username from .env
    password: process.env.PASSWORD, // Load password from .env
    connectTimeout: 30000,
    reconnectPeriod: 1000,
};

const client = mqtt.connect(process.env.BROKERURL, options);

// Connects to the broker
client.on('connect', () => {
    console.log('Publisher successfully connected to broker!');

    const topic = 'testNotification';
    const payload = 'test';

    // Publishes to a topic with a certain payload ( change the payload to what you want to publish)
    client.publish(topic, payload, { qos: 2 }, (err) => {
        if (err) {
            console.error('Publishing error:', err);
        } else {
            console.log('Message published successfully!');
        }
    });
});

// Error handling in case the publisher loses connection
client.on('error', (error) => {
    console.error('Publisher connection error:', error);
});

// Close the connection if needed
client.on('close', () => {
    console.log('Publisher connection closed');
});
