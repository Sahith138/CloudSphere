import axios from "axios";

const API = axios.create({
  // Use VITE_API_URL if it exists (for production deployment).
  // Otherwise, dynamically use the current hostname (so it works on your phone via local IP).
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`,
});

export default API;