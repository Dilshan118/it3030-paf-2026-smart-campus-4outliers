import { useState, useContext, useEffect } from 'react';
import { User, Phone, MapPin, BookOpen, GraduationCap, Layers, Briefcase, Hash, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile } from '../../api/profileApi';

const FACULTIES = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities & Sciences'];
const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2];

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--text-main)', background: 'var(--bg-primary)', outline: 'none',
  boxSizing: 'border-box',
};
const readonlyStyle = { ...inputStyle, background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed' };

function Field({ label, icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

  const roleLabel = user?.role === 'TECHNICIAN' ? 'Technician' : user?.role === 'MANAGER' ? 'Manager' : user?.role === 'ADMIN' ? 'Administrator' : 'Student';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
          {roleLabel}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
          My Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--ambient-shadow)', display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '720px' }}>

          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-main)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.6rem', flexShrink: 0 }}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{user?.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.email}</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Full Name" icon={<User size={12} />}>
              <input style={inputStyle} value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Email">
              <input style={readonlyStyle} value={user?.email || ''} readOnly />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Phone Number" icon={<Phone size={12} />}>
              <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" />
            </Field>
            <Field label="Address" icon={<MapPin size={12} />}>
              <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="City, Province" />
            </Field>
          </div>

          {isStudent && (
            <>
              <div style={{ height: '1px', background: 'var(--border-main)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Academic Information</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Student ID" icon={<Hash size={12} />}>
                  <input style={inputStyle} value={form.studentId} onChange={set('studentId')} placeholder="IT22XXXXXX" />
                </Field>
                <Field label="Faculty" icon={<BookOpen size={12} />}>
                  <select style={inputStyle} value={form.faculty} onChange={set('faculty')}>
                    <option value="">Select faculty</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Specialization / Degree Programme" icon={<GraduationCap size={12} />}>
                <input style={inputStyle} value={form.specialization} onChange={set('specialization')} placeholder="e.g. Software Engineering" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Year of Study" icon={<Layers size={12} />}>
                  <select style={inputStyle} value={form.year} onChange={set('year')}>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </Field>
                <Field label="Semester">
                  <select style={inputStyle} value={form.semester} onChange={set('semester')}>
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {isStaff && (
            <>
              <div style={{ height: '1px', background: 'var(--border-main)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Staff Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Staff / Employee ID" icon={<Hash size={12} />}>
                  <input style={inputStyle} value={form.staffId} onChange={set('staffId')} placeholder="EMP-XXXXX" />
                </Field>
                <Field label="Department" icon={<Briefcase size={12} />}>
                  <input style={inputStyle} value={form.department} onChange={set('department')} placeholder="e.g. IT Department" />
                </Field>
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
                <CheckCircle size={14} /> Saved
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
