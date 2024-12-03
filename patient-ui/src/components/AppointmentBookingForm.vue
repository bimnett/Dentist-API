<template>
  <div class="booking-form">
    <h2>Book Appointment with {{ dentist.name }}</h2>
    <form @submit.prevent="submitBooking">
      <div>
        <label for="name">Name:</label>
        <input v-model="bookingData.name" type="text" id="name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input v-model="bookingData.email" type="email" id="email" required />
      </div>
      <div>
        <label for="phone">Phone:</label>
        <input v-model="bookingData.phone" type="tel" id="phone" required />
      </div>
      <div>
        <label for="date">Selected Date:</label>
        <input v-model="bookingData.date" type="text" id="date" readonly />
      </div>
      <div>
        <label for="time">Selected Time:</label>
        <input v-model="bookingData.time" type="text" id="time" readonly />
      </div>
      <button type="submit">Book Appointment</button>
    </form>
  </div>
</template>
  
<script>
/**
 * AppointmentBookingForm component is responsible for allowing the user to fill in their information
 * to make an appointment with a dentist.
 */
 export default {
  name: "AppointmentBookingForm",
  props: {
    dentist: Object,
    bookingData: Object,
  },
  methods: {
    submitBooking() {
      this.$emit("submit-booking");
    },
  },
};
</script>

<style>
.booking-form {
  padding: 20px;
}

.booking-form h2 {
  margin-bottom: 20px;
}

.booking-form label {
  display: block;
  margin-bottom: 5px;
}

.booking-form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.booking-form button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.booking-form button:hover {
  background-color: #0056b3;
}
</style>