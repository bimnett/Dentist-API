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
  import api from "../patientAPI";
  
  export default {
    name: "AppointmentBookingFormView",
    components: { AppointmentBookingForm },
    props: {
      dentistId: String,
      selectedDate: String,
      selectedTime: String,
    },
    data() {
      return {
        dentist: null,
        bookingData: {
          name: "",
          email: "",
          phone: "",
          date: this.selectedDate,
          time: this.selectedTime,
        },
      };
    },
    async created() {
      try {
        const response = await api.getAvailableDentists(this.selectedDate, this.selectedTime);
        const dentist = response.data.find((d) => d.id === Number(this.dentistId));
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
          const response = await api.postBooking(this.dentistId, this.bookingData);
          alert(response.data.message || "Booking successful");
  
          // Redirect to booking details page
          this.$router.push({
            name: "BookingDetails",
            params: { referenceCode: response.data.referenceCode },
          });
        } catch (error) {
          alert("Error booking appointment: " + error.message);
        }
      },
    },
  };
  </script>