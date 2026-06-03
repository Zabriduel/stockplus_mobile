import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://10.87.169.64:8000', 
});