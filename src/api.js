// frontend/src/api.js
import axios from 'axios';

const api = axios.create({

  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});


api.interceptors.request.use(cfg => {
  const key = localStorage.getItem('apiKey');
  if (key) cfg.headers['x-api-key'] = key;
  return cfg;
});

export default api;
