import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: `${config.API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * API Methods
 */
export const pollApi = {
  // Create a new poll
  createPoll: async (question, options) => {
    const response = await api.post('/polls', { question, options });
    return response.data;
  },

  // Get poll by ID
  getPoll: async (pollId, fingerprint) => {
    const response = await api.get(`/polls/${pollId}`, {
      params: { fingerprint }
    });
    return response.data;
  },

  // Submit a vote
  submitVote: async (pollId, optionIndex, fingerprint) => {
    const response = await api.post(`/polls/${pollId}/vote`, {
      optionIndex,
      fingerprint
    });
    return response.data;
  },

  // Get poll results
  getResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  }
};

export default api;
