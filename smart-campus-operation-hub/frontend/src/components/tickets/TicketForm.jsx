import React, { useState } from 'react';

export default function TicketForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category: initialData.category || 'IT_SUPPORT',
    description: initialData.description || '',
    priority: initialData.priority || 'LOW',
    contactInfo: initialData.contactInfo || '',
    resourceId: initialData.resourceId || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      
      <label>
        <span style={{ fontWeight: 'bold' }}>Category:</span>
        <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
          <option value="IT_SUPPORT">IT Support</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="CLEANING">Cleaning</option>
          <option value="SECURITY">Security</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label>
        <span style={{ fontWeight: 'bold' }}>Priority:</span>
        <select name="priority" value={formData.priority} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </label>

      <label>
        <span style={{ fontWeight: 'bold' }}>Description:</span>
        <textarea name="description" value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }} />
      </label>

      <label>
        <span style={{ fontWeight: 'bold' }}>Contact Info:</span>
        <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} placeholder="Phone number or email" />
      </label>

      <label>
        <span style={{ fontWeight: 'bold' }}>Resource ID (Optional):</span>
        <input type="number" name="resourceId" value={formData.resourceId} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }} placeholder="e.g. Printer #32" />
      </label>

      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
          {initialData.id ? 'Update Ticket' : 'Create Ticket'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '8px 16px', backgroundColor: '#e5e4e7', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
          Cancel
        </button>
      </div>

    </form>
  );
}
