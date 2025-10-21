import axios from 'axios';
import { API_BASE_URL } from './config';

// Create a custom axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false // Disable sending credentials
});

export default api;