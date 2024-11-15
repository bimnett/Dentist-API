<template>
    <div>
      <h2>Available Dentists</h2>
      <ul>
        <li v-for="dentist in dentists" :key="dentist.id" @click="selectDentist(dentist.id)">
          {{ dentist.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '../api.js';
  
  export default {
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
      ]
      };
    },
    mounted() {
      api.getDentists().then(response => {
        this.dentists = response.data;
      });
    },
    methods: {
      selectDentist(dentistId) {
        this.$emit('select-dentist', dentistId);
      }
    }
  };
  </script>  