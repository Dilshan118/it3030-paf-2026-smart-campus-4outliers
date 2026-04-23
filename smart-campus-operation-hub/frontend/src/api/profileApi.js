import api from './axiosConfig';

export const getProfile = () => api.get('/users/me');
export const completeProfile = (data) => api.post('/users/me/complete-profile', data);
export const updateProfile = (data) => api.put('/users/me', data);
