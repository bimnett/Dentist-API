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
      };
    },
    async created() {
      console.log("API call parameters:", {
      date: this.selectedDate,
      time: this.selectedTime,
      clinic: this.clinic,
  });

    try {
      // get available dentists for selected date, time and clinic
      const response = await api.get("/dentists", {
        params: { date: this.selectedDate, time: this.selectedTime, clinic: this.clinic },
      });

      // find the dentist by ID
      const dentist = response.data.dentists.find((d) => d.id === Number(this.dentistId));
      if (dentist) {
        this.dentist = dentist;
      } else {
        alert("Dentist not found for the selected date and time.");
      }
    } catch (error) {
      console.error("Error fetching dentist details:", error.message);
      alert("Failed to load dentist details. Please try again.");
    }
  },
  methods: {
    async handleBookingSubmission() {
      try {
        // submit booking data to backend (middleware)
        const response = await api.post(`/dentists/${this.dentistId}/bookings`, this.bookingData);
        alert(response.data.message || "Booking successful");

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