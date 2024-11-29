<template>
    <div>
      <h1>Available Dentists</h1>
      <AvailableDentists
        v-if="dentists.length > 0"
        :dentists="dentists"
        :selectedDate="selectedDate"
        :selectedTime="selectedTime"
        @dentist-selected="navigateToBookingForm"
      />
      <p v-else>No dentists are available at this time.</p>
    </div>
  </template>
  
  <script>
  import AvailableDentists from "../components/AvailableDentists.vue";
  import api from "../patientApi";
  
  export default {
    name: "AvailableDentistsView",
    components: { AvailableDentists },
    props: {
      selectedDate: String,
      selectedTime: String,
    },
    data() {
      return {
        dentists: [],
      };
    },
    async created() {
      try {
        const response = await api.getAvailableDentists(this.selectedDate, this.selectedTime);
        this.dentists = response.data;
      } catch (error) {
        console.error("Error fetching available dentists:", error.message);
      }
    },
    methods: {
      navigateToBookingForm(dentist) {
        console.log("Redirecting to BookingForm with dentistId:", dentist.id);
        this.$router.push({
          name: "BookingForm",
          params: {
            dentistId: dentist.id.toString(),
            selectedDate: this.selectedDate,
            selectedTime: this.selectedTime,
          },
        });
      },
    },
  };
  </script>