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
    if(topic === TOPIC.cached_dentist_id){
        console.log("Horse");
        console.log(scheduleCache)
        console.log("Horse end");
        currentDentist = message.toString();
        // Filter the schedule for the current dentist

        /*
        var filteredSchedule = scheduleCache.data
        ? scheduleCache.data.filter((timeslot) => timeslot.dentist.toString() === currentDentist)
        : ['nothing found'];
        */

        var filteredSchedule = {};
        //filteredSchedule = scheduleCache.filter(scheduleCache.data.timeslot => scheduleCache.data.timeslot.dentist.toString() === currentDentist );
        // let output = employees.filter(employee => employee.department == "IT");

        //filteredSchedule = {"data": "test tests value semlan" };

        for (let i = 0; i <scheduleCache.length; i++){
            if(scheduleCache.data[i].dentist===currentDentist){
                filteredSchedule += scheduleCache[i];
            }
        }


        if (filteredSchedule.length === 0) {
            console.log('No schedule found for the current dentist.');
        }

        // client.publisher
        const string_payload = JSON.stringify(filteredSchedule);

        const pubTopic = TOPIC.cached_dentist_schedule;
        client.publish(pubTopic, string_payload, { qos: 2 }, (err) => {
            if (err) {
                console.error('Publish error:', err);
            } else {
                console.log("Cat");
                console.log(string_payload);
                console.log('Cached schedule published successfully: ' + Date.now());
            }
        });

    } else if (topic === TOPIC.cached_schedule) {
        console.log('Received schedule from databaseHandler');
        scheduleCache.data = JSON.parse(message.toString());
        scheduleCache.timestamp = Date.now();
        console.log("Dog\n"+scheduleCache.data.toString()+"\nRecived the timeslot collection");
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
