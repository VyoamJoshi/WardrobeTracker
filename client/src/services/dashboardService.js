import api from './api.js';

export const dashboardService = {
  async getDashboard() {
    return api.get('/dashboard');
  },
};

export default dashboardService;
