<template>
  <div>
    <h1>Dentist List</h1>
    <DentistList :dentists="dentists" @select-dentist="handleSelectDentist" />
  </div>
</template>

<script>
import DentistList from '../components/DentistList.vue';
import api from '../patientApi.js';

export default {
  name: 'DentistListView',
  components: { DentistList },
  data() {
    return {
      dentists: [], // initialisation that will be loaded from API
    };
  },
  methods: {
    async fetchDentists() {
      try {
        const response = await api.getDentists();
        this.dentists = response.data; 
      } catch (err) {
        console.error('Error fetching dentists:', err.message);
        alert('Failed to load dentist list. Please try again later.');
      }
    },
    handleSelectDentist(dentistId) {
      console.log('Selected dentist ID:', dentistId);
      // logic tbd
    },
  },
  mounted() {
    this.fetchDentists(); 
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}
</style>