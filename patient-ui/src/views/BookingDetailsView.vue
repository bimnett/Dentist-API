<template>
    <div>
      <h1>Booking Details</h1>
      <div>
        <label for="reference-code">Enter Reference Code:</label>
        <input
          id="reference-code"
          v-model="referenceCodeInput"
          type="text"
          placeholder="Enter reference code"
        />
        <button @click="fetchBookingDetails">View Booking Details</button>
      </div>
      <BookingDetails :booking="booking" />
    </div>
  </template>
  
  <script>
  import BookingDetails from '../components/BookingDetails.vue';
  import api from '../patientApi.js';
  
  export default {
    name: 'BookingDetailsView',
    components: { BookingDetails },
    data() {
      return {
        booking: null, 
        referenceCodeInput: '', 
      };
    },
    methods: {
      async fetchBookingDetails() {
        try {
          const response = await api.getBooking(this.referenceCodeInput);
          this.booking = response.data; // stores fetched booking details
        } catch (err) {
          console.error('Error fetching booking details:', err.message);
          alert('Failed to fetch booking details. Please check the reference code.');
          this.booking = null; 
        }
      },
    },
  };
  </script>