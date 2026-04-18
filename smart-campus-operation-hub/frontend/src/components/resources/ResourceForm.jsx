import { UploadCloud, X, ImageIcon, Clock } from 'lucide-react';

const TYPE_OPTIONS = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const TYPE_LABELS = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' };

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const formStyles = `
  .rf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .rf-field { display: flex; flex-direction: column; gap: 6px; }
  .rf-label {
    font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted);
    display: flex; align-items: center; gap: 6px;
  }
  .rf-required { color: var(--accent-base); }
  .rf-input {
    width: 100%; padding: 10px 14px;
    background: var(--bg-primary); border: 1.5px solid var(--border-main);
    border-radius: 8px; color: var(--text-main);
    font-family: var(--font-body); font-size: 0.95rem;
    transition: border-color 0.15s, box-shadow 0.15s; outline: none; box-sizing: border-box;
  }
  .rf-input:focus { border-color: var(--accent-base); box-shadow: 0 0 0 3px rgba(204,255,0,0.1); }
  .rf-input::placeholder { color: var(--text-muted); opacity: 0.5; }
  .rf-section-label {
    font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted);
    display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
  }
  .rf-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border-main);
  }
  /* Toggle Switch */
  .rf-toggle { position: relative; width: 38px; height: 22px; flex-shrink: 0; cursor: pointer; }
  .rf-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
  .rf-toggle-track {
    position: absolute; inset: 0; border-radius: 11px;
    background: var(--bg-surface-elevated); border: 1.5px solid var(--border-main);
    transition: all 0.2s ease; cursor: pointer;
  }
  .rf-toggle input:checked + .rf-toggle-track {
    background: var(--accent-base); border-color: var(--accent-base);
  }
  .rf-toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--text-muted); transition: all 0.2s ease;
  }
  .rf-toggle input:checked ~ .rf-toggle-thumb {
    left: 19px; background: var(--bg-primary);
  }
  /* Day row */
  .rf-day-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px; border-radius: 8px;
    transition: background 0.15s; border: 1.5px solid transparent;
  }
  .rf-day-row.active { background: rgba(204,255,0,0.05); border-color: rgba(204,255,0,0.15); }
  .rf-day-row.inactive { background: var(--bg-primary); border-color: var(--border-main); }
  .rf-day-label {
    font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em; width: 36px; flex-shrink: 0;
  }
  .rf-time-input {
    background: var(--bg-surface); border: 1.5px solid var(--border-main);
    border-radius: 6px; color: var(--text-main); padding: 6px 10px;
    font-family: var(--font-mono); font-size: 0.85rem; outline: none;
    colorScheme: dark; transition: border-color 0.15s;
  }
  .rf-time-input:focus { border-color: var(--accent-base); }
  .rf-duration {
    margin-left: auto; font-family: var(--font-mono); font-size: 0.75rem;
    color: var(--accent-base); font-weight: 700; min-width: 36px; text-align: right;
  }
`;

