// handles patient-related API calls to backend 'patientApp.js'
    
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
  })

export default {
  getDentists() {
    return Promise.resolve({
      data: [
        { id: 1, name: "Dr. John Johnson", specialty: "Orthodontics", location: "Central Gothenburg" },
        { id: 2, name: "Dr. Michael Mike", specialty: "Pediatric Dentistry", location: "North Gothenburg" },
        { id: 3, name: "Dr. Sarah Sarah", specialty: "General Dentistry", location: "South Gothenburg" },
      ]
    });
    // return api.get('/dentists'); // UNCOMMENT AFTER DB SET UP
  },
  async getDentistClinics() {
    try{
      const response = await api.get('');
      return response.data;
    } catch(err){
      throw err;
    }
  },
  getTimetable(dentistId) {
    return Promise.resolve({
      data: {
        id: dentistId,
        timetable: ["10:00 AM", "11:00 AM", "2:00 PM"]
      }
    });
    // return api.get(`/dentists/${dentistId}/timetable`); // UNCOMMENT AFTER DB SET UP
  },
  postBooking(dentistId, bookingData) {
    return Promise.resolve({
      data: {
        message: "Booking successful",
        bookingId: "12345"
      }
    });
    // return api.post(`/dentists/${dentistId}/bookings`, bookingData); // UNCOMMENT AFTER DB SET UP
  },
  getBooking(referenceCode) {
    const booking = mockBookings.find(b => b.referenceCode === referenceCode);
    console.log('Searching for:', referenceCode);
    console.log('Found booking:', booking);
    if (booking) {
      return Promise.resolve({ data: booking });
    } else {
      return Promise.reject(new Error('Booking not found'));
    }
    // return api.get(`/bookings/${referenceCode}`); // UNCOMMENT AND REMOVE ABOVE AFTER DB SET UP
  }
};

// REMOVE AFTER DB SET UP
const mockBookings = [
  {
    referenceCode: 'ABC123',
    time: '10:00 AM',
    date: '2024-11-27',
    clinicName: 'Downtown Dental Clinic',
    dentist: 'Dr. Sarah Johnson',
  },
  {
    referenceCode: 'XYZ789',
    time: '2:30 PM',
    date: '2024-11-28',
    clinicName: 'Uptown Dental Care',
    dentist: 'Dr. Michael Lee',
  },
];
