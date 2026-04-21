import React, { useState, useEffect, useRef } from 'react';
import { Send, X, AlertTriangle, Search, Check, ChevronDown } from 'lucide-react';
import { getAllResources } from '../../api/resourceApi';

export default function TicketForm({ initialData = {}, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    category: initialData.category || 'IT_ISSUE',
    description: initialData.description || '',
    priority: initialData.priority || 'LOW',
    contactInfo: initialData.contactInfo || '',
    resourceId: initialData.resourceId || ''
  });
  
  const [resources, setResources] = useState([]);
  const [showResourceDropdown, setShowResourceDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await getAllResources(0, 100);
        setResources(res.data?.content || res.data || []);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      }
    }
    fetchResources();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResourceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formError) setFormError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResourceSelect = (resource) => {
    setFormData(prev => ({ ...prev, resourceId: resource.id }));
    setSearchTerm(resource.name);
    setShowResourceDropdown(false);
    if (formError) setFormError('');
  };

  const clearResource = () => {
    setFormData(prev => ({ ...prev, resourceId: '' }));
    setSearchTerm('');
  };

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toString().includes(searchTerm)
  );

  const selectedResource = resources.find(r => r.id === formData.resourceId);

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
              <ChevronDown size={18} />
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
              <ChevronDown size={18} />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.5fr', gap: '32px', alignItems: 'start' }}>
        <div>
          <label className="label-text">Contact Info</label>
          <input 
            type="text" 
            name="contactInfo" 
            value={formData.contactInfo} 
            onChange={handleChange} 
            className="input-field" 
            style={{ fontSize: '1.05rem', padding: '18px 24px', background: 'var(--bg-primary)' }}
            placeholder="Phone or Extension" 
          />
        </div>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <label className="label-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Associated Resource</span>
            {selectedResource ? (
              <span style={{ color: 'var(--success)', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success-muted)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                <Check size={10} strokeWidth={3} /> Verified Link
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(Optional Sync)</span>
            )}
          </label>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={showResourceDropdown ? searchTerm : (selectedResource ? selectedResource.name : '')}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResourceDropdown(true);
              }}
              onFocus={() => {
                setShowResourceDropdown(true);
                setSearchTerm('');
              }}
              className="input-field" 
              style={{ 
                fontSize: '1.05rem', 
                padding: '18px 24px 18px 52px', 
                background: 'var(--bg-primary)',
                border: selectedResource ? '2px solid var(--success)' : '2px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              placeholder={selectedResource ? selectedResource.name : "Search resource name or ID..."} 
            />
            <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: selectedResource ? 'var(--success)' : 'var(--text-muted)' }}>
              {selectedResource ? <Zap size={18} fill="var(--success)" strokeWidth={0} /> : <Search size={18} />}
            </div>
            {(formData.resourceId || searchTerm) && (
              <button 
                type="button" 
                onClick={clearResource}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-surface-elevated)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showResourceDropdown && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              background: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderRadius: '16px', 
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', 
              zIndex: 100, 
              marginTop: '12px', 
              maxHeight: '280px', 
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              animation: 'pageReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
              scrollbarWidth: 'thin'
            }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid var(--accent-muted)', borderTopColor: 'var(--accent-base)', borderRadius: '50%' }} />
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scanning Campus Database...</span>
              </div>
              {filteredResources.length === 0 ? (
                <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Search size={24} opacity={0.2} />
                  <span>No matching assets found in this zone.</span>
                </div>
              ) : (
                filteredResources.map(resource => (
                  <div 
                    key={resource.id} 
                    onClick={() => handleResourceSelect(resource)}
                    style={{ 
                      padding: '16px 20px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: formData.resourceId === resource.id ? 'var(--accent-muted)' : 'transparent',
                      transition: 'all 0.2s',
                      borderBottom: '1px solid rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(42, 20, 180, 0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = formData.resourceId === resource.id ? 'var(--accent-muted)' : 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{resource.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        ID: #{resource.id} • {resource.location}
                      </div>
                    </div>
                    {formData.resourceId === resource.id ? (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Check size={12} color="white" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', opacity: 0.6 }}>{resource.type}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
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
        <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: '1.05rem', padding: '18px', opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
          ) : (
            <><Send size={20} /> {initialData.id ? 'Update Request' : 'Submit Ticket'}</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

