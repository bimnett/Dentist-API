<template>
  <div>
    <h1>Appointment Booking</h1>
    <AppointmentBookingForm
      v-if="dentist"
      :dentist="dentist"
      :bookingData="bookingData"
      @submit-booking="handleBookingSubmission"
    />
    <p v-else>Loading dentist details...</p>
  </div>
</template>

<script>
  import AppointmentBookingForm from "../components/AppointmentBookingForm.vue";
  import api from "@/api";

  // Import mqtt package and topic
  import mqtt from "mqtt";
  import { CLIENT_SLOT_UPDATES } from "../topics";

  export default {
    name: "AppointmentBookingFormView",
    components: { AppointmentBookingForm },
    props: {
      dentistId: String,
      selectedDate: String,
      selectedTime: String,
      clinic: String,
    },
    data() {
      return {
        dentist: null,
        bookingData: {
          name: "",
          email: "",
          phone: "",
          treatment: "General",
          date: this.selectedDate,
          time: this.selectedTime,
          clinic: this.clinic,
        },
        mqttClient: null,
      };
    },
    async created() {
      console.log("API call parameters:", {
      date: this.selectedDate,
      time: this.selectedTime,
      clinic: this.clinic,
      });
      try {
        // Check slot availability
        const response = await api.get("/available-slots", {
            params: {
                date: this.$route.params.selectedDate,
                clinic: this.$route.query.clinic,
            },
        });

        const availableSlots = response.data.slots || [];

        if (!availableSlots.includes(this.$route.params.selectedTime)) {
          // If not available, alert and navigate back
          alert('The selected slot is no longer available.');
          this.$router.push(`/available-dates?clinic=${this.$route.query.clinic}`);
          return;
        }

        // Reserve the slot
        let reserveResponse = await api.post("/reserve-slot", {
          dentistId: this.$route.params.dentistId,
          date: this.$route.params.selectedDate,
          time: this.$route.params.selectedTime,
        });

        reserveResponse = reserveResponse.data.data;

        if (reserveResponse.error) {
          alert('Unable to reserve the slot. Returning to the previous page.');
          this.$router.push(`/available-dates?clinic=${this.$route.query.clinic}`);
        }

        // Publish that this slot is now reserved to all connected patient clients
        this.mqttClient = mqtt.connect("ws://localhost:9001");
          this.mqttClient.on("connect", () => {
              console.log("Connected to MQTT broker!");

              this.mqttClient.publish(
                `${CLIENT_SLOT_UPDATES}/${this.selectedDate}/${this.selectedTime}/${this.$route.query.clinic}`,
                JSON.stringify(reserveResponse)
              );

              this.mqttClient.publish(
                `${CLIENT_SLOT_UPDATES}/${this.selectedDate}/${this.$route.query.clinic}`,
                JSON.stringify(reserveResponse)
              );
          });

        this.dentist = reserveResponse.dentist;

      } catch (error) {
          console.error('Error checking or reserving slot:', error);
          alert('An error occurred. Returning to the previous page.');
          this.$router.push(`/available-dates?clinic=${this.$route.query.clinic}`);
        }
    },
    methods: {
      async handleBookingSubmission() {
        try {
          // submit booking data to backend (middleware)
          const response = await api.post(`/dentists/${this.dentist}/bookings`, this.bookingData);
          if(response.data.error){
            alert("Booking unsuccessful. Try again.");
            return;
          }

          alert("Booking successful. Your booking reference code is " + response.data.referenceCode);

          // redirect to booking details page
          this.$router.push({
            name: "BookingDetails",
            params: { referenceCode: response.data.referenceCode },
          });
        } catch (error) {
          console.error("Error booking appointment:", error.message);
          alert("Error booking appointment: " + error.message);
        }
      },
    },
  };
</script>
