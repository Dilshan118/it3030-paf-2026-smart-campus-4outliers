import React, { useState } from 'react';
import { Send, X, AlertTriangle } from 'lucide-react';

export default function TicketForm({ initialData = {}, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    category: initialData.category || 'IT_ISSUE',
    description: initialData.description || '',
    priority: initialData.priority || 'LOW',
    contactInfo: initialData.contactInfo || '',
    resourceId: initialData.resourceId || ''
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formError) setFormError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const description = formData.description.trim();
    const contactInfo = formData.contactInfo.trim();
    const parsedResourceId = formData.resourceId === '' ? null : Number(formData.resourceId);

    if (description.length < 10) {
      setFormError('Please provide at least 10 characters in the description.');
      return;
    }

    if ((formData.priority === 'HIGH' || formData.priority === 'CRITICAL') && contactInfo.length < 6) {
      setFormError('Please add valid contact info for HIGH or CRITICAL tickets.');
      return;
    }

    if (parsedResourceId !== null && (!Number.isInteger(parsedResourceId) || parsedResourceId <= 0)) {
      setFormError('Resource ID must be a positive number.');
      return;
    }

    const normalized = {
      ...formData,
      description,
      contactInfo: contactInfo === '' ? null : contactInfo,
      resourceId: parsedResourceId,
    };

    setFormError('');
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <label className="label-text">Select Category</label>
          <div style={{ position: 'relative' }}>
            <select name="category" value={formData.category} onChange={handleChange} required className="input-field" style={{ appearance: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}>
              <option value="IT_ISSUE">IT Issue</option>
              <option value="SAFETY">Safety</option>
              <option value="CLEANING">Cleaning</option>
              <option value="FACILITY_DAMAGE">Facility Damage</option>
              <option value="EQUIPMENT_MALFUNCTION">Equipment Malfunction</option>
              <option value="OTHER">Other</option>
            </select>
            <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              ▼
            </div>
          </div>
        </div>

        <div>
          <label className="label-text">Select Priority</label>
          <div style={{ position: 'relative' }}>
            <select name="priority" value={formData.priority} onChange={handleChange} required className="input-field" style={{ appearance: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              ▼
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="label-text">Detailed Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
          minLength={10} 
          className="input-field" 
          style={{ minHeight: '160px', resize: 'vertical', fontSize: '1.05rem', padding: '24px', background: 'var(--bg-primary)' }} 
          placeholder="Describe the issue, location, and any actions already taken..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start' }}>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <label className="label-text">Contact Info</label>
          <input 
            type="text" 
            name="contactInfo" 
            value={formData.contactInfo} 
            onChange={handleChange} 
            className="input-field" 
            style={{ fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}
            placeholder="Phone number or Extension" 
          />
        </div>
        <div>
          <label className="label-text" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Associated Resource ID</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(Optional Numeric)</span>
          </label>
          <input 
            type="number" 
            name="resourceId" 
            value={formData.resourceId} 
            onChange={handleChange} 
            className="input-field" 
            style={{ fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}
            placeholder="e.g., 4567" 
          />
        </div>
      </div>

      {formData.priority === 'CRITICAL' && (
        <div style={{ background: 'var(--danger-muted)', padding: '20px 24px', borderRadius: 'var(--radius)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AlertTriangle size={24} color="var(--danger)" />
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--danger)', display: 'block' }}>Priority Warning</strong>
            Use CRITICAL only for urgent campus-impacting issues. This queues immediate technician dispatch and manager review.
          </p>
        </div>
      )}

      {formError && (
        <div style={{ background: 'var(--danger-muted)', color: 'var(--danger)', padding: '14px 16px', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 600 }}>
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '32px', borderTop: 'none' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '1.05rem', padding: '18px' }} disabled={loading}>
          <X size={20} /> Dismiss
        </button>
        <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: '1.05rem', padding: '18px', background: loading ? 'var(--bg-surface-elevated)' : undefined, color: loading ? 'var(--text-muted)' : undefined }} disabled={loading}>
          {loading ? (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          ) : (
            <><Send size={20} /> {initialData.id ? 'Update Request' : 'Submit Ticket'}</>
          )}
        </button>
      </div>

    </form>
  );
}
