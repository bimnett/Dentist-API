const mqtt = require('mqtt');
const TOPICS = require('./resources/mqttTopics');

class SlotAvailabilityService {
    constructor(internalBrokerUrl, publicBrokerUrl) {
        this.internalClient = null;
        this.publicClient = null;
        this.cleanupInterval = null;
        this.initialize(internalBrokerUrl, publicBrokerUrl);
    }

    initialize(internalBrokerUrl, publicBrokerUrl) {
        this.internalClient = this.createMqttClient(internalBrokerUrl, 'internal');
        this.publicClient = this.createMqttClient(publicBrokerUrl, 'public');

        this.subscribeToTopic(this.internalClient, 'database/response/timeslot/#', 'Subscribed to timeslot responses.');
        this.subscribeToTopic(this.internalClient, TOPICS.DATABASE_RESPONSE_CHECK_EXPIRED_RESERVATIONS, 'Subscribed to cleanup responses.');

        this.startCleanupInterval();
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

    startCleanupInterval() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        this.cleanupInterval = setInterval(() => this.cleanupExpiredReservations(), 60000);
    }

    cleanupExpiredReservations() {
        const cutoffTime = new Date(Date.now() - 15 * 60000); // 15 mins ago
        this.publishToTopic(
            this.internalClient,
            TOPICS.DATABASE_REQUEST_CHECK_EXPIRED_RESERVATIONS,
            { cutOffTime: cutoffTime },
            'Requested expired reservations cleanup.'
        );
    }

    processExpiredSlots(expiredSlots) {
        if (!expiredSlots || !expiredSlots.length) {
            console.log('No expired slots to process.');
            return;
        }

        expiredSlots.forEach((slot) => {
            const updateTopic = `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.clinic.name}`;
            this.publishToTopic(
                this.publicClient,
                updateTopic,
                { type: 'AVAILABLE', date: slot.date, time: slot.time, clinic: slot.clinic.name },
                `Slot ${slot.date} at ${slot.clinic.name} marked available.`
            );
        });
    }

    shutdown() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        if (this.internalClient) this.internalClient.end();
        if (this.publicClient) this.publicClient.end();
        console.log('SlotAvailabilityService has been shut down.');
    }
}

module.exports = SlotAvailabilityService;
