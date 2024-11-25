<template>
  <div v-if="booking">
    <h2>Appointment Details</h2>
    <p><strong>Time:</strong> {{ booking.time }}</p>
    <p><strong>Date:</strong> {{ booking.date }}</p>
    <p><strong>Clinic Name:</strong> {{ booking.clinicName }}</p>
    <p><strong>Dentist:</strong> {{ booking.dentist }}</p>
    <p><strong>Reference Code:</strong> {{ booking.referenceCode }}</p>
  </div>
</template>

<script>
import api from '../patientApi.js';

export default {
  props: ['referenceCode'],
  data() {
    return {
      booking: null
    };
  },
  async mounted() {
    if (this.referenceCode) {
      try {
        const response = await api.getBooking(this.referenceCode);
        this.booking = response.data;
      } catch (err) {
        console.error('Error fetching booking details:', err.message);
        this.booking = null;
      }
    }
  }
};
</script>