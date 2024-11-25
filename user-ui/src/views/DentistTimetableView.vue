<template>
  <div>
    <h1>Dentist Timetable</h1>
    <div v-if="slots.length > 0">
      <DentistTimetable :slots="slots" @select-slot="handleSelectSlot" />
    </div>
    <div v-else>
      <p>No available slots or no dentist selected.</p>
    </div>
  </div>
</template>

<script>
// for issue 5: Appointment selection and booking
import DentistTimetable from '../components/DentistTimetable.vue';
import api from '../patientApi.js';

export default {
  name: 'DentistTimetableView',
  components: { DentistTimetable },
  props: {
    dentistId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      slots: [], 
    };
  },
  watch: {
    dentistId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchTimetable(newId);
        }
      },
    },
  },
  methods: {
    async fetchTimetable(dentistId) {
      try {
        const response = await api.getTimetable(dentistId);
        this.slots = response.data.timetable;
      } catch (err) {
        console.error('Error fetching timetable:', err.message);
        this.slots = [];
      }
    },
    handleSelectSlot(slot) {
      console.log('Selected slot:', slot);
      // Additional logic for booking the slot can go here
    },
  },
};
</script>