import { useState, useContext, useEffect } from 'react';
import {
  User, Phone, MapPin, BookOpen, GraduationCap, Layers,
  Briefcase, Hash, CheckCircle, Shield, Mail, Edit3, Save
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile } from '../../api/profileApi';

const FACULTIES = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities & Sciences'];
const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2];

const ROLE_META = {
  ADMIN:      { label: 'Administrator', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
  MANAGER:    { label: 'Manager',       color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  TECHNICIAN: { label: 'Technician',    color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  USER:       { label: 'Student',       color: '#059669', bg: 'rgba(5,150,105,0.12)' },
};

function Field({ label, icon, children, span2 = false }) {
  return (
    <div style={{ gridColumn: span2 ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useContext(AuthContext);
  const isStudent = !user?.role || user?.role === 'USER';
  const isStaff = ['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(user?.role);
  const roleMeta = ROLE_META[user?.role] || ROLE_META.USER;

  const [form, setForm] = useState({
    name: '', phone: '', address: '', studentId: '', faculty: '',
    specialization: '', year: '', semester: '', staffId: '', department: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        studentId: user.studentId || '',
        faculty: user.faculty || '',
        specialization: user.specialization || '',
        year: user.year || '',
        semester: user.semester || '',
        staffId: user.staffId || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
        studentId: isStudent ? form.studentId : undefined,
        faculty: isStudent ? form.faculty : undefined,
        specialization: isStudent ? form.specialization : undefined,
        year: isStudent && form.year ? Number(form.year) : undefined,
        semester: isStudent && form.semester ? Number(form.semester) : undefined,
        staffId: isStaff ? form.staffId : undefined,
        department: isStaff ? form.department : undefined,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid var(--border-main)',
    borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.92rem',
    color: 'var(--text-main)', background: 'var(--bg-primary)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const readonlyStyle = {
    ...inputStyle, background: 'var(--bg-surface-elevated)',
    color: 'var(--text-muted)', cursor: 'not-allowed', border: '1.5px solid transparent',
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      <style>{`
        .profile-input:focus {
          border-color: var(--accent-base) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
        .profile-section-card {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--ambient-shadow);
          border: 1px solid rgba(0,0,0,0.04);
          transition: box-shadow 0.3s ease;
        }
        .profile-section-card:hover {
          box-shadow: var(--ambient-shadow-hover);
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .profile-animate { animation: fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .profile-animate-1 { animation-delay: 0.05s; }
        .profile-animate-2 { animation-delay: 0.12s; }
        .profile-animate-3 { animation-delay: 0.19s; }
      `}</style>

      {/* ── Hero Header ── */}
      <div className="profile-animate" style={{
        background: 'var(--accent-base)',
        backgroundImage: 'radial-gradient(circle at 100% 0%, #4d3fcb 0%, transparent 60%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(32px, 4vw, 48px)',
        position: 'relative', overflow: 'hidden', marginBottom: '28px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '2.5px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontFamily: 'var(--font-display)',
            fontSize: '1.7rem', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                color: 'white', margin: 0, letterSpacing: '-0.02em',
              }}>
                {user?.name || 'Authorized User'}
              </h1>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                padding: '3px 10px', borderRadius: '100px',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {roleMeta.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>
              <Mail size={13} />
              {user?.email}
            </div>
          </div>

          {/* Edit badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px',
            padding: '10px 18px', color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <Edit3 size={13} /> Edit Profile
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {error && (
          <div style={{
            padding: '14px 18px', borderRadius: 'var(--radius)',
            background: 'var(--danger-muted)', color: 'var(--danger)',
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* ── Personal Information ── */}
        <div className="profile-section-card profile-animate profile-animate-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={15} color="var(--accent-base)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Personal Information
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>Your basic identity details</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Field label="Full Name" icon={<User size={11} />}>
              <input className="profile-input" style={inputStyle} value={form.name} onChange={set('name')} placeholder="Your full name" />
            </Field>
            <Field label="Email Address" icon={<Mail size={11} />}>
              <input style={readonlyStyle} value={user?.email || ''} readOnly />
            </Field>
            <Field label="Phone Number" icon={<Phone size={11} />}>
              <input className="profile-input" style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" />
            </Field>
            <Field label="Address" icon={<MapPin size={11} />}>
              <input className="profile-input" style={inputStyle} value={form.address} onChange={set('address')} placeholder="City, Province" />
            </Field>
          </div>
        </div>

        {/* ── Academic Information (students) ── */}
        {isStudent && (
          <div className="profile-section-card profile-animate profile-animate-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap size={15} color="#059669" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Academic Information
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>Your university enrolment details</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Field label="Student ID" icon={<Hash size={11} />}>
                <input className="profile-input" style={inputStyle} value={form.studentId} onChange={set('studentId')} placeholder="IT22XXXXXX" />
              </Field>
              <Field label="Faculty" icon={<BookOpen size={11} />}>
                <select className="profile-input" style={inputStyle} value={form.faculty} onChange={set('faculty')}>
                  <option value="">Select faculty</option>
                  {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Specialization / Degree Programme" icon={<GraduationCap size={11} />} span2>
                <input className="profile-input" style={inputStyle} value={form.specialization} onChange={set('specialization')} placeholder="e.g. Software Engineering" />
              </Field>
              <Field label="Year of Study" icon={<Layers size={11} />}>
                <select className="profile-input" style={inputStyle} value={form.year} onChange={set('year')}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </Field>
              <Field label="Semester" icon={<Layers size={11} />}>
                <select className="profile-input" style={inputStyle} value={form.semester} onChange={set('semester')}>
                  <option value="">Select semester</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ── Staff Information ── */}
        {isStaff && (
          <div className="profile-section-card profile-animate profile-animate-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={15} color="#0891b2" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Staff Information
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>Your employment & department details</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Field label="Staff / Employee ID" icon={<Hash size={11} />}>
                <input className="profile-input" style={inputStyle} value={form.staffId} onChange={set('staffId')} placeholder="EMP-XXXXX" />
              </Field>
              <Field label="Department" icon={<Briefcase size={11} />}>
                <input className="profile-input" style={inputStyle} value={form.department} onChange={set('department')} placeholder="e.g. IT Department" />
              </Field>
            </div>
          </div>
        )}

        {/* ── Save Bar ── */}
        <div className="profile-section-card profile-animate profile-animate-3" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', padding: '20px 32px',
        }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Changes are saved to your account immediately.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saved && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'var(--success)', fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <CheckCircle size={14} /> Saved
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.65 : 1, padding: '12px 24px' }}
            >
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
