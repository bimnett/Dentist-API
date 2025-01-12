const mqtt = require('mqtt');
const CREDENTIAL = require('./resources/credentials');
const TOPIC = require('./resources/topics');

const readline = require('node:readline');


// Create dentist and patient MQTT clients for and connect
const patientClient = mqtt.connect(CREDENTIAL.patientUrl);
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);
console.log("Monitoring: ");

// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('MonitoringService connected to the dentist broker');

    dentistClient.subscribe(TOPIC.log_data, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });

    for(const topic of TOPIC.monitored_topics){
        patientClient.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to topic: ${TOPIC.log_data}`);
            }
        });
    }
});

// Connect to patient broker
patientClient.on('connect', async () => {
    console.log('Monitoring Service connected to the patient broker');

    patientClient.subscribe(TOPIC.log_data, { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${TOPIC.log_data}`);
        }
    });

    for(const topic of TOPIC.monitored_topics){
        patientClient.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to topic: ${TOPIC.log_data}`);
            }
        });
    }
});

function messageHandler(topic, message) {
    console.log(`Received message on topic: ${topic}`);
    console.log(`Message content: ${message.toString()}`);

    if(topic !== TOPIC.log_data){
        // Publish request for slots
        dentistClient.publish(TOPIC.log_save, JSON.stringify({
            "topic": topic
        }));
    }
    else{
        const newMessage = message.toString();
        displayLogs(newMessage);
    }

}

patientClient.on('message', (topic, message) => {
    messageHandler(topic, message);
});

dentistClient.on('message', (topic, message) => {
    messageHandler(topic, message);
})



// Initialise user interface
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Choose an option below:\n 1: See logs\n 2: See services\n exit: Close admin panel\n\n"
});

r1.on('line', (line) => {
    r1.pause();
    switch (line.trim()) {
        case "1":
            console.log("Option 1. Loading DB logs...");
            dentistClient.publish(TOPIC.log_request, JSON.stringify({
                null
            }));
            break;
        case "exit":
            r1.close();
            break;
        default:
            console.log("Unknown command, try again");
            r1.resume();
            break;
    }
    r1.prompt();
}).on('close', () => {
    console.log("Have a nice day!");
    process.exit(0);
})

async function displayLogs(){
    console.log(newMessage);
}



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



