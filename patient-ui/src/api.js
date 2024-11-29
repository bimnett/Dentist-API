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

export default api;