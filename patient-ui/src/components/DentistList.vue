<template>
  <div>
    <h2>Available Dentists</h2>
    <ul>
      <li 
        v-for="dentist in dentists" 
        :key="dentist.id" 
        @click="selectDentist(dentist.id)"
        class="dentist-item"
      >
        <h3>{{ dentist.name }}</h3>
        <p><strong>Specialty:</strong> {{ dentist.specialty }}</p>
        <p><strong>Location:</strong> {{ dentist.location }}</p>
      </li>
    </ul>
  </div>
</template>

<script>

/**
 * DentistList component displays a list of available dentists.
 * Each dentist object has the following attributes, id (number), name (string), and specialty (string).
 */

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