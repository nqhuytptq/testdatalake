import axios from 'axios';

// Với proxy, chỉ dùng đường dẫn tương đối:
const api = axios.create({
 baseURL: 'http://localhost:5001', // sẽ proxy sang http://localhost:5001
  timeout: 30000
});

export const fetchFiles = () => api.get('/list');

export const fetchMerged = (params = {}) => api.get('/merged', { params });
// ví dụ params: { device: 'Sensor-Temp01', from: '2025-10-18T00:00:00Z', to: '2025-10-18T23:59:59Z' }

export const downloadCSV = (params = {}) =>
  api.get('/merged', { params: { ...params, format: 'csv' }, responseType: 'blob' });

export default api;
