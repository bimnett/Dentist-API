<template>
  <div>
    <h1>Available Dentists for {{ clinic }}</h1>
      <AvailableDentists
        v-if="dentists.length > 0"
        :dentists="dentists"
        :selectedDate="selectedDate"
        :selectedTime="selectedTime"
        :clinic="clinic"
        @dentist-selected="navigateToBookingForm"
      />
      <p v-else>No dentists are available at this time and clinic.</p>
  </div>
</template>
  
<script>
import AvailableDentists from "../components/AvailableDentists.vue";
import api from "@/api";

// Import mqtt package and topic
import mqtt from 'mqtt';
import { CLIENT_SLOT_UPDATES } from "../topics";

export default {
  name: "AvailableDentistsView",
  components: { AvailableDentists },
  props: {
      selectedDate: String,
      selectedTime: String,
      clinic: String,
  },
  data() {
      return {
          dentists: [],
          mqttClient: null
      };
  },

  // Get all available dentists for this clinic and date, and subscribe to real-time changes
  async created() {
      await this.fetchDentists();
      this.setupMqttConnection();
  },

  methods: {
      async fetchDentists() {
        try {
            const response = await api.get("/dentists", {
                params: {
                    date: this.selectedDate,
                    time: this.selectedTime,
                    clinic: this.clinic,
                },
            });
            this.dentists = response.data.dentists;

          } catch (error) {
              console.error("Error fetching available dentists:", error.message);
          }
      },
      setupMqttConnection() {
          this.mqttClient = mqtt.connect("ws://localhost:9001");
          this.mqttClient.on("connect", () => {
              console.log("Connected to MQTT broker!");
              this.mqttClient.subscribe(`${CLIENT_SLOT_UPDATES}/${this.selectedDate}/${this.selectedTime}/${this.$route.query.clinic}`);
          });

          // Message event triggers when another client initiates a booking for an available dentist for this specific time slot.
          this.mqttClient.on("message", async (topic, message) => {
              const data = JSON.parse(message.toString());

              // Remove the reserved dentist from the list
              this.dentists = this.dentists.filter(d => d.id !== data.dentist);
              
              // If no dentists left, navigate back
              if (this.dentists.length === 0) {
                alert("All dentists are unavailable for this time slot in this clinic. Returning to available dates.");
                this.$router.push(`/available-dates?clinic=${this.$route.query.clinic}`);
              }
          });
          this.mqttClient.on("error", (err) => {
              console.error("MQTT connection error:", err.message);
          });
      },
      async navigateToBookingForm(dentist) {
        try {
          // Check if the slot is still available before proceeding
          const response = await api.get("/available-slots", {
              params: {
                  date: this.selectedDate,
                  clinic: this.clinic,
              },
          });
        
          const availableSlots = response.data.slots || [];
        
          // Check if the selected time is still available
          if (!availableSlots.includes(this.selectedTime)) {
              // Filter out unavailable time slot and alert user
              this.dentists = this.dentists.filter((d) => d.id !== dentist.id);
              alert('The selected slot is no longer available. Please choose another.');
              return;
          }
        
          // Slot is available, navigate to the booking form
          console.log("Redirecting to BookingForm with dentistId:", dentist.id);
          this.$router.push({
              name: "BookingForm",
              params: {
                  dentistId: dentist.id.toString(),
                  selectedDate: this.selectedDate,
                  selectedTime: this.selectedTime,
              },
              query: { clinic: this.clinic },
          });
        } catch (error) {
            console.error('Error checking slot availability:', error);
            alert('Unable to verify availability. Please try again.');
        }
      }
  },
  beforeUnmount() {
      if (this.mqttClient) {
          this.mqttClient.end();
      }
  },
};
</script>