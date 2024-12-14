<template>
  <div>
    <h1>Booking Details</h1>
    <div v-if="!booking">
      <label for="reference-code">Enter Reference Code:</label>
      <input
        id="reference-code"
        v-model="referenceCodeInput"
        type="text"
        placeholder="Enter reference code"
      />
      <button @click="fetchBookingDetails(referenceCodeInput)">
        View Booking Details
      </button>
    </div>
    
    <div v-else>
      <BookingDetails :booking="booking" />
      <button @click="resetView" class="back-button">Back</button>
    </div>
  </div>
</template>


<script>
import BookingDetails from "../components/BookingDetails.vue";
import api from "@/api";

export default {
  name: "BookingDetailsView",
  components: { BookingDetails },
  data() {
    return {
      booking: null, // booking details
      referenceCodeInput: "",
      referenceCode: null,
    };
  },
  async created() {
    if (this.$route.params.referenceCode) {
      this.referenceCode = this.$route.params.referenceCode;
      await this.fetchBookingDetails(this.referenceCode); // auto-fetch booking details if route param exists
    }
  },
  methods: {
    async fetchBookingDetails() {
      console.log("Fetching booking with reference code:", this.referenceCodeInput);
      try {
        // fetch booking details from backend (middleware) API
        const response = await api.get(`/bookings/${this.referenceCodeInput}`);
        console.log(response.data.data);
        this.booking = response.data.data;
      } catch (error) {
        console.error("Error fetching booking details:", error.message);
        alert("Failed to fetch booking details. Please check the reference code.");
        this.booking = null; // reset booking if error
      }
    },
    handleAppointmentCanceled() {
      this.booking = null; // Reset booking after cancellation
      alert("Your appointment has been canceled.");
    },
    resetView() {
      this.booking = null;
      this.referenceCode = null; 
      this.referenceCodeInput = "";
    }
  },
};
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

input {
  margin-right: 0.5rem;
  padding: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.back-button {
  margin-bottom: 1rem;
  background-color: #6c757d;
}

.back-button:hover {
  background-color: #5a6268;
}

p {
  font-size: 1rem;
}
</style>