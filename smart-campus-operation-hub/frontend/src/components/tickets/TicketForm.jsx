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
    <form onSubmit={handleSubmit} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div>
        <label className="label-text" style={{ marginTop: 0, marginBottom: '8px' }}>Category</label>
        <select name="category" value={formData.category} onChange={handleChange} required className="input-field" style={{ backgroundColor: 'var(--surface-container-highest)', borderRadius: '6px', appearance: 'none', cursor: 'pointer' }}>
          <option value="IT_ISSUE">IT Issue</option>
          <option value="SAFETY">Safety</option>
          <option value="CLEANING">Cleaning</option>
          <option value="FACILITY_DAMAGE">Facility Damage</option>
          <option value="EQUIPMENT_MALFUNCTION">Equipment Malfunction</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="label-text" style={{ marginTop: 0, marginBottom: '8px' }}>Priority</label>
        <select name="priority" value={formData.priority} onChange={handleChange} required className="input-field" style={{ backgroundColor: 'var(--surface-container-highest)', borderRadius: '6px', appearance: 'none', cursor: 'pointer' }}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div>
        <label className="label-text" style={{ marginTop: 0, marginBottom: '8px' }}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required minLength={10} className="input-field" style={{ minHeight: '120px', resize: 'vertical', backgroundColor: 'var(--surface-container-highest)', borderRadius: '6px' }} />
      </div>

      <div>
        <label className="label-text" style={{ marginTop: 0, marginBottom: '8px' }}>Contact Info</label>
        <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required className="input-field" placeholder="Phone directory # or email" style={{ backgroundColor: 'var(--surface-container-highest)', borderRadius: '6px' }} />
      </div>

      <div>
        <label className="label-text" style={{ marginTop: 0, marginBottom: '8px' }}>Resource ID <span style={{opacity: 0.5, fontWeight: 400}}>(Numeric Only, Optional)</span></label>
        <input type="number" name="resourceId" value={formData.resourceId} onChange={handleChange} className="input-field" placeholder="e.g. 4567" style={{ backgroundColor: 'var(--surface-container-highest)', borderRadius: '6px' }} />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px 16px' }}>
          {initialData.id ? 'Update Ticket' : 'Create Ticket'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '12px 16px' }}>
          Cancel
        </button>
      </div>

    </form>
  );
}
