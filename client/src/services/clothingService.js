import api from './api.js';

export const clothingService = {
  async getClothes(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/clothes${queryString}`);
  },

  async getClothingById(id) {
    return api.get(`/clothes/${id}`);
  },

  async createClothing(formData) {
    return api.post('/clothes', formData);
  },

  async updateClothing(id, formData) {
    return api.put(`/clothes/${id}`, formData);
  },

  async deleteClothing(id) {
    return api.delete(`/clothes/${id}`);
  },

  async recordWear(id) {
    return api.post(`/clothes/${id}/wear`);
  },

  async recordWash(id) {
    return api.post(`/clothes/${id}/wash`);
  },

  async getWearHistory(id) {
    return api.get(`/clothes/${id}/wear-history`);
  },

  async getWashHistory(id) {
    return api.get(`/clothes/${id}/wash-history`);
  },
};

export default clothingService;
