<template>
    <div>
      <h1>Welcome</h1>
      <p>Book an appointment with a dentist today</p>
    </div>
    <DentistMap/>
  </template>
  
  <script>
  import DentistMap from '../components/DentistMap.vue';

  export default {
    name: 'HomeView',
    components: {
      DentistMap
    }
  };
  </script>