const mqtt = require('mqtt');
const TOPICS = require('./mqttTopics');

// Create class to connect to hold 2 mqtt clients
class SlotAvailabilityService {
    constructor(publicBrokerUrl, internalBrokerUrl, internalBrokerCredentials){
        this.publicClient = null;
        this.internalClient = null;
        this.cleanupInterval = null;
        this.initialize(publicBrokerUrl, internalBrokerUrl, internalBrokerCredentials);
    }

    // Set up connection to internal and public mqtt broker
    async initialize(publicBrokerUrl, internalBrokerUrl, internalBrokerCredentials){
        this.publicClient = mqtt.connect(publicBrokerUrl);

        this.publicClient.on('connect', () => {
            console.log('Connected to public broker');
            this.publicClient.subscribe(`${TOPICS.SLOT_STATUS_UPDATE}/#`); 
        });

        this.publicClient.on('message', async (topic, message) => {
            const data = JSON.parse(message.toString());

            try {
              await this.updateSlotStatus(data);
              console.log('Updating slot availability');
            } catch (error) {
              console.error('Error handling availability message:', error);
              this.publishError(data.dentistId, error.message);
            }
        });

        this.internalClient = mqtt.connect(internalBrokerUrl, {
          username: internalBrokerCredentials.username,
          password: internalBrokerCredentials.password,
        });

        this.internalClient.on('connect', () => {
            console.log('Connected to internal broker');
            this.internalClient.subscribe('database/response/timeslot/#'); // Subscribe to all response topics related to timeslots
            this.internalClient.subscribe(TOPICS.DATABASE_RESPONSE_CHECK_EXPIRED_RESERVATIONS); 
            this.startCleanupInterval();
        });

        this.internalClient.on('message', async (topic, message) => {

            if(topic === TOPICS.DATABASE_RESPONSE_CHECK_EXPIRED_RESERVATIONS){
              console.log("expired reservations:", JSON.parse(message.toString()));
              this.handleCleanupResponse(JSON.parse(message.toString()));
              return;
            }

            const response = JSON.parse(message.toString());
            const { requestId, error, data } = response;
            console.log(`Message received: ${topic}: ${message.toString()}`);

            // Extract operation type from requestId
            const [operation] = requestId.split('_');

            if (error) {
              this.publishError(requestId, error);
              return;
            }

            // Handle different types of operations
            switch (operation) {
              case 'check':
                this.handleAvailabilityCheckResponse(data);
                break;
              case 'update':
                this.handleStatusUpdateResponse(data);
                break;
              case 'reserve':  // Handle reserve operation
                this.handleReservationResponse(data);
                break;
              default:
                console.error(`Unknown operation type: ${operation}`);
                break;
            }
        });
    }

    // Check if a time slot is currently available
    async checkSlotAvailability(slotId, data) {
      const { date, time, clinicId, dentistId } = data;

      // Request slot information from database
      this.internalClient.publish(TOPICS.DATABASE_REQUEST_TIMESLOT_FIND, JSON.stringify({
        requestId: `check_${Date.now()}`,
        query: {
          date,
          time,
          clinic: clinicId,
          dentist: dentistId,
          status: 'Available'
        }
      }), { qos: 2 });
    }

    // Update the status of a time slot (e.g., RESERVED, BOOKED)
    async updateSlotStatus(data) {
      const { date, time, clinicId, dentistId, type } = data;

      // Request slot update in the database
      this.internalClient.publish(TOPICS.DATABASE_REQUEST_TIMESLOT_UPDATE, JSON.stringify({
        requestId: `update_${Date.now()}`,
        query: {
          date,
          time,
          clinic: clinicId,
          dentist: dentistId
        },
        update: {
          status: type === "RESERVED" ? "Reserved" : "Booked",
          patient: null,
          treatment: 'General'
        }
      }), { qos: 2 });
    }

    // Start 1 minute timer to keep track of expired reserved bookings
    startCleanupInterval() {
      // Clear any existing interval
      if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
      }
  
