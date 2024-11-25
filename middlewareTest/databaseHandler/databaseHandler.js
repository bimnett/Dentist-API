var mongoose = require('mongoose');
const mqtt = require('mqtt');
require('dotenv').config(); // Load .env variables

var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dentist_app';

// Connect to MongoDB
mongoose.connect(mongoURI, { autoIndex: false }).catch(function(err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
}).then(function() {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`); // mistake when forward porting
});


const options = {
    clientId: 'clientclient', // Set unique client ID
    username: process.env.USERNAME, // Load username from .env
    password: process.env.PASSWORD, // Load password from .env
    connectTimeout: 30000,
    reconnectPeriod: 1000,
};

const client = mqtt.connect(process.env.BROKERURL, options);

const INSERT_TOPIC = process.env.TOPIC_DATABASE_INSERT;
const RETRIEVE_TOPIC = process.env.TOPIC_DATABASE_RETRIEVE;
const UPDATE_TOPIC = process.env.TOPIC_DATABASE_UPDATE;

client.on('connect', () => {
    console.log('databaseHandler connected to broker');

    client.subscribe(INSERT_TOPIC, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
    client.subscribe(RETRIEVE_TOPIC, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
    client.subscribe(UPDATE_TOPIC, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);
    if(topic == INSERT_TOPIC){

    }
    if(topic == RETRIEVE_TOPIC){

    }
    if(topic == UPDATE_TOPIC){

    }
});

client.on('error', (error) => {
    console.error('Subscriber connection error:', error);
});

client.on('close', () => {
    console.log('Subscriber connection closed');
});
