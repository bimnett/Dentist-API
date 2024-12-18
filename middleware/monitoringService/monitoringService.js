const mqtt = require('mqtt');
const CREDENTIAL = require('./credentials');
const TOPIC = require('./databaseMqttTopics');

// Create dentist and patient MQTT clients for and connect
const patientClient = mqtt.connect(CREDENTIAL.patientUrl);
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);
console.log("Monitoring: ");

// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('databaseHandler connected to the dentist broker');

    dentistClient.subscribe(TOPIC.log_data, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });

    // Fetch all dentist schedules and send to scheduleService for caching
    recurringPublish();
});

// Connect to patient broker
patientClient.on('connect', async () => {
    console.log('databaseHandler connected to the patient broker');

    patientClient.subscribe(TOPIC.log_data, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${TOPIC.log_data}`);
        }
    });
});










/* Save logs 
 * 1. go to each api endpoint 
 * 2. send a log to db-handler on topic LOGS
 * 3. Insert the logs in the db via db-handler 
 */

//------------

/* Retrive logs 
 * 1. Query db on log collection in db-handler
 * 2. send it to monitoring service 
 * 3. Show the logs in monitoring-UI
 */




/*
console.log("Choose one of the following alternitives: ");
console.log("1. See logs");
console.log("2.");
*/


