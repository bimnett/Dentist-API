<template>
  <div>
    <h2>Available Time Slots</h2>
    <ul>
      <li v-for="slot in slots" :key="slot" @click="bookSlot(slot)">
        {{ slot }}
      </li>
    </ul>
  </div>
</template>

<script>
// for issue 5: Appointment selection and booking
export default {
  name: 'DentistTimetable',
  props: {
    slots: {
      type: Array,
      required: true,
    },
  },
  methods: {
    bookSlot(slot) {
      this.$emit('select-slot', slot);
    },
  },
};
</script>