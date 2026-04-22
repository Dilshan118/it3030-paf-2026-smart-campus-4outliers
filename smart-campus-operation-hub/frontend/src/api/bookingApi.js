import api from './axiosConfig';

export const getBookings = (params) =>
  api.get('/bookings', { params }).then(res => res.data);

export const getBookingById = (id) =>
  api.get(`/bookings/${id}`).then(res => res.data);

export const createBooking = (userId, data) =>
  api.post('/bookings', data, { params: { userId } }).then(res => res.data);

export const updateBooking = (id, data) =>
  api.put(`/bookings/${id}`, data).then(res => res.data);

export const cancelBooking = (id, reason) =>
  api.delete(`/bookings/${id}`, { params: { reason } }).then(res => res.data);

export const approveBooking = (id) =>
  api.patch(`/bookings/${id}/approve`).then(res => res.data);

export const rejectBooking = (id, reason) =>
  api.patch(`/bookings/${id}/reject`, null, { params: { reason } }).then(res => res.data);

export const checkConflicts = (params) =>
  api.get('/bookings/conflicts', { params }).then(res => res.data);
