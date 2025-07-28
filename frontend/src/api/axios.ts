import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;