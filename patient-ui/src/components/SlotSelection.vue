<template>
  <div class="slot-selection">
    <div v-if="timeSlots.length > 0" class="time-slots">
      <button
        v-for="time in timeSlots"
        :key="time"
        @click="showSelectedTime(time)"
        class="time-slot"
      >
        {{ time }}
      </button>
    </div>
    <div v-else>
      <p>No available slots.</p>
    </div>
  </div>
</template>
  
<script>
/**
 * SlotSelection component is responsible for displaying time slots that the user can choose from.
 * Available dentists will then be shown for the user to select in their selected time slot.
 * Upon selection, the user will be directed to a booking form to fill in their details to make the appointment.
 */
 import api from "@/api";
 import mqtt from 'mqtt';

 export default {
  name: "SlotSelection",
  props: {
    selectedDate: {
      type: String,
      required: true,
    },
    clinic: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      timeSlots: [], // Available time slots fetched from API
      mqttClient: null,
    };
  },

  async created() {
    await this.fetchAvailableSlots();
    this.setupMqttConnection();
  },

  methods: {
    formatDate(date) {
      const options = { weekday: "long", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("en-US", options);
    },
    showSelectedTime(time) {
      this.$emit("time-selected", time);
    },

    async fetchAvailableSlots(){
      try {
        // GET request to the middleware endpoint to fetch available slots for specified clinic and date
        const response = await api.get('/available-slots', {
          params: {
            date: this.selectedDate,
            clinic: this.clinic,
          },
        });
        this.timeSlots = response.data.slots; // slots = response key
      } catch (error) {
          console.error("Error fetching available slots:", error.message);
      }
    },

    // Connect to mqtt broker for real-time availability updates
    setupMqttConnection(){
      this.mqttClient = mqtt.connect('') // Add WSS broker url
      this.mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker!');

        this.mqttClient.subscribe(`availability/clinic/${this.clinic}/status`);
      });

      this.mqttClient.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());

        if(data.date === this.selectedDate){
          if(data.type === 'RESERVED'){
            this.timeSlots = this.timeSlots.filter(slot => slot !== data.time);
          }
        }
      });

      this.mqttClient.on('error', (err) => {
        console.error('MQTT connection error.');
      })
    },

    async handleTimeSelection(time) {
      try {
        const response = await api.get('/check-slot-availability', {
          params: {
            date: this.selectedDate,
            time,
            clinic: this.clinic,
          }
        });

        if(response.data.available){

          this.mqttClient.publish(
            `availability/clinic/${this.clinic}/reserve`,
            JSON.stringify({
              type: 'SLOT_RESERVED',
              date: this.selectedDate,
              time,
              clinic: this.clinic,
              timestamp: Date.now(),
            })
          );

          this.$emit('time-selected', time);
        } else {

          alert('Sorry, this slot is no longer available. Please select another time.');
        }
      } catch(err){
        console.error("Error checking slot availability:", err.message);
        alert('Error checking slot availability. Please try again.');
      }
    }
  },

  // Unsubscribe and close mqtt connection when leaving the page
  beforeUnmount() {
    if(this.mqttClient){
      this.mqttClient.unsubscribe(`availability/clinic/${this.clinic}/status`);
      this.mqttClient.end();
    }
  }
};
</script>

<style>
.slot-selection {
  padding: 20px;
  text-align: center;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.time-slot {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
}

.time-slot:hover {
  background-color: #f0f0f0;
}

.time-slot:focus,
.time-slot:active {
  background-color: #007bff;
  color: white;
}
</style>