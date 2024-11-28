<template>
    <div class="available-dentists">
      <h2>Dentists Available on {{ selectedDate }} at {{ selectedTime }}</h2>
      <ul>
        <li v-for="dentist in dentists" :key="dentist.id">
          <button @click="selectDentist(dentist)">
            {{ dentist.name }} - {{ dentist.specialty }}
          </button>
        </li>
      </ul>
    </div>
</template>  
  
<script>
/**
 * AvailableDentists component displays available dentists in the time slot that the user has selected.
 */
import api from "../patientApi";

export default {
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
    selectDentist(dentist) {
        console.log('Redirecting to BookingForm with dentistId:', dentist.id);
        this.$router.push({
        name: 'BookingForm',
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