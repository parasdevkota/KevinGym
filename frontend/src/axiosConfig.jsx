import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:6001', // local
  baseURL: 'http://localhost:6001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
