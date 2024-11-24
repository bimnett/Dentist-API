<template>
  <div>
    <DentistList @select-dentist="dentistId = $event" />
    <DentistTimetable v-if="dentistId" :dentistId="dentistId" @select-slot="slot = $event" />
    <BookingForm v-if="slot" :dentistId="dentistId" :slot="slot" />
    <BookingDetails v-if="referenceCode" :referenceCode="referenceCode" />
    <input v-model="referenceCodeInput" placeholder="Enter reference code" />
    <button @click="fetchBookingDetails">View Appointment</button>
  </div>
</template>

<script>
import DentistList from './components/DentistList.vue';
import DentistTimetable from './components/DentistTimetable.vue';
import BookingForm from './components/BookingForm.vue';
import BookingDetails from './components/BookingDetails.vue';
import api from './patientApi.js';

export default {
  components: { DentistList, DentistTimetable, BookingForm, BookingDetails },
  data() {
    return {
      dentistId: null,
      slot: null,
      referenceCode: null,
      referenceCodeInput: ''
    };
  },
  methods: {
    async fetchBookingDetails() {
      try {
        const response = await api.getBooking(this.referenceCodeInput);
        this.referenceCode = response.data; // assums API returns booking details
      } catch (err) {
        console.error(err);
        alert('Failed to fetch booking details. Please check the reference code.');
      }
    }
  }
};
</script>