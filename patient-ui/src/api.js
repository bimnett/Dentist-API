/**
 * This is a configuration file that makes HTTP requests from frontend to backend middleware
 * It communicates with patientApi.js from middleware directory by sending requests to its API endpoints.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// // get all clinics via MQTT
// export const getClinics = async () => {
//     try {
//       const response = await api.get('/slots/bookAppointments/clinics');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching clinics:', error);
//       throw error;
//     }
//   };
  
//   // get dentists in a clinic via MQTT
//   export const getDentistsByClinic = async (clinicId) => {
//     try {
//       const response = await api.get(`/slots/bookAppointments/clinics/${clinicId}/dentists`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching dentists:', error);
//       throw error;
//     }
//   };

export default api;