import axios from 'axios';
import { toast } from 'react-toastify';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 900000, // Increased to 15 minutes for 2M record ML pipelines
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.code === 'ERR_NETWORK') {
      toast.error("Network Error: Could not connect to the backend server.");
    } else if (error.response && error.response.status >= 500) {
      toast.error("Server Error: The system encountered an unexpected issue.");
    } else if (error.response && error.response.data && error.response.data.detail) {
      toast.error(error.response.data.detail);
    } else {
      toast.error("An unexpected error occurred while fetching data.");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => client.post('/api/auth/login', { email, password }),
  register: (data) => client.post('/api/auth/register', data),
  me: () => client.get('/api/auth/me'),
};

export const usersAPI = {
  list: () => client.get('/api/users'),
  create: (data) => client.post('/api/users', data),
  update: (id, data) => client.put(`/api/users/${id}`, data),
  delete: (id) => client.delete(`/api/users/${id}`),
};

export const dashboardAPI = {
  getKPIs: (filters) => client.get('/api/dashboard/kpis', { params: filters }),
  getSummary: (filters) => client.get('/api/dashboard/summary', { params: filters }),
};

export const analyticsAPI = {
  getPassengerFlow: (filters) => client.get('/api/analytics/passenger-flow', { params: filters }),
  getODMatrix: (filters) => client.get('/api/analytics/od-matrix', { params: filters }),
  getPeakDetection: (filters) => client.get('/api/analytics/peak-detection', { params: filters }),
  getOvercrowding: (filters) => client.get('/api/analytics/overcrowding', { params: filters }),
  getUnderutilization: (filters) => client.get('/api/analytics/underutilization', { params: filters }),
  getRoutePerformance: (filters) => client.get('/api/analytics/route-performance', { params: filters }),
  getDelays: (filters) => client.get('/api/analytics/delays', { params: filters }),
  getOccupancy: (filters) => client.get('/api/analytics/occupancy', { params: filters }),
  getHeadway: (filters) => client.get('/api/analytics/headway', { params: filters }),
  getRoutes: () => client.get("/api/analytics/routes"),
  getStops: (filters) => client.get('/api/analytics/stops', { params: filters }),
  getVehicleBunching: (filters) => client.get('/api/analytics/vehicle-bunching', { params: filters }),
  getVehicleUtilization: (filters) => client.get('/api/analytics/vehicle-utilization', { params: filters }),
  getBottlenecks: (filters) => client.get('/api/analytics/bottlenecks', { params: filters }),
};

export const predictionsAPI = {
  predictDelay: (data) => client.post('/api/predictions/delay', data),
  predictSeverity: (data) => client.post('/api/predictions/severity', data),
  getHistory: () => client.get('/api/predictions/history'),
};

export const forecastingAPI = {
  forecastDemand: (data) => client.post('/api/forecasting/demand', data),
  forecastOccupancy: (data) => client.post('/api/forecasting/occupancy', data),
};

export const clusteringAPI = {
  getRouteClusters: () => client.get('/api/clustering/routes'),
  getPassengerSegments: () => client.get('/api/clustering/passengers'),
};

export const anomalyAPI = {
  detect: (filters) => client.get('/api/anomalies/detect', { params: filters }),
  getTimeline: (filters) => client.get('/api/anomalies/timeline', { params: filters }),
};

export const recommendationsAPI = {
  generate: () => client.post('/api/recommendations/generate'),
  list: () => client.get('/api/recommendations'),
};

export const simulationsAPI = {
  run: (data) => client.post('/api/simulations/run', data),
  list: () => client.get('/api/simulations'),
  get: (id) => client.get(`/api/simulations/${id}`),
};

export const comparisonAPI = {
  getDualPipeline: () => client.get('/api/comparison/dual-pipeline'),
  runComparison: () => client.post('/api/comparison/run'),
};

export const reportsAPI = {
  generate: (data) => client.post('/api/reports/generate', data),
  list: () => client.get('/api/reports'),
  download: (id) => client.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
};

export const datasetsAPI = {
  generate: (config) => client.post('/api/datasets/generate', config),
  list: () => client.get('/api/datasets'),
  uploadToStorage: (id) => client.post(`/api/datasets/${id}/upload-hdfs`),
};

export const qualityAPI = {
  getReport: (datasetId) => client.get(`/api/quality/report/${datasetId}`),
  getAudit: (datasetId, params) => client.get(`/api/quality/audit/${datasetId}`, { params }),
};

export const settingsAPI = {
  getThresholds: () => client.get('/api/settings/thresholds'),
  updateThresholds: (data) => client.put('/api/settings/thresholds', data),
};

export const exportAPI = {
  exportData: (params) => client.post('/api/export/data', params, { responseType: 'blob' }),
  exportResults: (params) => client.post('/api/export/results', params, { responseType: 'blob' }),
};

export const sparkJobsAPI = {
  list: () => client.get('/api/spark-jobs'),
  get: (id) => client.get(`/api/spark-jobs/${id}`),
};

export default client;
export const pipelineAPI = {
  executePipeline: (type, dataSplit = '70') => client.post(`/api/pipeline/execute?pipeline_type=${type}&data_split=${dataSplit}`),
  getStatus: () => client.get('/api/pipeline/status'),
  predictDelay: (data) => client.post('/api/pipeline/predict', data),
};

export const liveComparisonAPI = {
  getLiveComparison: () => client.get('/api/pipeline/compare')
};
