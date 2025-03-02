<template>

    <!-----------------------------------------------------------------------------------------------------
    - This component fetches the timetable for a specific dentist and displays the available appointments -
    ------------------------------------------------------------------------------------------------------>

  <div class="appointments-container">
    <h2>Available Slots</h2>

    <!-- Week navigation -->
    <div class="week-navigation">
      <button @click="previousWeek" class="nav-button"> < Previous Week</button>
      <span class="week-display">
        {{ formatDateRange(weekStart, weekEnd) }}
      </span>
      <button @click="nextWeek" class="nav-button">Next Week ></button>
    </div>

    <!-- Weekly calendar -->
    <div class="weekly-calendar">
      <!-- Header with days -->
      <div class="calendar-header">
        <div class="time-column"></div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-column"
        >
          <div class="day-label">{{ day.dayName }}</div>
          <div class="date-label">{{ day.dateLabel }}</div>
        </div>
      </div>

      <!-- Time slots -->
      <div class="calendar-body">
        <div class="time-slots">
          <div 
            v-for="time in timeSlots" 
            :key="time"
            class="time-row"
          >
            <div class="time-label">{{ time }}</div>
            <div 
              v-for="day in weekDays" 
              :key="`${day.date}-${time}`"
              class="slot-cell"
            >
              <div 
                v-if="hasSlot(day.date, time)"
                class="available-slot"
                @click="bookSlot(getSlot(day.date, time))"
              >
                <span class="slot-time">{{ time }}</span>
                <span class="slot-duration">45 min</span>
              </div>
              <div
                v-else 
                class="booked-slot"
                @click="viewBookingDetails(day.date, time)"
              >
                <span class="slot-time">{{ time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Booking details in a modal box-->
    <div v-if="selectedBooking" class="modal">
      <div class="modal-content">
        <h3>Booking Details</h3>
        <p><strong>Patient Name:</strong> {{ selectedBooking.patientName }}</p>
        <p><strong>Time:</strong> {{ selectedBooking.time }}</p>
        <p><strong>Date:</strong> {{ selectedBooking.date }}</p>
        <p><strong>Notes:</strong> {{ selectedBooking.notes || 'No additional notes provided.' }}</p>
        <button @click="closeModal" class="btn btn-secondary">Close</button>
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
      weekLength: 7, 
      weekStart: monday,
      timeSlots: [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
      ],
      // bookedSlots: {} // --> Fetch and store unavailable appointments here, for now it's mock data
      bookedSlots: {
        // Mock data
        "2024-12-04": [
          { time: '09:00', patientName: 'John Doe', slotId: 1 },
          { time: '14:00', patientName: 'Jane Smith', slotId: 2 },
        ],
        "2024-12-05": [
          { time: "08:00", patientName: "Alex Alexander", slotId: 3, notes: "Check-up" },
          { time: "11:00", patientName: "Bruce Lee", slotId: 4, notes: "Wisdom tooth consultation" },
        ],
        "2024-12-06": [
          { time: "10:00", patientName: "Chris Evans", slotId: 5, notes: "Orthodontic adjustment" },
          { time: "15:00", patientName: "Morgan Blake", slotId: 6, notes: "Teeth whitening" },
        ],
        "2024-12-07": [
          { time: "13:00", patientName: "Taylor Swift", slotId: 7, notes: "Routine cleaning" },
          { time: "16:00", patientName: "Bill Gates", slotId: 8, notes: "Cavity filling" },
        ],
        "2024-12-08": [
          { time: "09:00", patientName: "Serena Williams", slotId: 9, notes: "Dental implant follow-up" },
          { time: "14:00", patientName: "Roger Federer", slotId: 10, notes: "Routine cleaning" },
        ],
        "2024-12-09": [
          { time: "08:00", patientName: "Elon Musk", slotId: 11, notes: "Emergency tooth extraction" },
          { time: "12:00", patientName: "Jeff Bezos", slotId: 12, notes: "Routine cleaning" },
        ],
        "2024-12-10": [
          { time: "10:00", patientName: "Scarlett Johansson", slotId: 13, notes: "Orthodontic consultation" },
          { time: "15:00", patientName: "Chris Hemsworth", slotId: 14, notes: "Teeth whitening" },
        ],
      },
      selectedBooking: null, // To store booking details for the modal box
    };
  },

  computed: {
    weekEnd() {
      const end = new Date(this.weekStart);
      end.setDate(end.getDate() + this.weekLength - 1);
      return end;
    },
    weekDays() {
      const days = [];
      for (let i = 0; i < this.weekLength; i++) {
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
        // const response = await axios.get('https://api.example.com/booked-slots'
        const response = await axios.get('schedule', {
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

    // Returns true if a given time slot is available to be booked.
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

    viewBookingDetails(date, time) {
      const slot = this.getSlot(date, time);
      if (slot) {
        this.selectedBooking = { ...slot, date };
      }
    },

    closeModal() {
      this.selectedBooking = null;
    },
  },

  mounted() {
    this.fetchWeeklySlots();
  },
};
</script>
  
<style scoped>
.appointments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.week-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #e0e0e0;
}

.week-display {
  font-size: 18px;
  font-weight: 500;
}

.weekly-calendar {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.day-column {
  padding: 10px;
  text-align: center;
  border-left: 1px solid #ddd;
}

.day-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.date-label {
  font-size: 14px;
  color: #666;
}

.calendar-body {
  position: relative;
}

.time-slots {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
}

.time-row {
  display: contents;
}

.time-label {
  padding: 10px;
  text-align: right;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  color: #666;
}

.slot-cell {
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 4px;
  height: 60px;
  position: relative;
}

.available-slot {
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  height: 45px; /* 75% of the 60px slot height to represent 45 minutes */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.available-slot:hover {
  background-color: #bbdefb;
}

.slot-time {
  font-weight: 500;
  margin-bottom: 4px;
}

.slot-duration {
  font-size: 12px;
  color: #666;
}

.booked-slot {
  background-color: #ffcccc;
  border-radius: 4px;
  padding: 8px;
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.booked-slot:hover {
  background-color: #ff9999;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}
</style>