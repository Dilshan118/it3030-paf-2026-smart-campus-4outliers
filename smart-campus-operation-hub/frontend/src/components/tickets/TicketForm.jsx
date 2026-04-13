import React, { useState } from 'react';

export default function TicketForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category: initialData.category || 'IT_ISSUE',
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
    const normalized = {
      ...formData,
      resourceId: formData.resourceId === '' ? null : Number(formData.resourceId),
    };

    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      
      <label>
        <span className="label-text">Category</span>
        <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
          <option value="IT_ISSUE">IT Issue</option>
          <option value="SAFETY">Safety</option>
          <option value="CLEANING">Cleaning</option>
          <option value="FACILITY_DAMAGE">Facility Damage</option>
          <option value="EQUIPMENT_MALFUNCTION">Equipment Malfunction</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label>
        <span className="label-text">Priority</span>
        <select name="priority" value={formData.priority} onChange={handleChange} required className="input-field">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </label>

      <label>
        <span className="label-text">Description</span>
        <textarea name="description" value={formData.description} onChange={handleChange} required minLength={10} className="input-field" style={{ minHeight: '120px', resize: 'vertical' }} />
      </label>

      <label>
        <span className="label-text">Contact Info</span>
        <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required className="input-field" placeholder="Phone directory \# or email" />
      </label>

      <label>
        <span className="label-text">Resource ID (Optional)</span>
        <input type="number" name="resourceId" value={formData.resourceId} onChange={handleChange} className="input-field" placeholder="e.g. 4567" />
      </label>

      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {initialData.id ? 'Update Ticket' : 'Create Ticket'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>
          Cancel
        </button>
      </div>

    </form>
  );
}
