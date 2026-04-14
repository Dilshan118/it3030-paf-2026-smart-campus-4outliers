// MEMBER 3: Ticket API calls
import api from './axiosConfig';

export const getTickets = (params) => api.get('/tickets', { params }).then(res => res.data);
export const getTicketById = (id) => api.get(`/tickets/${id}`).then(res => res.data);
export const createTicket = (data) => api.post('/tickets', data).then(res => res.data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data).then(res => res.data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`).then(res => res.data);
export const updateTicketStatus = (id, status, notes = '', reason = '') => 
    api.patch(`/tickets/${id}/status`, null, { params: { status, resolutionNotes: notes, rejectionReason: reason } }).then(res => res.data);
export const assignTechnician = (id, techId) => 
    api.patch(`/tickets/${id}/assign`, null, { params: { technicianId: techId } }).then(res => res.data);
export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`).then(res => res.data);
export const addComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data).then(res => res.data);
export const editComment = (ticketId, commentId, data) => api.put(`/tickets/${ticketId}/comments/${commentId}`, data).then(res => res.data);
export const deleteComment = (ticketId, commentId) => api.delete(`/tickets/${ticketId}/comments/${commentId}`).then(res => res.data);
export const uploadAttachment = (ticketId, formData) => api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const deleteAttachment = (ticketId, attachmentId) => api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`).then(res => res.data);
