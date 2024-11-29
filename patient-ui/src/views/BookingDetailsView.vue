<template>
  <div>
    <h1>Booking Details</h1>
    <div v-if="!referenceCode || !booking">
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
import api from "../patientApi.js";

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
    async fetchBookingDetails(referenceCode = this.referenceCodeInput) {
      console.log("Fetching booking with reference code:", referenceCode)
      try {
        const response = await api.getBooking(referenceCode);
        this.booking = response.data; // store booking details
        this.referenceCode = referenceCode; // set current reference code
      } catch (err) {
        console.error("Error fetching booking details:", err.message);
        alert("Failed to fetch booking details. Please check the reference code.");
        this.booking = null;
      }
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