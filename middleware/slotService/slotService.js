const mqtt = require('mqtt');
const config = require('../env');

// creat a new time slot 
const options = {
    clientId: "", // You can set a unique client ID here
    username: config.username, // Use the username defined in env.js
    password: config.password, // Use the password defined in env.js
    connectTimeout: 30000, // Set the connection timeout to 30 seconds
    reconnectPeriod: 1000,  // Reconnect every 1 second if disconnected
}

const slotManagement = require('./src/slotManagement');

console.log(slotManagement);  // Check what is being imported
slotManagement.create_new_slot(options, mqtt, config); 