// imports
const mqtt = require('mqtt');
const TOPIC = require('./resources/topics');
const CREDENTIAL = require('./resources/credentials');

// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

let scheduleCache = {
    data: null,
    timestamp: null
};

var currentDentist = "";
// Create MQTT client and connect
const client = mqtt.connect(CREDENTIAL.brokerUrl, options);


// client.on connect
client.on('connect', () => {

    // endpoint topic
    var topic_ep = TOPIC.cached_dentist_id;
    // database topic
    var topic_db = TOPIC.cached_schedule;
    client.subscribe(topic_ep, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic_ep}`);
        }
    });
    client.subscribe(topic_db, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${topic_db}`);
        }
    });

});

// client.on message
client.on('message', (topic, message) => {

    // To ensure 96 hours retrival of timeslots for dentists
    if(topic === TOPIC.cached_dentist_id){
        // derive dentist's mongdb id
        currentDentist = message.toString();
        var jsonDentist = JSON.parse(currentDentist);
        var dentistId = jsonDentist.dentist;

        // save a specific dentist's all timeslots
        let filteredSchedule = [];

        // filter out the timelots for certain dentist
        if (scheduleCache.data) {
            for (let i = 0; i < scheduleCache.data.length; i++) {
                console.log("Current timeslot object in cache: " + scheduleCache.data[i].dentist);
                if (scheduleCache.data[i].dentist === dentistId) {
                    filteredSchedule.push(scheduleCache.data[i]); // Add matching item to the array
                }
            }
        } else {
            console.log('Schedule cache is empty.');
        }

        if (filteredSchedule.length === 0) {
            console.log('No schedule found for the current dentist.');
        }

        // prepare the cachedSchedule to send via broker 
        const string_payload = JSON.stringify(filteredSchedule);

        // send chachedSchedule
        const pubTopic = TOPIC.cached_dentist_schedule;
        client.publish(pubTopic, string_payload, { qos: 2 }, (err) => {
            if (err) {
                console.error('Publish error:', err);
            } else {
                console.log(string_payload);
                console.log('Cached schedule published successfully: ' + Date.now());
            }
        });

    // For cashing the timeslot collection 
    } else if (topic === TOPIC.cached_schedule) {
        console.log('Received schedule from databaseHandler');
        scheduleCache.data = JSON.parse(message.toString());
        scheduleCache.timestamp = Date.now();
        console.log("\n"+scheduleCache+"\nRecieved the timeslot collection");
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
