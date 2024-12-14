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
        console.log("currentDentist: "+currentDentist);
        var jsonDentist = JSON.parse(currentDentist);
        console.log("jsonDentist"+jsonDentist);
        var dentistId = jsonDentist.dentist;
        console.log("denistId: "+dentistId);
        

        /*
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON to enable to save it in db
        */


        
        // Filter the schedule for the current dentist

        /*
        var filteredSchedule = scheduleCache.data
        ? scheduleCache.data.filter((timeslot) => timeslot.dentist.toString() === currentDentist)
        : ['nothing found'];
        */

        let filteredSchedule = [];
        //filteredSchedule = scheduleCache.filter(scheduleCache.data.timeslot => scheduleCache.data.timeslot.dentist.toString() === currentDentist );
        // let output = employees.filter(employee => employee.department == "IT");

        //filteredSchedule = {"data": "test tests value semlan" };

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

        console.log("Tiger");
        console.log(filteredSchedule);


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
