import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourceRecommendations } from '../../api/resourceApi';
import { Zap, Search, MapPin, Users, LayoutGrid, Star, ChevronRight, AlertTriangle, Info } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: '',             label: 'Any Type' },
  { value: 'LAB',          label: 'Laboratory' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT',    label: 'Equipment' },
];

const TYPE_META = {
  LAB:           { label: 'Lab',           color: '#10b981' },
  LECTURE_HALL:  { label: 'Lecture Hall',  color: '#3b82f6' },
  MEETING_ROOM:  { label: 'Meeting Room',  color: '#8b5cf6' },
  EQUIPMENT:     { label: 'Equipment',     color: '#f59e0b' },
};

const SCORE_FACTORS = [
  { label: 'Capacity Fit',    weight: 35, desc: 'How well the room size matches your needs' },
  { label: 'Health Status',   weight: 25, desc: 'Operational condition and recent maintenance' },
  { label: 'Resource Maturity', weight: 25, desc: 'Proven track record and usage history' },
  { label: 'Location Match',  weight: 15, desc: 'Proximity to your preferred area' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(s) {
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Poor';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QueryForm({ form, setForm, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit}>
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 160px 1fr auto',
        gap: '12px', alignItems: 'end',
      }}>
        {/* Type */}
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <LayoutGrid size={12} /> Resource Type
          </label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            style={{
              width: '100%', padding: '11px 14px',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-main)',
              color: form.type ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
              cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}
          >
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Users size={12} /> Capacity
          </label>
          <input
            type="number" min={1} max={5000} placeholder="e.g. 30"
            value={form.requiredCapacity}
            onChange={e => setForm(f => ({ ...f, requiredCapacity: e.target.value }))}
            style={{
              width: '100%', padding: '11px 14px', boxSizing: 'border-box',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-main)',
              color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Location */}
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MapPin size={12} /> Preferred Location
          </label>
          <input
            type="text" placeholder="e.g. Block A, Floor 2"
            value={form.preferredLocation}
            onChange={e => setForm(f => ({ ...f, preferredLocation: e.target.value }))}
            style={{
              width: '100%', padding: '11px 14px', boxSizing: 'border-box',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-main)',
              color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="btn-primary"
          style={{ height: '44px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}
        >
          <Search size={16} />
          {loading ? 'Analyzing…' : 'Find Matches'}
        </button>
      </div>
    </form>
  );
}

function ScoreBar({ score }) {
  const color = scoreColor(score);
  return (
    <div style={{ height: '4px', background: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{
        position: 'absolute', inset: '0 auto 0 0',
        width: `${score}%`, background: color,
        transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

function ResultCard({ result, onView }) {
  const { resource, score, reasons } = result;
  const typeMeta = TYPE_META[resource.type] || { label: resource.type, color: 'var(--accent-base)' };
  const sc = scoreColor(score);
  const sl = scoreLabel(score);

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius)',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = sc; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--ambient-shadow-hover)'; }}
      onMouseOut={e =>  { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Score strip at top */}
      <div style={{ height: '3px', background: sc }} />

      <div style={{ padding: '22px 22px 0' }}>
        {/* Score + label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 900, color: sc, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: sc, fontWeight: 700, marginTop: '3px' }}>
              {sl} Match
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', padding: '4px 10px',
              background: `${typeMeta.color}18`, color: typeMeta.color,
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {typeMeta.label}
            </span>
            <div style={{ marginTop: '6px' }}>
              <span style={{
                display: 'inline-block', padding: '3px 8px',
                background: resource.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: resource.status === 'ACTIVE' ? '#10b981' : 'var(--danger)',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {resource.status}
              </span>
            </div>
          </div>
        </div>

        <ScoreBar score={score} />

        {/* Resource name */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '16px', lineHeight: 1.2 }}>
          {resource.name}
        </div>

        {/* Location & capacity */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
            <MapPin size={11} /> {resource.location || '—'}
          </div>
          {resource.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <Users size={11} /> {resource.capacity} seats
            </div>
          )}
        </div>

        {/* Reason tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
          {reasons.map((r, i) => (
            <span key={i} style={{
              display: 'inline-block', padding: '4px 9px',
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-main)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem', letterSpacing: '0.03em', lineHeight: 1.4,
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ marginTop: 'auto', padding: '16px 22px', borderTop: '1px solid var(--border-main)', display: 'flex', gap: '8px', marginTop: '18px' }}>
        <button
          onClick={() => onView(resource.id)}
          style={{
            flex: 1, padding: '9px', background: 'transparent',
            border: '1.5px solid var(--border-main)', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--text-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
          onMouseOut={e =>  { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          View Details <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function ScoringGuide() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <Info size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          How Smart Scoring Works
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {SCORE_FACTORS.map((f, i) => {
          const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
          return (
            <div key={f.label} style={{ borderLeft: `3px solid ${colors[i]}`, paddingLeft: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)' }}>
                  {f.label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 900, color: colors[i] }}>
                  {f.weight}
                </span>
              </div>
              <div style={{ height: '3px', background: 'var(--bg-surface-elevated)', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${f.weight}%`, background: colors[i] }} />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { type: '', requiredCapacity: '', preferredLocation: '' };

export default function ResourceFinderPage() {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [results, setResults] = useState(null);  // null = not yet searched
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      type: form.type || null,
      requiredCapacity: form.requiredCapacity ? parseInt(form.requiredCapacity, 10) : null,
      preferredLocation: form.preferredLocation || null,
    };

    try {
      const res = await getResourceRecommendations(payload);
      setResults(res.data);
    } catch {
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={12} /> AI-Assisted · Facilities &amp; Assets
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
          Smart <span style={{ color: 'var(--text-muted)' }}>Resource Finder</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '12px', letterSpacing: '0.05em' }}>
          // describe your requirements — the engine scores and ranks all active resources
        </p>
      </div>

      {/* ── Query Panel ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)', padding: '24px', marginBottom: '28px', borderRadius: 'var(--radius)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={11} /> Requirements
          <span style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
          <span style={{ opacity: 0.5 }}>All fields optional</span>
        </div>
        <QueryForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* ── Results ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '16px', border: '1px dashed var(--border-main)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
          <Zap size={28} color="var(--accent-base)" strokeWidth={1.5} />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem', letterSpacing: '0.12em' }}>
            // analysing {form.type ? TYPE_OPTIONS.find(o => o.value === form.type)?.label : 'all resources'}…
          </span>
        </div>
      )}

      {error && !loading && (
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontSize: '0.88rem', padding: '24px', border: '1px solid var(--danger)', background: 'rgba(255,51,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {results !== null && !loading && !error && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              Top Matches
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-base)' }}>
              {results.length}
            </span>
            <span style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
            <button
              onClick={() => { setResults(null); setForm(EMPTY_FORM); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', border: '1px dashed var(--border-main)', borderRadius: 'var(--radius)', gap: '12px' }}>
              <AlertTriangle size={24} color="var(--text-muted)" strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No active resources match your criteria.
              </span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {results.map((r) => (
                <ResultCard key={r.resource.id} result={r} onView={(id) => navigate(`/resources/${id}`)} />
              ))}
            </div>
          )}
        </>
      )}

      {results === null && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: '1px dashed var(--border-main)', borderRadius: 'var(--radius)', gap: '14px' }}>
          <Search size={28} color="var(--text-muted)" strokeWidth={1.2} />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            Set your requirements above and click Find Matches
          </span>
        </div>
      )}

      {/* ── Scoring Guide ── */}
      <ScoringGuide />

    </div>
  );
}
