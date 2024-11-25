/*
This is just a template for how to use MQTT in node.js 
1. Logs in with credentials to the cloud broker  
2. Ensures a connection with the broker 
3. Publishes the message 
4-5. Error handling + how to close the connection
*/

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

client.on('connect', () => {
  console.log('Publisher successfully connected to broker!');
  
  const topic = process.env.TOPIC_EXAMPLE;
  const payload = '< Insert message here >';
  
  client.publish(topic, payload, { qos: 2 }, (err) => {
    if (err) {
      console.error('Publishing error:', err);
    } else {
      console.log('Message published successfully!');
    }
  });
});

client.on('error', (error) => {
  console.error('Publisher connection error:', error);
});

client.on('close', () => {
  console.log('Publisher connection closed');
});
