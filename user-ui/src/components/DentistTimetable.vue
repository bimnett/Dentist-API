<template>
    <div>
      <h2>Available Time Slots</h2>
      <ul>
        <li v-for="slot in slots" :key="slot.time" @click="bookSlot(slot)">
          {{ slot.time }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '../patientApi.js';
  
  export default {
    props: ['dentistId'],
    data() {
      return {
        slots: []
      };
    },
    watch: {
      dentistId: {
        immediate: true,
        handler(newId) {
          if (newId) {
            api.getTimetable(newId).then(response => {
              this.slots = response.data;
            });
          }
        }
      }
    },
    methods: {
      bookSlot(slot) {
        this.$emit('select-slot', slot);
      }
    }
  };
  </script>  