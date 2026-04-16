import { UploadCloud, X, ImageIcon } from 'lucide-react';

const TYPE_OPTIONS = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const typeLabel = (type) => type.replace('_', ' ');

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' }
];

export default function ResourceForm({ form, setForm, onSubmit, onCancel, saving, isEdit }) {
  const getDayData = (day) => {
    try {
      const current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {};
      if (current[day]) {
        const [start, end] = current[day].split('-');
        return { enabled: true, start: start || "08:00", end: end || "18:00" };
      }
    } catch(e) {}
    return { enabled: false, start: "08:00", end: "18:00" };
  };

  const toggleDay = (day, enabled) => {
    let current = {};
    try { current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {}; } catch(e) {}
    
    if (enabled) {
      current[day] = "08:00-18:00";
    } else {
      delete current[day];
    }
    setForm({ ...form, availabilityWindows: Object.keys(current).length > 0 ? JSON.stringify(current) : '' });
  };

  const handleAvailabilityChange = (day, field, value) => {
    let current = {};
    try { current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {}; } catch(e) {}
    
    const dayStr = current[day] || "08:00-18:00";
    let [start, end] = dayStr.split('-');
    
    if (field === 'start') start = value;
    if (field === 'end') end = value;
    
    current[day] = `${start}-${end}`;
    setForm({ ...form, availabilityWindows: JSON.stringify(current) });
  };

  const validateForm = (e) => {
    e.preventDefault();
    
    // Validate empty or all space strings
    if (!form.name.trim() || !form.location.trim()) {
      alert("Name and Location cannot be empty or just spaces.");
      return;
    }
    
    if (form.capacity !== '' && (Number(form.capacity) <= 0 || Number(form.capacity) > 5000)) {
      alert("Capacity must be between 1 and 5000.");
      return;
    }

    // Validate availability window logical times
    for (const day of Object.values(DAYS)) {
      const data = getDayData(day.key);
      if (data.enabled) {
        const [sh, sm] = data.start.split(':').map(Number);
        const [eh, em] = data.end.split(':').map(Number);
        const mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins <= 0) {
           alert(`Logic Error: Start time must be before end time for ${day.label}.`);
           return;
        }
      }
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={validateForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="label-text">Name *</label>
        <input className="input-field" required minLength={3} maxLength={100}
          pattern="^(?!\s*$)[a-zA-Z0-9\s_.,()-]+$"
          title="Name cannot be empty or contain unsupported special characters, and cannot be a repetitive unusual pattern."
          value={form.name} onChange={e => {
            const val = e.target.value;
            // Prevent unusual patterns like 000000099999999999992222222222
            if (/(.)\1{4,}/.test(val)) return;
            setForm({ ...form, name: val });
          }} />
      </div>
      <div>
        <label className="label-text">Type *</label>
        <select className="input-field" required value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
      </div>
      <div>
        <label className="label-text">Location *</label>
        <input className="input-field" required minLength={2} maxLength={100}
          pattern="^(?!\s*$)[a-zA-Z0-9\s_.,-]+$"
          title="Location must be a valid string without unusual characters."
          value={form.location} onChange={e => {
            const val = e.target.value;
            if (/(.)\1{4,}/.test(val)) return;
            setForm({ ...form, location: val });
          }} />
      </div>
      <div>
        <label className="label-text">Capacity</label>
        <input className="input-field" type="number" min={1} max={5000} placeholder="Leave blank for equipment"
          value={form.capacity} onChange={e => {
            const val = e.target.value;
            if (val !== '' && (Number(val) < 1 || Number(val) > 5000)) return;
            setForm({ ...form, capacity: val });
          }} />
      </div>
      <div>
        <label className="label-text">Description</label>
        <textarea className="input-field" rows={3} maxLength={500}
          value={form.description} onChange={e => {
             const val = e.target.value;
             if (/(.)\1{10,}/.test(val)) return;
             setForm({ ...form, description: val });
          }} />
      </div>

      {/* Modern Image Upload */}
      <div>
        <label className="label-text">Resource Image</label>
        <div 
          style={{ 
            marginTop: '8px', 
            border: '2px dashed var(--border-main)', 
            borderRadius: '8px', 
            padding: '24px', 
            textAlign: 'center',
            background: 'var(--bg-surface-elevated)',
            position: 'relative',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-base)'; e.currentTarget.style.background = 'rgba(204,255,0,0.05)'; }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border-main)';
            e.currentTarget.style.background = 'var(--bg-surface-elevated)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              if (e.dataTransfer.files[0].type === 'image/webp') {
                  alert('WEBP format is not supported. Please upload JPG or PNG.');
                  return;
              }
              setForm({ ...form, imageFile: e.dataTransfer.files[0] });
            }
          }}
        >
          {form.imageFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-main)', width: '100%' }}>
              <div style={{ padding: '8px', background: 'rgba(204,255,0,0.1)', borderRadius: '4px', color: 'var(--accent-base)' }}>
                <ImageIcon size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {form.imageFile.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {(form.imageFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button type="button" onClick={() => setForm({ ...form, imageFile: null })} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>
          ) : form.imageUrl && !form.imageFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
               <img src={`http://localhost:8080${form.imageUrl}`} alt="Current Resource" style={{ height: '80px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} />
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Image</span>
               <label className="btn-secondary" style={{ display: 'inline-flex', cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem', marginTop: '8px' }}>
                 Change Image
                 <input type="file" accept="image/jpeg, image/png" style={{ display: 'none' }}
                   onChange={(e) => { if (e.target.files[0]) setForm({ ...form, imageFile: e.target.files[0] }); }} />
               </label>
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', color: 'var(--text-muted)' }}>
                <UploadCloud size={28} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Drag and drop an image here, or{' '}
                <label style={{ color: 'var(--accent-base)', cursor: 'pointer', textDecoration: 'underline' }}>
                  browse
                  <input type="file" accept="image/jpeg, image/png" style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        if (e.target.files[0].type === 'image/webp') {
                          alert('WEBP format is not supported. Please upload JPG or PNG.');
                          return;
                        }
                        setForm({ ...form, imageFile: e.target.files[0] });
                      }
                    }} />
                </label>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                Supports: JPG, PNG (Max 5MB)
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="label-text">Availability Windows</label>
        <div style={{ marginTop: '8px', border: '1px solid var(--border-main)', padding: '4px' }}>
          {DAYS.map((day, i) => {
            const data = getDayData(day.key);
            return (
              <div
                key={day.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px',
                  borderBottom: i < DAYS.length - 1 ? '1px solid var(--border-main)' : 'none',
                  background: data.enabled ? 'rgba(204,255,0,0.04)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Day Toggle */}
                <div
                  onClick={() => toggleDay(day.key, !data.enabled)}
                  style={{
                    width: '90px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '8px', flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '14px', height: '14px', border: `2px solid ${data.enabled ? 'var(--accent-base)' : 'var(--border-main)'}`,
                    background: data.enabled ? 'var(--accent-base)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.1s ease'
                  }}>
                    {data.enabled && <span style={{ color: 'var(--bg-primary)', fontSize: '10px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: data.enabled ? 'var(--text-main)' : 'var(--text-muted)'
                  }}>
                    {day.label.slice(0, 3)}
                  </span>
                </div>

                {/* Time Range */}
                {data.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input
                      type="time"
                      value={data.start}
                      onChange={e => handleAvailabilityChange(day.key, 'start', e.target.value)}
                      style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border-main)',
                        color: 'var(--text-main)', padding: '4px 8px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none',
                        colorScheme: 'dark'
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>→</span>
                    <input
                      type="time"
                      value={data.end}
                      onChange={e => handleAvailabilityChange(day.key, 'end', e.target.value)}
                      style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border-main)',
                        color: 'var(--text-main)', padding: '4px 8px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none',
                        colorScheme: 'dark'
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginLeft: 'auto' }}>
                      {/* Duration calc */}
                      {(() => {
                        const [sh, sm] = data.start.split(':').map(Number);
                        const [eh, em] = data.end.split(':').map(Number);
                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                        if (mins <= 0) return '';
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        return `${h}h${m > 0 ? ` ${m}m` : ''}`;
                      })()}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
