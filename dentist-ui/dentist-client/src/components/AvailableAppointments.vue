<template>
  <div>
    <h2>Available Slots</h2>

    <!-- Week navigation -->
    <div>
      <button @click="previousWeek"> < Previous Week</button>
      <span>
        {{ formatDateRange(weekStart, weekEnd) }}
      </span>
      <button @click="nextWeek">Next Week ></button>
    </div>

    <!-- Weekly calendar -->
    <div>
      <!-- Header with days -->
      <div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
        >
          <div>{{ day.dayName }}</div>
          <div>{{ day.dateLabel }}</div>
        </div>
      </div>

      <!-- Time slots -->
      <div>
        <div>
          <div 
            v-for="time in timeSlots" 
            :key="time"
          >
            <div>{{ time }}</div>
            <div 
              v-for="day in weekDays" 
              :key="`${day.date}-${time}`"
            >
              <div 
                v-if="hasSlot(day.date, time)"
                @click="bookSlot(getSlot(day.date, time))"
              >
                <span>{{ time }}</span>
                <span>45 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AvailableAppointments',

  data() {

    // Ensure the week view starts on a Monday
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1);

    return {
      weekStart: monday,
      timeSlots: [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
      ],
      bookedSlots: {} // Fetch and store unavailable appointments here
    };
  },

  computed: {
    weekEnd() {
      const end = new Date(this.weekStart);
      end.setDate(end.getDate() + 6);
      return end;
    },
    weekDays() {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(this.weekStart);
        date.setDate(this.weekStart.getDate() + i);
        days.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dateLabel: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        });
      }
      return days;
    },
  },

  methods: {
    async fetchWeeklySlots() {
      try {
        const response = await axios.get('https://api.example.com/booked-slots', {
          params: {
            startDate: this.weekStart.toISOString().split('T')[0],
            endDate: this.weekEnd.toISOString().split('T')[0],
          },
        });
        this.bookedSlots = response.data;
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
      }
    },

    hasSlot(date, time) {
      const slotsForSelectedDate = this.bookedSlots[date];
      if (!slotsForSelectedDate) {
        return true;
      }
      return !slotsForSelectedDate.some(slot => slot.time === time);
    },

    getSlot(date, time) {
      const slotsForSelectedDate = this.bookedSlots[date];
      if(!slotsForSelectedDate){
        return undefined;
      }
      return slotsForSelectedDate.find(slot => slot.time === time);
    },

    formatDateRange(start, end) {
      return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    },

    nextWeek() {
      this.weekStart.setDate(this.weekStart.getDate() + 7);
      this.weekStart = new Date(this.weekStart);
      this.fetchWeeklySlots();
    },

    previousWeek() {
      this.weekStart.setDate(this.weekStart.getDate() - 7);
      this.weekStart = new Date(this.weekStart);
      this.fetchWeeklySlots();
    },

    bookSlot(slot) {
        // Send API request to make a slot available for patients.
    },
  },

  mounted() {
    this.fetchWeeklySlots();
  },
};
</script>
  
<style scoped>

</style>