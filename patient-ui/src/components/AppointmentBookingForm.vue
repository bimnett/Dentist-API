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
 * Appointment component is responsible for allowing the user to fill in their information
 * to make an appointment with a dentist.
 */
 export default {
  props: {
    dentistId: String,
    selectedDate: String,
    selectedTime: String,
  },
  data() {
    return {
      dentist: {}, // dentist details
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
    // fetch dentist details via id
    const dentist = mockDentistsData.find((d) => d.id === Number(this.dentistId));
    if (dentist) {
      this.dentist = dentist;
    } else {
      alert("Dentist not found");
    }
  },
  methods: {
    async submitBooking() {
      try {
        const response = await api.postBooking(this.dentistId, this.bookingData);
        alert(response.data.message || "Booking successful");

        // redirect to booking details page
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