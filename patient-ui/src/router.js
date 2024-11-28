import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/HomeView.vue';
import AvailableDates from './components/AvailableDates.vue';
import SlotSelection from "./components/SlotSelection.vue";
import AvailableDentists from "./components/AvailableDentists.vue";
import AppointmentBookingForm from './components/AppointmentBookingForm.vue';
import BookingDetails from './views/BookingDetailsView.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/bookslot', name: 'AvailableDates', component: AvailableDates },
  { path: "/slots/:selectedDate", name: "SlotSelection", component: SlotSelection, props: (route) => ({ selectedDate: route.params.selectedDate }) },
  { path: '/available-dentists/:selectedDate/:selectedTime', name: 'AvailableDentists', component: AvailableDentists, props: true },
  { path: '/booking-form/:dentistId/:selectedDate/:selectedTime', name: 'BookingForm', component: AppointmentBookingForm, props: true },
  { path: '/bookingDetails', name: 'bookingDetails', component: BookingDetails },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
