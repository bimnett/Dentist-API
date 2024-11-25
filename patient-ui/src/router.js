import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/HomeView.vue';
import DentistList from './views/DentistListView.vue';
import DentistTimetable from './views/DentistTimetableView.vue';
import BookingDetails from './views/BookingDetailsView.vue';
import api from './patientApi.js';
// import BookingForm from './components/BookingForm.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/dentistlist', name: 'DentistList', component: DentistList },
  { path: '/dentisttimetable', name: 'DentistTimetable', component: DentistTimetable },
  { path: '/bookingDetails', name: 'bookingDetails', component: BookingDetails },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
