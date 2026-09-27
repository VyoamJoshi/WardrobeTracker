import api from './api.js';

export const analyticsService = {
  async getAnalytics() {
    return api.get('/analytics');
  },
};

export default analyticsService;
