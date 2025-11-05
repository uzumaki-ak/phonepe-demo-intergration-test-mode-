import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paymentApi = {
  initiatePayment: async (paymentData: any) => {
    const response = await api.post('/payment/initiate', paymentData);
    return response.data;
  },
  
  checkStatus: async (transactionId: string) => {
    const response = await api.get(`/payment/status/${transactionId}`);
    return response.data;
  }
};