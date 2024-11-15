<template>
    <div>
      <h2>Booking Details</h2>
      <form @submit.prevent="fetchBooking">
        <input v-model="referenceCode" placeholder="Enter Reference Code" required />
        <button type="submit">Get Details</button>
      </form>
      <div v-if="booking">
        <p>Dentist: {{ booking.dentistName }}</p>
        <p>Time: {{ booking.slot }}</p>
        <p>Name: {{ booking.user.name }}</p>
        <p>Age: {{ booking.user.age }}</p>
        <p>Email: {{ booking.user.email }}</p>
        <p>Phone: {{ booking.user.phone }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../api.js';
  
  export default {
    data() {
      return {
        referenceCode: '',
        booking: null
      };
    },
    methods: {
      fetchBooking() {
        api.getBooking(this.referenceCode).then(response => {
          this.booking = response.data;
        });
      }
    }
  };
  </script>
  