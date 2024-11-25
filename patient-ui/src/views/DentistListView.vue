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
      dentists: [
        {
          id: 1,
          name: "Dr. John Johnson",
          specialty: "Orthodontics",
          location: "Central Gothenburg"
        },
        {
          id: 2,
          name: "Dr. Michael Mike",
          specialty: "Pediatric Dentistry",
          location: "North Gothenburg"
        },
        {
          id: 3,
          name: "Dr. Sarah Sarah",
          specialty: "General Dentistry",
          location: "South Gothenburg"
        }
      ],
    };
  },
  methods: {
    async fetchDentists() {
      try {
        const response = await api.getDentists();
        this.dentists = response.data;
      } catch (err) {
        console.error('Error fetching dentists:', err.message);
        alert('Failed to load dentist list.');
      }
    },
    handleSelectDentist(dentistId) {
      console.log('Selected dentist ID:', dentistId);
      // tbd
    },
  },
  mounted() {
    this.fetchDentists(); 
  },
};
</script>