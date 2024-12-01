<template>
    <div>
      <<h1>Select a Date for {{ selectedClinic }}</h1>
      <AvailableDates @date-selected="navigateToSlotSelection" />
    </div>
  </template>
  
  <script>
  import AvailableDates from '../components/AvailableDates.vue';
  
  export default {
    name: 'AvailableDatesView',
    components: { AvailableDates },
    computed: {
    selectedClinic() {
      return this.$route.query.clinic || "Unknown Clinic";
    },
  },
    methods: {
      navigateToSlotSelection(selectedDate) {
        this.$router.push({ name: 'SlotSelection', params: { selectedDate } });
      },
    },
  };
  </script>