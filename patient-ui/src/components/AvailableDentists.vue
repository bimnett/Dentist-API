<template>
  <div class="available-dentists">
    <h2>Dentists Available on {{ selectedDate }} at {{ selectedTime }}</h2>
    <ul>
      <li v-for="dentist in dentists" :key="dentist.id">
        <button @click="selectDentist(dentist)">
          {{ dentist.name }} - {{ dentist.specialty }}
        </button>
      </li>
    </ul>
  </div>
</template>
  
<script>
/**
 * AvailableDentists component displays available dentists in the time slot that the user has selected.
 */
export default {
  name: "AvailableDentists",
  props: {
    dentists: {
      type: Array,
      required: true,
    },
    selectedDate: {
      type: String,
      required: true,
    },
    selectedTime: {
      type: String,
      required: true,
    },
  },
  methods: {
    selectDentist(dentist) {
      this.$emit("dentist-selected", dentist);
    },
  },
};
</script>

<style>
.available-dentists {
  padding: 20px;
}

.available-dentists h2 {
  margin-bottom: 20px;
}

.available-dentists ul {
  list-style: none;
  padding: 0;
}

.available-dentists li {
  margin-bottom: 10px;
}

.available-dentists button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.available-dentists button:hover {
  background-color: #0056b3;
}
</style>