<template>
    <div>
      <h1>Select a Time Slot</h1>
      <SlotSelection :selectedDate="selectedDate" @time-selected="navigateToAvailableDentists" />
    </div>
  </template>
  
  <script>
  import SlotSelection from "../components/SlotSelection.vue";
  
  export default {
    name: "SlotSelectionView",
    components: { SlotSelection },
    props: {
      selectedDate: {
        type: String,
        required: true,
      },
    },
    methods: {
      navigateToAvailableDentists(selectedTime) {
        this.$router.push({
          name: "AvailableDentists",
          params: { selectedDate: this.selectedDate, selectedTime },
        });
      },
    },
  };
  </script>