export default function ResourceForm({ form, setForm, onSubmit, onCancel, saving, isEdit }) {
  const getDayData = (day) => {
    try {
      const current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {};
      if (current[day]) {
        const [start, end] = current[day].split('-');
        return { enabled: true, start: start || '08:00', end: end || '18:00' };
      }
    } catch (e) {}
    return { enabled: false, start: '08:00', end: '18:00' };
  };

  const toggleDay = (day, enabled) => {
    let current = {};
    try { current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {}; } catch (e) {}
    if (enabled) current[day] = '08:00-18:00';
    else delete current[day];
    setForm({ ...form, availabilityWindows: Object.keys(current).length > 0 ? JSON.stringify(current) : '' });
  };

  const handleAvailabilityChange = (day, field, value) => {
    let current = {};
    try { current = form.availabilityWindows ? JSON.parse(form.availabilityWindows) : {}; } catch (e) {}
    const dayStr = current[day] || '08:00-18:00';
    let [start, end] = dayStr.split('-');
    if (field === 'start') start = value;
    if (field === 'end') end = value;
    current[day] = `${start}-${end}`;
    setForm({ ...form, availabilityWindows: JSON.stringify(current) });
  };

  const getDuration = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? `${m}m` : ''}`;
  };

  const validateForm = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      alert('Name and Location cannot be empty or just spaces.');
      return;
    }
    if (form.capacity !== '' && (Number(form.capacity) <= 0 || Number(form.capacity) > 5000)) {
      alert('Capacity must be between 1 and 5000.');
      return;
    }
    for (const day of DAYS) {
      const data = getDayData(day.key);
      if (data.enabled) {
        const [sh, sm] = data.start.split(':').map(Number);
        const [eh, em] = data.end.split(':').map(Number);
        if ((eh * 60 + em) - (sh * 60 + sm) <= 0) {
          alert(`Start time must be before end time for ${day.label}.`);
          return;
        }
      }
    }
    onSubmit(e);
  };

  return (
    <>
      <style>{formStyles}</style>
      <form onSubmit={validateForm} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Basic Info ── */}
        <div className="rf-section-label">Basic Information</div>

        <div className="rf-grid">
          <div className="rf-field">
            <label className="rf-label">Name <span className="rf-required">*</span></label>
            <input
              className="rf-input" required minLength={3} maxLength={100}
              placeholder="e.g. Computer Lab C"
              pattern="^(?!\s*$)[a-zA-Z0-9\s_.,()-]+$"
              title="Name cannot be empty or contain unsupported special characters."
              value={form.name}
              onChange={e => {
                const val = e.target.value;
                if (/(.)\1{4,}/.test(val)) return;
                setForm({ ...form, name: val });
              }}
            />
          </div>
          <div className="rf-field">
            <label className="rf-label">Type <span className="rf-required">*</span></label>
            <select className="rf-input" required value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        <div className="rf-grid">
          <div className="rf-field">
            <label className="rf-label">Location <span className="rf-required">*</span></label>
            <input
              className="rf-input" required minLength={2} maxLength={100}
              placeholder="e.g. Block A, Floor 2"
              pattern="^(?!\s*$)[a-zA-Z0-9\s_.,-]+$"
              title="Location must be a valid string without unusual characters."
              value={form.location}
              onChange={e => {
                const val = e.target.value;
                if (/(.)\1{4,}/.test(val)) return;
                setForm({ ...form, location: val });
              }}
            />
          </div>
          <div className="rf-field">
            <label className="rf-label">Capacity</label>
            <input
              className="rf-input" type="number" min={1} max={5000}
              placeholder="Leave blank for equipment"
              value={form.capacity}
              onChange={e => {
                const val = e.target.value;
                if (val !== '' && (Number(val) < 1 || Number(val) > 5000)) return;
                setForm({ ...form, capacity: val });
              }}
            />
          </div>
        </div>

        <div className="rf-field">
          <label className="rf-label">Description</label>
          <textarea
            className="rf-input" rows={3} maxLength={500}
            placeholder="Optional — brief description of this resource…"
            style={{ resize: 'vertical', minHeight: '80px' }}
            value={form.description}
            onChange={e => {
              const val = e.target.value;
              if (/(.)\1{10,}/.test(val)) return;
              setForm({ ...form, description: val });
            }}
          />
        </div>

        {/* ── Images ── */}
        <div className="rf-section-label" style={{ marginTop: '4px' }}>Resource Images</div>

        <div
          style={{
            border: '2px dashed var(--border-main)', borderRadius: '10px',
            padding: '20px', textAlign: 'center',
            background: 'var(--bg-primary)', transition: 'all 0.2s ease',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-base)'; e.currentTarget.style.background = 'rgba(204,255,0,0.04)'; }}
          onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border-main)';
            e.currentTarget.style.background = 'var(--bg-primary)';
            if (e.dataTransfer.files?.length > 0) {
              const newFiles = Array.from(e.dataTransfer.files);
              const validFiles = newFiles.filter(f => f.type !== 'image/webp');
              if (newFiles.length !== validFiles.length) alert('WEBP format is not supported. Please upload JPG or PNG.');
              setForm({ ...form, imageFiles: [...(form.imageFiles || []), ...validFiles] });
            }
          }}
        >
          {((form.imageFiles?.length > 0) || (form.imageUrls?.length > 0)) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {form.imageUrls?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                  {form.imageUrls.map((url, idx) => (
                    <img key={`url-${idx}`} src={`http://localhost:8080${url}`} alt="Resource"
                      style={{ height: '64px', width: '64px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid var(--border-main)' }} />
                  ))}
                </div>
              )}
              {form.imageFiles?.map((file, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-main)' }}>
                  <div style={{ padding: '7px', background: 'rgba(204,255,0,0.1)', borderRadius: '6px', color: 'var(--accent-base)', flexShrink: 0 }}>
                    <ImageIcon size={18} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button type="button" onClick={() => {
                    const f = [...form.imageFiles]; f.splice(i, 1);
                    setForm({ ...form, imageFiles: f });
                  }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label style={{ alignSelf: 'center', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '7px 16px', borderRadius: '6px', border: '1.5px solid var(--border-main)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', transition: 'all 0.15s', background: 'transparent' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-base)'; e.currentTarget.style.color = 'var(--accent-base)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              + Add More Images
              <input type="file" multiple accept="image/jpeg, image/png" style={{ display: 'none' }}
                onChange={e => { if (e.target.files) setForm({ ...form, imageFiles: [...(form.imageFiles || []), ...Array.from(e.target.files)] }); }} />
          </label>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', color: 'var(--text-muted)' }}>
                <UploadCloud size={26} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Drag & drop images, or{' '}
                <label style={{ color: 'var(--accent-base)', cursor: 'pointer', textDecoration: 'underline' }}>
                  browse
                  <input type="file" multiple accept="image/jpeg, image/png" style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files).filter(f => f.type !== 'image/webp');
                        setForm({ ...form, imageFiles: [...(form.imageFiles || []), ...files] });
                      }
                    }} />
                </label>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', opacity: 0.6 }}>JPG or PNG · max 5 MB each</div>
            </>
          )}
        </div>

        {/* ── Availability ── */}
        <div className="rf-section-label" style={{ marginTop: '4px' }}>
          <Clock size={12} style={{ opacity: 0.6 }} /> Availability Windows
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {DAYS.map(day => {
            const data = getDayData(day.key);
            const duration = data.enabled ? getDuration(data.start, data.end) : null;
            return (
              <div key={day.key} className={`rf-day-row ${data.enabled ? 'active' : 'inactive'}`}>
                {/* Toggle */}
                <label className="rf-toggle" title={`Toggle ${day.label}`}>
                  <input type="checkbox" checked={data.enabled} onChange={e => toggleDay(day.key, e.target.checked)} />
                  <div className="rf-toggle-track" />
                  <div className="rf-toggle-thumb" style={{ background: data.enabled ? 'var(--bg-primary)' : 'var(--text-muted)' }} />
                </label>

                {/* Day name */}
                <span className="rf-day-label" style={{ color: data.enabled ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {day.label.slice(0, 3)}
                </span>

                {data.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input type="time" className="rf-time-input" value={data.start}
                      onChange={e => handleAvailabilityChange(day.key, 'start', e.target.value)} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                    <input type="time" className="rf-time-input" value={data.end}
                      onChange={e => handleAvailabilityChange(day.key, 'end', e.target.value)} />
                    {duration && <span className="rf-duration">{duration}</span>}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontStyle: 'italic', flex: 1 }}>
                    Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-main)', marginTop: '4px' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ minWidth: '100px' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Resource'}
          </button>
        </div>
      </form>
    </>
  );
}
