import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/HomeView.vue';
import AvailableDatesView from './views/AvailableDatesView.vue';
import SlotSelectionView from "./views/SlotSelectionView.vue";
import AvailableDentistsView from "./views/AvailableDentistsView.vue";
import AppointmentBookingFormView from './views/AppointmentBookingFormView.vue';
import BookingDetailsView from './views/BookingDetailsView.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/available-dates', name: 'AvailableDates', component: AvailableDatesView },
  { path: "/slots/:selectedDate", name: "SlotSelection", component: SlotSelectionView, props: (route) => ({ selectedDate: route.params.selectedDate }) },
  { path: '/available-dentists/:selectedDate/:selectedTime', name: 'AvailableDentists', component: AvailableDentistsView, props: true },
  { path: '/booking-form/:dentistId/:selectedDate/:selectedTime', name: 'BookingForm', component: AppointmentBookingFormView, props: true },
  { path: '/booking-details/:referenceCode?', name: 'bookingDetails', component: BookingDetailsView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
