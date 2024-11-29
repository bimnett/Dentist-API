<template>
  <div class="available-dates">
    <h2>Select a Date</h2>
    <div class="calendar">
      <div class="header">
        <h3>December 2024</h3>
      </div>
      <div class="days-of-week">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>
      <div class="days">
        <div
          v-for="(day, index) in daysInMonth"
          :key="index"
          class="day"
          @click="selectDate(day)"
          :class="{ clickable: day }"
        >
          <span>{{ day || '' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
/**
 * AvailableDates component displays monthly calendar with dates that the user can choose from.
 * Once a user selects a date, they'll be given time slots to select from (SlotSelection component).
 */
 export default {
  name: 'AvailableDates',
  data() {
    return {
      daysInMonth: [],
    };
  },
  created() {
    this.generateDaysInMonth();
  },
  methods: {
    generateDaysInMonth() {
      const year = 2024;
      const month = 11; // December
      const days = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const allDays = Array.from({ length: days }, (_, i) => i + 1);
      this.daysInMonth = Array(firstDayOfMonth).fill(null).concat(allDays);
    },
    selectDate(day) {
      if (day) {
        const selectedDate = `2024-12-${String(day).padStart(2, '0')}`;
        this.$emit('date-selected', selectedDate); // Emit the selected date
      }
    },
  },
};
</script>

<style>
.available-dates {
  padding: 20px;
}

.calendar {
  text-align: center;
}

.days-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 5px;
}

.day {
  padding: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.day.clickable:hover {
  background-color: #f0f0f0;
}

.day.clickable {
  cursor: pointer;
}
</style>