<template>
  <div>
    <DentistList @select-dentist="dentistId = $event" />
    <DentistTimetable v-if="dentistId" :dentistId="dentistId" @select-slot="slot = $event" />
    <BookingForm v-if="slot" :dentistId="dentistId" :slot="slot" />
    <BookingDetails />
  </div>
</template>

<script>
import DentistList from './components/DentistList.vue';
import DentistTimetable from './components/DentistTimetable.vue';
import BookingForm from './components/BookingForm.vue';
import BookingDetails from './components/BookingDetails.vue';

export default {
  components: { DentistList, DentistTimetable, BookingForm, BookingDetails },
  data() {
    return {
      dentistId: null,
      slot: null
    };
  }
};
</script>