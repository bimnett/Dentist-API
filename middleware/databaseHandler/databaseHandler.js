var mongoose = require('mongoose');
const mqtt = require('mqtt');
require('dotenv').config(); // Load .env variables
const config = require('../env');

var mongoURI = config.MONGODB_URI || 'mongodb://localhost:27017/dentist_app';

// Connect to MongoDB
mongoose.connect(mongoURI, { autoIndex: false }).catch(function(err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
}).then(function() {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`); // mistake when forward porting
});

// Import data model
let Timeslot = require('./models/timeslot');

// MQTT connection
const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in env.js
    password: config.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
};

const client = mqtt.connect(config.BROKERURL, options);


const INSERT_TOPIC = config.TOPIC_DATABASE_INSERT;
const RETRIEVE_TOPIC = config.TOPIC_DATABASE_RETRIEVE;
const UPDATE_TOPIC = config.TOPIC_DATABASE_UPDATE;
const INSERT_TOPIC_RESPONSE = config.TOPIC_DATABASE_INSERT_RESPONSE;
const RETRIEVE_TOPIC_RESPONSE = config.TOPIC_DATABASE_RETRIEVE_RESPONSE;
const UPDATE_TOPIC_RESPONSE = config.TOPIC_DATABASE_UPDATE_RESPONSE;

const topics = [INSERT_TOPIC, RETRIEVE_TOPIC, UPDATE_TOPIC];

client.on('connect', () => {
    console.log('databaseHandler connected to broker');

    //subscribe to database topics
    for(let topic of topics){
        client.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    }
});

client.on('message', async (topic, message) => {
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);
    let data = JSON.parse(message.toString());

    let pubTopic = null;
    let payload = null;

    if(topic == INSERT_TOPIC){
        let newTimeslot = new Timeslot(data);
        try{
            await newTimeslot.save();
            payload = "New timeslot inserted successfully: " + newTimeslot;
            pubTopic = INSERT_TOPIC_RESPONSE;
            console.log(payload);
        } catch (err) {
            console.error(err);
        }
    }
    else if(topic == RETRIEVE_TOPIC){
        try{
            let timeslots = await Timeslot.find();
            payload = timeslots;
            pubTopic = RETRIEVE_TOPIC_RESPONSE;
        } catch (err){
            console.error(err);
        }
    }
    else if(topic == UPDATE_TOPIC){
        //todo
    }
    else {
        console.error("Error: unknown topic");
    }

    if(!pubTopic || !payload){
        console.error("An error occurred");//todo implement proper error handling;
    } else {
        client.publish(pubTopic, payload, { qos: 2 }, (err) => {
            if (err) {
                console.error('Publishing error:', err);
            } else {
                console.log('Message published successfully!');
            }
        });
    }

});

client.on('error', (error) => {
    console.error('DatabaseHandler mqtt connection error:', error);
});

client.on('close', () => {
    console.log('DatabaseHandler connection closed');
});
