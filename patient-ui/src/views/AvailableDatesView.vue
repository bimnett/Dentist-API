<template>
    <div>
      <h1>Select a Date</h1>
      <AvailableDates @date-selected="navigateToSlotSelection" />
    </div>
  </template>
  
  <script>
  import AvailableDates from '../components/AvailableDates.vue';
  
  export default {
    name: 'AvailableDatesView',
    components: { AvailableDates },
    methods: {
      navigateToSlotSelection(selectedDate) {
        this.$router.push({ name: 'SlotSelection', params: { selectedDate } });
      },
    },
  };
  </script>