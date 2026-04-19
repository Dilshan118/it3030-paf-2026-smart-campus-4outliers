import React, { useState, useEffect } from 'react';
import { Send, X, Clock, HelpCircle } from 'lucide-react';
import { getAllResources } from '../../api/resourceApi';

export default function BookingForm({ initialData = {}, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    resourceId: initialData.resourceId || '',
    startTime: initialData.startTime || '',
    endTime: initialData.endTime || '',
    purpose: initialData.purpose || ''
  });

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await getAllResources(null, null, null);
      if (res.data && res.data.content) {
        setResources(res.data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate time logic
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        alert("End time must be after the start time");
        return;
    }
    
    onSubmit({
      ...formData,
      resourceId: Number(formData.resourceId)
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <label className="label-text">Select Resource</label>
        <div style={{ position: 'relative' }}>
          <select 
            name="resourceId" 
            value={formData.resourceId} 
            onChange={handleChange} 
            required 
            className="input-field" 
            style={{ appearance: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}
            disabled={loadingResources}
          >
            <option value="" disabled>-- Select an active resource --</option>
            {resources.map(r => (
               <option key={r.id} value={r.id}>{r.name} ({r.type.replace('_', ' ')})</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
            ▼
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> Start Time</label>
          <input 
            type="datetime-local" 
            name="startTime" 
            value={formData.startTime} 
            onChange={handleChange} 
            required 
            className="input-field" 
            style={{ fontSize: '1.05rem', padding: '16px 24px', background: 'var(--bg-primary)' }}
          />
        </div>

        <div>
          <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> End Time</label>
          <input 
            type="datetime-local" 
            name="endTime" 
            value={formData.endTime} 
            onChange={handleChange} 
            required 
            className="input-field" 
            style={{ fontSize: '1.05rem', padding: '16px 24px', background: 'var(--bg-primary)' }}
          />
        </div>
      </div>

      <div>
        <label className="label-text">Booking Purpose</label>
        <textarea 
          name="purpose" 
          value={formData.purpose} 
          onChange={handleChange} 
          required 
          minLength={5} 
          className="input-field" 
          style={{ minHeight: '120px', resize: 'vertical', fontSize: '1.05rem', padding: '24px', background: 'var(--bg-primary)' }} 
          placeholder="Briefly describe what you'll be using the resource for..."
        />
      </div>

      <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '20px 24px', borderRadius: 'var(--radius)', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <HelpCircle size={24} color="var(--info)" />
        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Conflicts are checked server-side instantly. Staff accounts may require manual approval for certain high-priority resources.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '1.05rem', padding: '18px' }} disabled={loading}>
          <X size={20} /> Cancel
        </button>
        <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: '1.05rem', padding: '18px', background: loading ? 'var(--bg-surface-elevated)' : 'var(--success)', color: loading ? 'var(--text-muted)' : 'var(--bg-surface)' }} disabled={loading}>
          {loading ? (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--success)', animation: 'spin 1s linear infinite' }} />
          ) : (
            <><Send size={20} /> Verify & Request</>
          )}
        </button>
      </div>

    </form>
  );
}
