<template>
  <div>
    <h1>Dentist List</h1>
    <DentistList :dentists="dentists" @select-dentist="handleSelectDentist" />
  </div>
</template>

<script>
import DentistList from '../components/DentistList.vue';
import api from "@/api";

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
        // fetch dentists from backend (middleware) API
        const response = await api.get("/dentists");
        this.dentists = response.data.dentists;
      } catch (err) {
        console.error("Error fetching dentists:", err.message);
        alert("Failed to load dentist list. Please try again later.");
      }
    },
    handleSelectDentist(dentistId) {
      console.log("Selected dentist ID:", dentistId);
      // logic tbd (e.g., redirect to dentist details or booking form)
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