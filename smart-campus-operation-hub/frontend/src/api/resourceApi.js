import api from './axiosConfig';

export const getAllResources = (page = 0, size = 12) =>
  api.get('/resources', { params: { page, size } });


export const getResourceById = (id) =>
  api.get(`/resources/${id}`);

export const searchResources = (filters, page = 0, size = 12) =>
  api.get('/resources/search', { params: { ...filters, page, size } });

export const createResource = (data) =>
  api.post('/resources', data);

export const updateResource = (id, data) =>
  api.put(`/resources/${id}`, data);

export const deleteResource = (id) =>
  api.delete(`/resources/${id}`);

export const toggleResourceStatus = (id) =>
  api.patch(`/resources/${id}/status`);

export const uploadResourceImage = (id, formData) =>
  api.post(`/resources/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
