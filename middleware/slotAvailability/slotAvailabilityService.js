const mqtt = require('mqtt');
const TOPICS = require('./resources/mqttTopics');

// Create class to connect to hold 2 mqtt clients
class SlotAvailability {
    constructor(publicBrokerUrl, internalBrokerUrl){
        this.publicClient = null;
        this.internalClient = null;
        this.cleanupInterval = null;
        this.initialize(publicBrokerUrl, internalBrokerUrl);
    }

    // connect to internal and public brokers as well as 
    // initialise MQTT clients and subscribe to topics
    async initialize(publicBrokerUrl, internalBrokerUrl) {
      this.publicClient = this.createMqttClient(publicBrokerUrl, 'public');
      this.internalClient = this.createMqttClient(internalBrokerUrl, 'internal');

      this.subscribeToTopic(this.publicClient, `${TOPICS.SLOT_STATUS_UPDATE}/#`, 'Subscribed to public slot status updates.');
      this.subscribeToTopic(this.internalClient, 'database/response/timeslot/#', 'Subscribed to database timeslot responses.');
      this.subscribeToTopic(this.internalClient, TOPICS.DATABASE_RESPONSE_CHECK_EXPIRED_RESERVATIONS, 'Subscribed to expired reservations check.');

      this.startCleanupInterval();
  }

    // create MQTT client and log connection status
    createMqttClient(brokerUrl, clientType) {
      const client = mqtt.connect(brokerUrl);
      client.on('connect', () => console.log(`Connected to ${clientType} broker.`));
      client.on('error', (error) => console.error(`${clientType} broker error:`, error));
      client.on('close', () => console.log(`${clientType} broker connection closed.`));
      return client;
  }

    // helper function to subscribe to a specified topic
    subscribeToTopic(client, topic, logMessage) {
      client.subscribe(topic, { qos: 2 }, (err) => {
          if (err) {
              console.error(`Subscription error for topic ${topic}:`, err);
          } else {
              console.log(logMessage);
          }
      });
  }

    // helper function to publish a message to a specified topic
    publishToTopic(client, topic, payload, logMessage) {
      client.publish(topic, JSON.stringify(payload), { qos: 2 }, (err) => {
          if (err) {
              console.error(`Publish error for topic ${topic}:`, err);
          } else {
              console.log(`${logMessage} Topic: ${topic}, Payload: ${JSON.stringify(payload)}`);
          }
      });
  }

    // clean up expired reservations
    startCleanupInterval() {
      if (this.cleanupInterval) clearInterval(this.cleanupInterval);
      this.cleanupInterval = setInterval(() => this.cleanupExpiredReservations(), 60000);
  }

    async cleanupExpiredReservations() {
        const cutoffTime = new Date(Date.now() - 15 * 60000); // 15 mins ago
        this.publishToTopic(this.internalClient, TOPICS.DATABASE_REQUEST_CHECK_EXPIRED_RESERVATIONS, { cutOffTime: cutoffTime }, 'Requested expired reservations cleanup.');
    }

    handleCleanupResponse(expiredSlots) {
        if (!expiredSlots || !expiredSlots.length) {
            console.error('No expired slots received in cleanup response.');
            return;
        }

        console.log(`Cleaned up ${expiredSlots.length} expired reservations.`);
        expiredSlots.forEach((slot) => {
            this.publishToTopic(this.publicClient, `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.clinic.name}`, {
                type: 'AVAILABLE',
                date: slot.date,
                time: slot.time,
                clinic: slot.clinic.name
            }, 'Notified slot availability.');

            this.publishToTopic(this.publicClient, `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}/${slot.clinic.name}`, {
                type: 'AVAILABLE',
                dentist: slot.dentist
            }, 'Notified dentist availability.');
        });
    }

    handleAvailabilityCheckResponse(slot) {
        if (!slot) {
            console.error('Slot not found or unavailable.');
            return;
        }

        this.publishToTopic(this.publicClient, `slot/${slot._id}/status`, {
            available: slot.status === 'Available',
            date: slot.date,
            time: slot.time,
            clinic: slot.clinic,
            dentist: slot.dentist
        }, 'Published slot availability status.');
    }

    handleStatusUpdateResponse(slot) {
        if (!slot) {
            console.error('No slot data received in status update response.');
            return;
        }

        this.publishToTopic(this.publicClient, `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}`, {
            type: 'RESERVED',
            date: slot.date,
            time: slot.time,
            clinic: slot.clinic,
            dentistId: slot.dentist,
            timestamp: new Date().toISOString()
        }, 'Published slot status update.');
    }

    handleReservationResponse(slot) {
        if (!slot) {
            console.error('No slot data received in reservation response.');
            return;
        }

        this.publishToTopic(this.publicClient, `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}`, {
            type: 'RESERVED',
            date: slot.date,
            time: slot.time,
            clinic: slot.clinic,
            dentistId: slot.dentist,
            patient: slot.patient,
            timestamp: new Date().toISOString()
        }, 'Published reservation response.');
    }

    publishError(reference, errorMessage) {
        this.publishToTopic(this.publicClient, 'slot/error', {
            reference,
            error: errorMessage,
            timestamp: new Date().toISOString()
        }, 'Published error message.');
    }

    async shutdown() {
        if (this.publicClient) this.publicClient.end();
        if (this.internalClient) this.internalClient.end();
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        console.log('SlotAvailabilityService shutdown complete.');
    }
}

module.exports = SlotAvailability;