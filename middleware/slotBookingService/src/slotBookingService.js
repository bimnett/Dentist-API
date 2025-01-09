const mqtt = require('mqtt');
const TOPICS = require('./resources/mqttTopics');

class SlotBookingService {
    constructor(internalBrokerUrl, publicBrokerUrl) {
        this.internalClient = null;
        this.publicClient = null;
        this.initialize(internalBrokerUrl, publicBrokerUrl);
    }

    initialize(internalBrokerUrl, publicBrokerUrl) {
        this.internalClient = this.createMqttClient(internalBrokerUrl, 'internal');
        this.publicClient = this.createMqttClient(publicBrokerUrl, 'public');

        this.subscribeToTopic(this.internalClient, 'database/response/reservation/#', 'Subscribed to reservation responses.');
    }

    createMqttClient(brokerUrl, clientType) {
        const client = mqtt.connect(brokerUrl);
        client.on('connect', () => console.log(`Connected to ${clientType} broker.`));
        client.on('error', (error) => console.error(`${clientType} broker error:`, error));
        client.on('close', () => console.log(`${clientType} broker connection closed.`));
        return client;
    }

    subscribeToTopic(client, topic, logMessage) {
        client.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                console.error(`Subscription error for topic ${topic}:`, err);
            } else {
                console.log(logMessage);
            }
        });
    }

    publishToTopic(client, topic, payload, logMessage) {
        client.publish(topic, JSON.stringify(payload), { qos: 2 }, (err) => {
            if (err) {
                console.error(`Publish error for topic ${topic}:`, err);
            } else {
                console.log(`${logMessage} Topic: ${topic}, Payload: ${JSON.stringify(payload)}`);
            }
        });
    }

    updateSlotStatusToReserved(slot) {
        if (!slot) {
            console.error('Slot data missing in reservation response.');
            return;
        }

        const topic = `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}`;
        const payload = {
            type: 'RESERVED',
            date: slot.date,
            time: slot.time,
            clinic: slot.clinic,
            dentistId: slot.dentist,
            timestamp: new Date().toISOString(),
        };

        this.publishToTopic(this.publicClient, topic, payload, `Slot reserved for ${slot.date} at ${slot.time}.`);
    }

    shutdown() {
        if (this.internalClient) this.internalClient.end();
        if (this.publicClient) this.publicClient.end();
        console.log('SlotBookingService has been shut down.');
    }
}

module.exports = SlotBookingService;
