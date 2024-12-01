<template>
    <div>
      <h1>Select a Time Slot for {{ clinic }}</h1>
      <SlotSelection 
      :selectedDate="selectedDate" 
      :clinic="clinic" 
      @time-selected="navigateToAvailableDentists" 
    />
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
      clinic: {
      type: String,
      required: true,
      },
    },
  //   computed: {
  //     clinic() {
  //       return this.$route.query.clinic || "Unknown Clinic";
  //     },
  // },
    methods: {
      navigateToAvailableDentists(selectedTime) {
        this.$router.push({
          name: "AvailableDentists",
          params: { selectedDate: this.selectedDate, selectedTime },
          query: { clinic: this.clinic },
        });
      },
    },
  };
  </script>