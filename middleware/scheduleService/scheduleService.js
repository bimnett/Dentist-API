// imports
const mqtt = require('mqtt');
const TOPIC = require('./topics');
const CREDENTIAL = require('./credentials');

// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    username: CREDENTIAL.username,
    password: CREDENTIAL.password,
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

let scheduleCache = {
    data: null,
    timestamp: null
};
var currentDentist = "";
// Create MQTT client and connect
const client = mqtt.connect(CREDENTIAL.broker_url, options);


// client.on connect
client.on('connect', () => {

    // client.subscribe
    var topic = TOPIC.cached_scheduele;
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });

    topic = TOPIC.dentist_id;
    client.subscribe(topic, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

// client.on message
client.on('message', (topic, message) => {
    if (topic === TOPIC.cached_scheduele) {
        console.log('Received schedule from databaseHandler');
        scheduleCache.data = JSON.parse(message.toString());
        scheduleCache.timestamp = Date.now();
    }else if(topic === TOPIC.dentist_id){
        currentDentist = message.toString();
        // Filter the schedule for the current dentist
        const filteredSchedule = scheduleCache.data
        ? scheduleCache.data.filter((timeslot) => timeslot.dentist.toString() === currentDentist)
        : [];

        var pubTopic = TOPIC.cached_dentist_schedule;
        // client.publisher
        const string_payload = JSON.stringify(filteredSchedule.data);
        topic = TOPIC.
        client.publish(pubTopic, string_payload, { qos: 2 }, (err) => {
            if (err) {
                console.error('Publish error:', err);
            } else {
                console.log('Cached schedule published successfully');
            }
        });
    }
});

//client.on err
client.on('error', (error) => {
    console.error('DatabaseHandler mqtt connection error:', error);
});
//client.on close 
client.on('close', () => {
    console.log('DatabaseHandler connection closed');
});
