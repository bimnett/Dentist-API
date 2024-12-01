

// dentist creats new avaliable time slot
async function create_new_slot(options, mqtt, config){
    options.clientId ='pub_slotService'+Math.random().toString(36).substring(2,10);

    // connect to broker 
    const client = mqtt.connect(config.brokerURL, options);

    client.on('connect', () => {
        console.log('Subscriber connected to broker');

        const topic = config.topic_slot_management_create;
        client.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.log('Subscription error:', err);
            } else {
                console.log(`Subscribed to topic: ${topic}`);
            }
        });
    });

    client.on('message', (topic, message) => {
        console.log(`Received message: + ${message} + on topic: + ${topic} :` + '\norigin : slotManagement.js');
        
    });

    client.on('error', (error) => {
        console.log('Subscriber connection error:', error);
    });

    client.on('close', () => {
        console.log('Subscriber connection closed');
    });
    
};



module.exports = {create_new_slot}