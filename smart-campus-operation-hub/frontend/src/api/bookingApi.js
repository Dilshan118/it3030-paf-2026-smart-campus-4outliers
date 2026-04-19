// MEMBER 2: Booking API calls
import api from './axiosConfig';

export const getBookings = (params) => api.get('/bookings', { params }).then(res => res.data);
export const getBookingById = (id) => api.get(`/bookings/${id}`).then(res => res.data);
export const createBooking = (data) => api.post('/bookings', data).then(res => res.data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data).then(res => res.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then(res => res.data);
export const approveBooking = (id) => api.patch(`/bookings/${id}/approve`).then(res => res.data);
export const rejectBooking = (id, reason) => api.patch(`/bookings/${id}/reject`, null, { params: { reason } }).then(res => res.data);
export const getBookingQr = (id) => api.get(`/bookings/${id}/qr`).then(res => res.data);
export const checkConflicts = (params) => api.get('/bookings/conflicts', { params }).then(res => res.data);
