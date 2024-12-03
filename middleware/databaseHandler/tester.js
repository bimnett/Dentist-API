/*
This file is used to test database handler service
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
  console.log('Tester successfully connected to broker!');

  const topic = process.env.TOPIC_DATABASE_INSERT;
  const payload = '{"referenceCode": "123"}';
  
  client.publish(topic, payload, { qos: 2 }, (err) => {
    if (err) {
      console.error('Publishing error:', err);
    } else {
      console.log('Message published successfully!');
    }
  });
});

client.on('error', (error) => {
  console.error('Tester connection error:', error);
});

client.on('close', () => {
  console.log('Tester connection closed');
});
