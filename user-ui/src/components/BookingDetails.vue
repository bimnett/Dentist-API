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
export default {
  name: 'BookingDetails',
  props: {
    booking: {
      type: Object,
      required: false,
    },
  },
};
</script>