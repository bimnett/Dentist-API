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
export default {
  name: 'DentistList',
  props: {
    dentists: {
      type: Array,
      required: true,
    },
  },
  methods: {
    selectDentist(dentistId) {
      this.$emit('select-dentist', dentistId);
    },
  },
};
</script>