<template>
    <div class="slot-selection">
      <h2>Available Time Slots for {{ formatDate(selectedDate) }}</h2>
      <div class="time-slots">
        <button
          v-for="time in timeSlots"
          :key="time"
          @click="selectTime(time)"
          class="time-slot"
        >
          {{ time }}
        </button>
      </div>
    </div>
</template>
  
<script>
/**
 * SlotSelection component is responsible for displaying time slots that the user can choose from.
 * Available dentists will then be shown for the user to select in their selected time slot.
 * Upon selection, the user will be directed to a booking form to fill in their details to make the appointment.
 */

 export default {
  props: {
    selectedDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      timeSlots: [
        "8:30 AM",
        "9:00 AM",
        "9:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "1:00 PM",
      ], // Fixed time slots
    };
  },
  methods: {
    // Format the date for display
    formatDate(date) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    },
    // Navigate to available dentists for the selected date and time
    selectTime(time) {
      this.$router.push({
        name: 'AvailableDentists',
        params: { selectedDate: this.selectedDate, selectedTime: time },
      });
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