<template>
  <div>
    <h1>Select a Time Slot for {{ clinic }}</h1>
    <SlotSelection 
      :timeSlots="timeSlots"
      @time-selected="navigateToAvailableDentists" 
    />
  </div>
</template>

<script>
import SlotSelection from "../components/SlotSelection.vue";
import api from '@/api';

// Import mqtt package and topic
import mqtt from "mqtt";
import { CLIENT_SLOT_UPDATES } from "../topics";
import { MQTT_BROKER_URL } from "../mqttVariables";

export default {
  name: "SlotSelectionView",
  components: { SlotSelection },
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
      timeSlots: [], // Available time slots
      mqttClient: null, // MQTT client instance
    };
  },
  methods: {
    async fetchAvailableSlots() {
      try {
        const response = await api.get("/available-slots", {
          params: {
            date: this.selectedDate,
            clinic: this.clinic,
          },
        });
        this.timeSlots = response.data.slots;
      } catch (error) {
        console.error("Error fetching available slots:", error.message);
      }
    },

    setupMqttConnection() {
      this.mqttClient = mqtt.connect(MQTT_BROKER_URL);
      this.mqttClient.on("connect", () => {
        console.log("Connected to MQTT broker!");
        this.mqttClient.subscribe(`${CLIENT_SLOT_UPDATES}/${this.selectedDate}/${this.$route.query.clinic}`);
      });

      // Message event triggers when another booking slot availability changes.
      this.mqttClient.on("message", (topic, message) => {
        const data = JSON.parse(message.toString());
        if (data.type === "AVAILABLE") {
            // Add newly available slot if it's not already in the array
            if (!this.timeSlots.includes(data.time)) {
              this.timeSlots.push(data.time);
            }
        } else {
            // Remove the reserved time slot from the list
            this.timeSlots = this.timeSlots.filter(slot => slot !== data.time);
            
            // If no time slots left, navigate back
            if (this.timeSlots.length === 0) {
                alert("No timeslots available. Returning to available dates.");
                this.$router.push(`/available-dates?clinic=${this.clinic}`);
            }
          }
      });

      this.mqttClient.on("error", err => {
        console.error("MQTT connection error:", err.message);
      });
    },

    navigateToAvailableDentists(selectedTime) {
      this.$router.push({
        name: "AvailableDentists",
        params: { selectedDate: this.selectedDate, selectedTime },
        query: { clinic: this.clinic },
      });
    },
  },
  
  // Get all available dentists for this clinic and date, and subscribe to real-time changes
  async created() {
    await this.fetchAvailableSlots();
    this.setupMqttConnection();
  },

  beforeUnmount() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  },
};
</script>