// // handles patient-related API calls to backend 'patientApp.js'
    
// import axios from 'axios';

// export const api = axios.create({
//     baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api',
//     headers: { 'Content-Type': 'application/json' }
//   })

// export default {
//   // Get available slots from all dentists' timetables for a specific date
//   getAvailableSlots(selectedDate) {
//     const slots = new Set();
//     // Loop through each dentist's timetable for the given date
//     mockDentistsData.forEach((dentist) => {
//       if (dentist.timetable[selectedDate]) {
//         dentist.timetable[selectedDate].forEach((time) => slots.add(time));
//       }
//     });
//     return Promise.resolve({ data: Array.from(slots).sort() });
//     // return api.get(`/available-slots`, { params: { date: selectedDate } }); // uncomment and remove above after db/backend set up + integration
//   },
//   // flter dentists that have the selected time in their timetable
//   getAvailableDentists(selectedDate, selectedTime) {
//     const availableDentists = mockDentistsData.filter((dentist) =>
//       dentist.timetable[selectedDate]?.includes(selectedTime)
//     );
//     return Promise.resolve({ data: availableDentists });
//     // return api.get(`/dentists`, { params: { availableTime: selectedTime } }); // uncomment and remove above after db/backend set up + integration
//   },
//   async postBooking(dentistId, bookingData) {
//     try {
//       // Fetch available dentists for validation
//       const response = await this.getAvailableDentists(bookingData.date, bookingData.time);
//       const dentist = response.data.find((d) => d.id === parseInt(dentistId, 10));

//       if (!dentist) {
//         return Promise.reject(new Error("Dentist not found"));
//       }

//       // create new booking obj with input data
//       const newBooking = {
//         referenceCode: `${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
//         dentist: dentist.name,
//         clinicName: dentist.location,
//         time: bookingData.time,
//         patientName: bookingData.name,
//         email: bookingData.email,
//         phone: bookingData.phone,
//         date: bookingData.date,
//       };

//       // push to mockBookingData for now
//       mockBookingData.push(newBooking);

//       return Promise.resolve({
//         data: {
//           message: "Booking successful",
//           referenceCode: newBooking.referenceCode,
//         },
//       });
//       // Uncomment below when backend is set up
//       // return api.post(`/dentists/${dentistId}/bookings`, bookingData);
//     } catch (error) {
//       console.error("Error creating booking:", error.message);
//       return Promise.reject(new Error("Error creating booking. Please try again."));
//     }
//   },
//   getBooking(referenceCode) {
//     console.log("Searching for booking with reference code:", referenceCode);
//     console.log("Available bookings in mockBookingData:", mockBookingData.map(b => b.referenceCode));
//     const booking = mockBookingData.find(b => b.referenceCode === referenceCode);
//     console.log('Searching for:', referenceCode);
//     console.log('Found booking:', booking);
//     if (booking) {
//       return Promise.resolve({ data: booking });
//     } else {
//       return Promise.reject(new Error('Booking not found'));
//     }
//     // return api.get(`/bookings/${referenceCode}`); // uncomment and remove above after db/backend set up + integration
//   }
// };

// // Remove after db set up
// const mockBookingData = [
//   {
//     referenceCode: "ABC123",
//     time: "10:00 AM",
//     date: "2024-12-01",
//     clinicName: "Central Gothenburg",
//     dentist: "Dr. John Johnson",
//     patientName: "Alice Johnson",
//     email: "alice.johnson@example.com",
//     phone: "123-456-7890",
//   },
//   {
//     referenceCode: "XYZ789",
//     time: "2:30 PM",
//     date: "2024-12-02",
//     clinicName: "North Gothenburg",
//     dentist: "Dr. Michael Mike",
//     patientName: "Bob Smith",
//     email: "bob.smith@example.com",
//     phone: "987-654-3210",
//   },
//   {
//     referenceCode: "JKL456",
//     time: "11:30 AM",
//     date: "2024-12-01",
//     clinicName: "South Gothenburg",
//     dentist: "Dr. Sarah Sarah",
//     patientName: "Charlie Brown",
//     email: "charlie.brown@example.com",
//     phone: "555-123-4567",
//   },
//   {
//     referenceCode: "MNO789",
//     time: "9:30 AM",
//     date: "2024-12-03",
//     clinicName: "Central Gothenburg",
//     dentist: "Dr. John Johnson",
//     patientName: "Daisy Ridley",
//     email: "daisy.ridley@example.com",
//     phone: "222-333-4444",
//   },
//   {
//     referenceCode: "PQR234",
//     time: "3:00 PM",
//     date: "2024-12-04",
//     clinicName: "North Gothenburg",
//     dentist: "Dr. Michael Mike",
//     patientName: "Evan Peters",
//     email: "evan.peters@example.com",
//     phone: "999-888-7777",
//   },
//   {
//     referenceCode: "STU567",
//     time: "1:00 PM",
//     date: "2024-12-05",
//     clinicName: "South Gothenburg",
//     dentist: "Dr. Sarah Sarah",
//     patientName: "Frank Ocean",
//     email: "frank.ocean@example.com",
//     phone: "123-321-4567",
//   },
// ];

