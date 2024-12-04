<template>
  <div>
    <div v-if="booking">
      <h2>Appointment Details</h2>
      <p><strong>Time:</strong> {{ booking.time }}</p>
      <p><strong>Date:</strong> {{ booking.date }}</p>
      <p><strong>Clinic Name:</strong> {{ booking.clinicName }}</p>
      <p><strong>Dentist:</strong> {{ booking.dentist }}</p>
      <p><strong>Treatment:</strong> {{ booking.treatment }}</p>
      <p><strong>Reference Code:</strong> {{ booking.referenceCode }}</p>
      <button class="btn btn-danger mt-3" @click="confirmCancel">Cancel Appointment</button>
    </div>
    <div v-else>
      <p>No booking details available. Please enter a valid reference code.</p>
    </div>
  </div>
</template>

<script>

/**
 * BookingDetails component is responsible for displaying details of a specific appointment booking as well as
 * a feature to cancel it.
 * It shows the following information: appointment time (string), date (string), clinic name (string),
 * dentist name (string), and reference code (string).
 * 
 * If no booking details are available (e.g., an invalid or missing reference code), it displays
 * a fallback message prompting the user to enter a valid reference code.
 */
import api from "@/api";

export default {
  name: 'BookingDetails',
  props: {
    booking: {
      type: Object,
      required: false,
    },
  },
  methods: {
    async cancelAppointment() {
      try {
        const referenceCode = this.booking.referenceCode;
        const response = await api.delete(`/bookings/${referenceCode}`); // direct api endpoint call
        alert(response.data.message);
       this.$emit("appointment-canceled"); // Notify and reset booking
      } catch (err) {
        console.error("Error canceling appointment:", err.message);
        alert("Failed to cancel the appointment. Please try again.");
      }
    },
    confirmCancel() {
      if (confirm("Are you sure you want to cancel your appointment?")) {
        this.cancelAppointment();
      }
    },
  },
};
</script>

<style scoped>
p {
  font-size: 1rem;
  margin: 0.5em 0;
}
</style>