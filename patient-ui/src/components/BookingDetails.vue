<template>
  <div>
    <div v-if="booking">
      <h2>Appointment Details</h2>
      <p><strong>Time:</strong> {{ booking.time }}</p>
      <p><strong>Date:</strong> {{ booking.date }}</p>
      <p><strong>Clinic Name:</strong> {{ booking.clinicName }}</p>
      <p><strong>Dentist:</strong> {{ booking.dentist }}</p>
      <p><strong>Reference Code:</strong> {{ booking.referenceCode }}</p>
    </div>
    <div v-else>
      <p>No booking details available. Please enter a valid reference code.</p>
    </div>
  </div>
</template>

<script>

/**
 * BookingDetails component shows details of a specific appointment booking.
 * It shows the following information: appointment time (string), date (string), clinic name (string),
 * dentist name (string), and reference code (string).
 * 
 * If no booking details are available (e.g., an invalid or missing reference code), it displays
 * a fallback message prompting the user to enter a valid reference code.
 */

 export default {
  name: "BookingDetails",
  props: {
    booking: {
      type: Object,
      required: false,
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