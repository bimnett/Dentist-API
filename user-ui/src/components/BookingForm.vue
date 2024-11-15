<template>
    <div>
      <h2>Book Appointment</h2>
      <form @submit.prevent="submitBooking">
        <input v-model="name" placeholder="Name" required />
        <input v-model="age" type="number" placeholder="Age" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="phone" placeholder="Phone" required />
        <button type="submit">Book</button>
      </form>
      <div v-if="referenceCode">
        <p>Your booking reference code: {{ referenceCode }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../api.js';
  
  export default {
    props: ['dentistId', 'slot'],
    data() {
      return {
        name: '',
        age: '',
        email: '',
        phone: '',
        referenceCode: null
      };
    },
    methods: {
      submitBooking() {
        const bookingData = {
          name: this.name,
          age: this.age,
          email: this.email,
          phone: this.phone,
          slot: this.slot.time
        };
        api.postBooking(this.dentistId, bookingData).then(response => {
          this.referenceCode = response.data.referenceCode;
        });
      }
    }
  };
  </script>
  