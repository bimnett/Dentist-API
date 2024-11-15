import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
  })

export default {
  getDentists() {
    return api.get('/dentists');
  },
  getTimetable(dentistId) {
    return api.get(`/dentists/${dentistId}/timetable`);
  },
  postBooking(dentistId, bookingData) {
    return api.post(`/dentists/${dentistId}/bookings`, bookingData);
  },
  getBooking(referenceCode) {
    return api.get(`/bookings/${referenceCode}`);
  }
};
