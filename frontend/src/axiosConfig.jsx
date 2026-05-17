import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:6001'),
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
