```javascript
/* 
This is a template for how to use MQTT in nodeJS with the necessary;
1. Initial setup for running our service
2. Imports
3. Methods
4. Instructions on how to run the code

 
1. Initial setup for running our service || 2. Imports

In order to run the JS files, you need Node. To check if you have Node installed, run: 

  $node -v 

if you don't have node and are using a mac with homebrew installed, run: 

  $brew install node


In order to have a functioning MQTT service you first need to make sure that the MQTT package is inside of your 
package-lock.json. You can do so by first checking if you have it manually or in the terminal run: 

  $npm list mqtt

If you don't have it, run: 

  $npm install mqtt

After you have successfully added MQTT to your dependencies, you can now import it as shown on line below.

Now you can use a broker ( in our case we used an online cloud broker which needed credentials since it demanded a secure connection )
but running it locally works just as fine! However, in the examples below we will be importing the credentials from our 
.env file in order to connect to our broker successfully.

Further, create a .env file in your repo and add it to your .gitignore in order to not leak sensitive information. 
Then, import the file as shown below.



3. Methods

The methods showcased in this example is for 
Publish: 
- connect to the broker 
- publish to the broker on a certain topic
- error handling
- close the connection

Subscribe: 
- connect to the broker 
- subscribe to a topic 
- what to do when receiving a message
- error handling 
- close the connection

These are implemented by firstly ensuring that the mqtt broker is connected through entering the brokerURL as well as 
entering the credentials for the broker. Further, this is then saved into what we called client. The semantics of each 
method then explains what each one does, so for example: 

client.on('connect' () =>{

  This method connects to the broker and the logic for what should happen then should be inside here

})


4. Instructions on how to run the code

In order to run the simple MQTT service below after following all of the steps, you need to
a. create a new file called publisher.js
b. create a new file caleld subscriber.js
c. open two terminals where you will:
terminal 1, run:
  
  $node subscriber.js

terminal 2, run: 

  $node publisher.js

And it's important to subscribe before you publish, since the message will otherwise be lost unless you have
a specified variable to store messages in the MQTT in case the subscription connection was lost, to later
publish the message. 



And that's it! That's a brief explanation of how MQTT works in our system

*/



// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Publish >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 


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

// Connects to the broker 
client.on('connect', () => {
  console.log('Publisher successfully connected to broker!');
  
  const topic = process.env.TOPIC_EXAMPLE;
  const payload = '< Insert message here >';
  
  // Publishes to a topic with a certain payload ( change the payload to what you want to publish)
  client.publish(topic, payload, { qos: 2 }, (err) => {
    if (err) {
      console.error('Publishing error:', err);
    } else {
      console.log('Message published successfully!');
    }
  });
});

// Error handling in case the publisher loses connection
client.on('error', (error) => {
  console.error('Publisher connection error:', error);
});

// Close the connection if needed
client.on('close', () => {
  console.log('Publisher connection closed');
});


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Subscribe >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 


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

// Connects to the broker 
client.on('connect', () => {
  console.log('Subscriber connected to broker');
  
  const topic = process.env.TOPIC_EXAMPLE;

  // Subscribes to a topic ( hidden in the .env file for security)
  client.subscribe(topic, { qos: 2 }, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// What should happen when receiving a message
client.on('message', (topic, message) => {
  console.log(`Received message: ${message.toString()} on topic: ${topic}`);
});
// Error handling in case the subscriber loses connection
client.on('error', (error) => {
  console.error('Subscriber connection error:', error);
});
// Close the connection if needed
client.on('close', () => {
  console.log('Subscriber connection closed');
});
