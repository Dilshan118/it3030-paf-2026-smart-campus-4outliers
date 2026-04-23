import api from './axiosConfig';

export const getProfile = () => api.get('/users/me').then(res => res.data);
export const updateProfile = (data) => api.put('/users/me', data).then(res => res.data);
