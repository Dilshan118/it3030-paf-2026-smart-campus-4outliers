import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, AlertTriangle, Search, Check, ChevronDown, Sparkles, ChevronRight, Lightbulb, Clock } from 'lucide-react';
import { getAllResources } from '../../api/resourceApi';
import { triageTicket } from '../../api/ticketApi';

const CATEGORY_LABELS = {
  IT_ISSUE: 'IT Issue',
  SAFETY: 'Safety',
  CLEANING: 'Cleaning',
  FACILITY_DAMAGE: 'Facility Damage',
  EQUIPMENT_MALFUNCTION: 'Equipment Malfunction',
  OTHER: 'Other',
};

const PRIORITY_COLORS = {
  LOW: { bg: 'rgba(16,185,129,0.1)', text: '#059669', border: 'rgba(16,185,129,0.3)' },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.3)' },
  HIGH: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  CRITICAL: { bg: 'rgba(127,29,29,0.15)', text: '#991b1b', border: 'rgba(239,68,68,0.5)' },
};

function TriagePanel({ triage, onApplyCategory, onApplyPriority }) {
  const [showSimilar, setShowSimilar] = useState(false);
  const pc = PRIORITY_COLORS[triage.suggestedPriority] || PRIORITY_COLORS.LOW;
  const confidencePct = Math.round(triage.confidence * 100);

  return (
    <div style={{
      borderRadius: 'var(--radius)',
      border: '1.5px solid rgba(99,102,241,0.35)',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
      overflow: 'hidden',
      animation: 'pageReveal 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={16} color="#6366f1" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Smart Triage Analysis
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.15)', overflow: 'hidden' }}>
            <div style={{ width: `${confidencePct}%`, height: '100%', background: '#6366f1', borderRadius: '2px', transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{confidencePct}% match</span>
        </div>
      </div>

      {/* Suggestions row */}
      <div style={{ padding: '16px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Suggested Category
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {CATEGORY_LABELS[triage.suggestedCategory] || triage.suggestedCategory}
            </span>
            <button
              type="button"
              onClick={() => onApplyCategory(triage.suggestedCategory)}
              style={{
                padding: '3px 10px',
                fontSize: '0.65rem',
                fontWeight: 700,
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '20px',
                background: 'rgba(99,102,241,0.1)',
                color: '#6366f1',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}
            >
              Apply
            </button>
          </div>
        </div>

        <div style={{ width: '1px', height: '36px', background: 'rgba(99,102,241,0.15)' }} />

        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Suggested Priority
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: pc.bg,
              color: pc.text,
              border: `1px solid ${pc.border}`,
            }}>
              {triage.suggestedPriority}
            </span>
            <button
              type="button"
              onClick={() => onApplyPriority(triage.suggestedPriority)}
              style={{
                padding: '3px 10px',
                fontSize: '0.65rem',
                fontWeight: 700,
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '20px',
                background: 'rgba(99,102,241,0.1)',
                color: '#6366f1',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}
            >
              Apply
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { onApplyCategory(triage.suggestedCategory); onApplyPriority(triage.suggestedPriority); }}
          style={{
            padding: '8px 16px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: 'none',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
        >
          <Check size={13} strokeWidth={3} /> Apply All
        </button>
      </div>

      {/* Reasoning */}
      {triage.reasoning && (
        <div style={{ padding: '0 18px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <Lightbulb size={13} color="rgba(99,102,241,0.5)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {triage.reasoning}
          </p>
        </div>
      )}

      {/* Similar resolved tickets */}
      {triage.similarTickets && triage.similarTickets.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <button
            type="button"
            onClick={() => setShowSimilar(v => !v)}
            style={{
              width: '100%',
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <Clock size={13} />
            {triage.similarTickets.length} similar issue{triage.similarTickets.length > 1 ? 's' : ''} previously resolved
            <ChevronRight size={13} style={{ marginLeft: 'auto', transform: showSimilar ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showSimilar && (
            <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {triage.similarTickets.map(ticket => (
                <div key={ticket.id} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>#{ticket.id}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: 'rgba(16,185,129,0.1)', padding: '1px 7px', borderRadius: '10px' }}>RESOLVED</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{ticket.priority}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.45' }}>{ticket.description}</p>
                  {ticket.resolution && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <Check size={11} color="#059669" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#059669', lineHeight: '1.45', fontStyle: 'italic' }}>{ticket.resolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  const [triage, setTriage] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const triageTimerRef = useRef(null);

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

  const runTriage = useCallback(async (description) => {
    const words = description.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      setTriage(null);
      return;
    }
    setTriageLoading(true);
    try {
      const res = await triageTicket(description);
      setTriage(res.data || null);
    } catch {
      setTriage(null);
    } finally {
      setTriageLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (formError) setFormError('');
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'description') {
      clearTimeout(triageTimerRef.current);
      triageTimerRef.current = setTimeout(() => runTriage(value), 800);
    }
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

      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid rgba(42, 20, 180, 0.05)' }}>
        <h3 className="label-text" style={{ marginBottom: '24px', color: 'var(--accent-base)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>1. Issue Classification</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '24px' }}>
          <div>
            <label className="label-text">Select Category</label>
            <div style={{ position: 'relative' }}>
              <select name="category" value={formData.category} onChange={handleChange} required className="input-field" style={{ appearance: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '1.05rem', padding: '16px 20px', background: 'var(--bg-surface)' }}>
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
              <select name="priority" value={formData.priority} onChange={handleChange} required className="input-field" style={{ appearance: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '1.05rem', padding: '16px 20px', background: 'var(--bg-surface)' }}>
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
      </div>

      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid rgba(42, 20, 180, 0.05)' }}>
        <h3 className="label-text" style={{ marginBottom: '24px', color: 'var(--accent-base)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>2. Issue Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Detailed Description
              {triageLoading && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', color: '#6366f1', fontWeight: 600 }}>
                  <div style={{ width: 10, height: 10, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analysing...
                </span>
              )}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              className="input-field"
              style={{ minHeight: '160px', resize: 'vertical', fontSize: '1.05rem', padding: '20px', background: 'var(--bg-surface)' }}
              placeholder="Describe the issue, location, and any actions already taken..."
            />
          </div>

          {triage && !triageLoading && (
            <TriagePanel
              triage={triage}
              onApplyCategory={(cat) => setFormData(prev => ({ ...prev, category: cat }))}
              onApplyPriority={(pri) => setFormData(prev => ({ ...prev, priority: pri }))}
            />
          )}
        </div>
      </div>

      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid rgba(42, 20, 180, 0.05)' }}>
        <h3 className="label-text" style={{ marginBottom: '24px', color: 'var(--accent-base)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>3. Context & Links</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.5fr', gap: '32px', alignItems: 'start' }}>
          <div>
            <label className="label-text">Contact Info</label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              className="input-field"
              style={{ fontSize: '1.05rem', padding: '16px 20px', background: 'var(--bg-surface)' }}
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
                  padding: '16px 20px 16px 52px',
                  background: 'var(--bg-surface)',
                  border: selectedResource ? '2px solid var(--success)' : '2px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                placeholder={selectedResource ? selectedResource.name : "Search resource name or ID..."}
              />
              <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: selectedResource ? 'var(--success)' : 'var(--text-muted)' }}>
                {selectedResource ? <Check size={18} /> : <Search size={18} />}
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