      // Set new interval to run every minute
      this.cleanupInterval = setInterval(() => {
          this.cleanupExpiredReservations();
      }, 60000);
    }
  
    async cleanupExpiredReservations() {
        const currentTime = new Date();
        const cutoffTime = new Date(currentTime.getTime() - 15 * 60000); // 15 minutes ago
    
        // Request cleanup of expired reservations
        this.internalClient.publish(TOPICS.DATABASE_REQUEST_CHECK_EXPIRED_RESERVATIONS, JSON.stringify({
            cutOffTime: cutoffTime
        }), { qos: 2 });
    }

    handleCleanupResponse(expiredSlots) {
      if (!expiredSlots) {
          console.error('No data received in handleCleanupResponse');
          return;
      }
  
      console.log(`Cleaned up ${expiredSlots.length} expired reservations`);
      
      // Notify patient clients of newly available time slots
      for(let i = 0; i < expiredSlots.length; i++){
        // Notify SlotSelectionView - publishes to the clinic-specific topic
        console.log("publishing to my slotview:", `${TOPICS.CLIENT_SLOT_UPDATES}/${expiredSlots[i].date}/${expiredSlots[i].clinic.name}`);
        this.publicClient.publish(
          `${TOPICS.CLIENT_SLOT_UPDATES}/${expiredSlots[i].date}/${expiredSlots[i].clinic.name}`,
          JSON.stringify({
              type: "AVAILABLE",
              date: expiredSlots[i].date,
              time: expiredSlots[i].time,
              clinic: expiredSlots[i].clinic.name,
          }),
          { qos: 2 }
        );

        // Notify AvailableDentistsView - publishes to the time-specific topic
        console.log("publishing to availabledentistsview:", `${TOPICS.CLIENT_SLOT_UPDATES}/${expiredSlots[i].date}/${expiredSlots[i].time}/${expiredSlots[i].clinic.name}`);
        this.publicClient.publish(
          `${TOPICS.CLIENT_SLOT_UPDATES}/${expiredSlots[i].date}/${expiredSlots[i].time}/${expiredSlots[i].clinic.name}`,
          JSON.stringify({
              type: "AVAILABLE",
              dentist: expiredSlots[i].dentist,
          }),
          { qos: 2 }
        );
      }
    }

    // Handle the availability check response
    handleAvailabilityCheckResponse(slot) {
        if (!slot) {
          return; // Slot not found or not available
        }
    
        // Publish availability status to clients
        this.publicClient.publish(
          `slot/${slot._id}/status`,
          JSON.stringify({
            available: slot.status === 'Available',
            date: slot.date,
            time: slot.time,
            clinic: slot.clinic,
            dentist: slot.dentist
          }),
          { qos: 2 }
        );
    }

    // Handle status update response (Reserved, Booked, etc.)
    handleStatusUpdateResponse(slot) {
        if (!slot) {
            console.error('No slot data received in handleStatusUpdateResponse');
            return;
        }
    
        try {
          this.publicClient.publish(
            `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}`,
            JSON.stringify({
                type: "RESERVED",
                date: slot.date,
                time: slot.time,
                clinic: slot.clinic,
                dentistId: slot.dentist,
                timestamp: new Date().toISOString()
            }),
            { qos: 2 }
          );
        } catch (error) {
          console.error('Error in handleStatusUpdateResponse:', error);
          this.publishError('update', 'Failed to process slot update');
        }
    }

    // Handle the response for slot reservation
    handleReservationResponse(slot) {
        if (!slot) {
            console.error('No slot data received in handleReservationResponse');
            return;
        }

        // Log the reservation details
        console.log('Received reservation data:', slot);

        try {
          this.publicClient.publish(
            `${TOPICS.CLIENT_SLOT_UPDATES}/${slot.date}/${slot.time}`,
            JSON.stringify({
                type: "RESERVED",
                date: slot.date,
                time: slot.time,
                clinic: slot.clinic,
                dentistId: slot.dentist,
                patient: slot.patient,
                timestamp: new Date().toISOString()
            }),
            { qos: 2 }
          );
        } catch (error) {
          console.error('Error in handleReservationResponse:', error);
          this.publishError('reserve', 'Failed to process slot reservation');
        }
    }

    // Handle errors by publishing them to the public broker
    publishError(reference, errorMessage) {
        this.publicClient.publish(
          'slot/error',
          JSON.stringify({
            reference,
            error: errorMessage,
            timestamp: new Date().toISOString()
          }),
          { qos: 2 }
        );
    }

    async shutdown() {
      if (this.publicClient) {
          this.publicClient.end();
      }
    }
}

module.exports = SlotAvailabilityService;