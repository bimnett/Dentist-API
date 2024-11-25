/*
This is just a template for how to use MQTT in node.js 
1. Connects to the cloud broker 
2. Ensures a connection with the broker 
3. Subscribes to a topic + waits for message 
4-6. Message print in terminal + Error handling + how to close the connection
*/


const mqtt = require('mqtt');
require('dotenv').config(); // Load .env variables

const options = {
  clientId: 'clientclient', // Set unique client ID
  username: process.env.USERNAME, // Load username from .env
  password: process.env.PASSWORD, // Load password from .env
  connectTimeout: 30000, 
  reconnectPeriod: 1000,  
};

const client = mqtt.connect(process.env.BROKERURL, options);

client.on('connect', () => {
  console.log('Subscriber connected to broker');
  
  const topic = process.env.TOPIC_EXAMPLE;
  client.subscribe(topic, { qos: 2 }, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Received message: ${message.toString()} on topic: ${topic}`);
});

client.on('error', (error) => {
  console.error('Subscriber connection error:', error);
});

client.on('close', () => {
  console.log('Subscriber connection closed');
});
