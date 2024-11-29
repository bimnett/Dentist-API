<template>
  <div class="slot-selection">
    <h2>Available Time Slots for {{ formatDate(selectedDate) }}</h2>
    <div v-if="timeSlots.length > 0" class="time-slots">
      <button
        v-for="time in timeSlots"
        :key="time"
        @click="showSelectedTime(time)"
        class="time-slot"
      >
        {{ time }}
      </button>
    </div>
    <div v-else>
      <p>No available slots for the selected date.</p>
    </div>
  </div>
</template>
  
<script>
/**
 * SlotSelection component is responsible for displaying time slots that the user can choose from.
 * Available dentists will then be shown for the user to select in their selected time slot.
 * Upon selection, the user will be directed to a booking form to fill in their details to make the appointment.
 */
 import api from "../patientApi";
 export default {
  name: "SlotSelection",
  props: {
    selectedDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      timeSlots: [], // Available time slots fetched from API
    };
  },
  async created() {
    try {
      const response = await api.getAvailableSlots(this.selectedDate);
      this.timeSlots = response.data;
    } catch (error) {
      console.error("Error fetching available slots:", error.message);
    }
  },
  methods: {
    formatDate(date) {
      const options = { weekday: "long", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("en-US", options);
    },
    showSelectedTime(time) {
      this.$emit("time-selected", time);
    },
  },
};
</script>

<style>
.slot-selection {
  padding: 20px;
  text-align: center;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.time-slot {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
}

.time-slot:hover {
  background-color: #f0f0f0;
}

.time-slot:focus,
.time-slot:active {
  background-color: #007bff;
  color: white;
}
</style>