// // Remove after db set up
// const mockDentistsData = [
//   {
//     id: 1,
//     name: "Dr. John Johnson",
//     specialty: "Orthodontics",
//     location: "Central Gothenburg",
//     timetable: {
//       "2024-12-01": ["9:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"],
//       "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
//       "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
//       "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
//       "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
//       "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
//       "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
//       "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
//       "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
//       "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
//       "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
//       "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
//       "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
//       "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
//       "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
//       "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
//       "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
//       "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
//       "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
//       "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
//       "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
//     },
//   },
//   {
//     id: 2,
//     name: "Dr. Michael Mike",
//     specialty: "Pediatric Dentistry",
//     location: "North Gothenburg",
//     timetable: {
//       "2024-12-01": ["9:30 AM", "10:30 AM", "1:00 PM", "3:00 PM"],
//       "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
//       "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
//       "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
//       "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
//       "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
//       "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
//       "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
//       "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
//       "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
//       "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
//       "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
//       "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
//       "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
//       "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
//       "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
//       "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
//       "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
//       "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
//       "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
//       "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
//     },
//   },
//   {
//     id: 3,
//     name: "Dr. Sarah Sarah",
//     specialty: "General Dentistry",
//     location: "South Gothenburg",
//     timetable: {
//       "2024-12-01": ["9:30 AM", "10:30 AM", "1:00 PM", "3:00 PM"],
//       "2024-12-02": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-03": ["10:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-04": ["9:00 AM", "10:30 AM", "2:00 PM"],
//       "2024-12-05": ["8:30 AM", "11:00 AM", "3:00 PM"],
//       "2024-12-06": ["9:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-07": ["10:30 AM", "12:30 PM", "4:00 PM"],
//       "2024-12-08": ["9:00 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-09": ["10:00 AM", "12:00 PM", "4:30 PM"],
//       "2024-12-10": ["8:30 AM", "10:30 AM", "1:30 PM"],
//       "2024-12-11": ["9:30 AM", "11:00 AM", "2:00 PM"],
//       "2024-12-12": ["10:00 AM", "12:30 PM", "3:00 PM"],
//       "2024-12-13": ["9:00 AM", "10:30 AM", "4:00 PM"],
//       "2024-12-14": ["8:30 AM", "11:00 AM", "1:30 PM"],
//       "2024-12-15": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-16": ["10:00 AM", "11:30 AM", "2:00 PM"],
//       "2024-12-17": ["8:30 AM", "10:30 AM", "4:30 PM"],
//       "2024-12-18": ["9:00 AM", "12:00 PM", "3:00 PM"],
//       "2024-12-19": ["10:30 AM", "1:00 PM", "4:00 PM"],
//       "2024-12-20": ["8:30 AM", "11:30 AM", "2:30 PM"],
//       "2024-12-21": ["9:30 AM", "12:00 PM", "3:30 PM"],
//       "2024-12-22": ["10:00 AM", "2:00 PM", "4:30 PM"],
//       "2024-12-23": ["9:00 AM", "11:30 AM", "3:30 PM"],
//       "2024-12-24": ["8:30 AM", "10:30 AM", "12:30 PM"],
//       "2024-12-25": ["10:00 AM", "1:30 PM", "4:30 PM"],
//       "2024-12-26": ["9:30 AM", "12:30 PM", "2:30 PM"],
//       "2024-12-27": ["8:30 AM", "10:00 AM", "3:00 PM"],
//       "2024-12-28": ["9:00 AM", "11:00 AM", "4:00 PM"],
//       "2024-12-29": ["10:30 AM", "1:00 PM", "3:30 PM"],
//       "2024-12-30": ["9:00 AM", "12:00 PM", "2:30 PM"],
//     },
//   },
// ];