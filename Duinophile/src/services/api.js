import axios from 'axios';

// Your computer's IP address
// Run "ipconfig" in terminal to find your IPv4 address
const BASE_URL = 'http://10.0.2.2:5000'; // Android emulator
// const BASE_URL = 'http://192.168.1.100:5000'; // Real device - change IP!

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response.data,
  error => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    console.error(`❌ API Error: ${message}`);
    return Promise.reject(new Error(message));
  },
);

export default api;