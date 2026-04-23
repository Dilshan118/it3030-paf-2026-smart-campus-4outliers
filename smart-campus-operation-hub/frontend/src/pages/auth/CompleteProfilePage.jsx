import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Phone, MapPin, BookOpen, GraduationCap, Layers, Briefcase, Hash } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { completeProfile } from '../../api/profileApi';

const FACULTIES = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities & Sciences'];
const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2];

function Field({ label, icon, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon} {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.76rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--text-main)', background: 'var(--bg-primary)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const readonlyStyle = { ...inputStyle, background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed' };

export default function CompleteProfilePage() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const isStudent = !user?.role || user?.role === 'USER';
  const isStaff = ['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(user?.role);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    studentId: '',
    faculty: '',
    specialization: '',
    year: '',
    semester: '',
    staffId: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (isStudent) {
      if (!form.studentId.trim()) e.studentId = 'Student ID is required';
      if (!form.faculty) e.faculty = 'Faculty is required';
      if (!form.specialization.trim()) e.specialization = 'Specialization is required';
      if (!form.year) e.year = 'Year is required';
      if (!form.semester) e.semester = 'Semester is required';
    }
    if (isStaff) {
      if (!form.department.trim()) e.department = 'Department is required';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setServerError('');
    try {
      await completeProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
        studentId: isStudent ? form.studentId : undefined,
        faculty: isStudent ? form.faculty : undefined,
        specialization: isStudent ? form.specialization : undefined,
        year: isStudent ? Number(form.year) : undefined,
        semester: isStudent ? Number(form.semester) : undefined,
        staffId: isStaff ? form.staffId : undefined,
        department: isStaff ? form.department : undefined,
      });
      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      setServerError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.role === 'TECHNICIAN' ? 'Technician' : user?.role === 'MANAGER' ? 'Manager' : user?.role === 'ADMIN' ? 'Administrator' : 'Student';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Building2 size={28} color="white" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
            {roleLabel} Profile
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: '0 0 10px' }}>
            Complete Your <span style={{ color: 'var(--text-muted)' }}>Profile</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            This helps us personalise your experience and track your requests.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--ambient-shadow)', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {serverError && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                {serverError}
              </div>
            )}

            {/* Auto-filled read-only */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Full Name" icon={<User size={12} />}>
                <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Your full name" />
              </Field>
              <Field label="Email">
                <input style={readonlyStyle} value={user?.email || ''} readOnly />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Phone Number" icon={<Phone size={12} />} error={errors.phone}>
                <input style={{ ...inputStyle, borderColor: errors.phone ? 'var(--danger)' : undefined }} value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" />
              </Field>
              <Field label="Address" icon={<MapPin size={12} />}>
                <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="City, Province" />
              </Field>
            </div>

            {/* Student-specific fields */}
            {isStudent && (
              <>
                <div style={{ height: '1px', background: 'var(--border-main)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Academic Information
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Student ID" icon={<Hash size={12} />} error={errors.studentId}>
                    <input style={{ ...inputStyle, borderColor: errors.studentId ? 'var(--danger)' : undefined }} value={form.studentId} onChange={set('studentId')} placeholder="IT22XXXXXX" />
                  </Field>
                  <Field label="Faculty" icon={<BookOpen size={12} />} error={errors.faculty}>
                    <select style={{ ...inputStyle, borderColor: errors.faculty ? 'var(--danger)' : undefined }} value={form.faculty} onChange={set('faculty')}>
                      <option value="">Select faculty</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Specialization / Degree Programme" icon={<GraduationCap size={12} />} error={errors.specialization}>
                  <input style={{ ...inputStyle, borderColor: errors.specialization ? 'var(--danger)' : undefined }} value={form.specialization} onChange={set('specialization')} placeholder="e.g. Software Engineering" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Year of Study" icon={<Layers size={12} />} error={errors.year}>
                    <select style={{ ...inputStyle, borderColor: errors.year ? 'var(--danger)' : undefined }} value={form.year} onChange={set('year')}>
                      <option value="">Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </Field>
                  <Field label="Semester" error={errors.semester}>
                    <select style={{ ...inputStyle, borderColor: errors.semester ? 'var(--danger)' : undefined }} value={form.semester} onChange={set('semester')}>
                      <option value="">Select semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}

            {/* Staff-specific fields */}
            {isStaff && (
              <>
                <div style={{ height: '1px', background: 'var(--border-main)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Staff Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Staff / Employee ID" icon={<Hash size={12} />}>
                    <input style={inputStyle} value={form.staffId} onChange={set('staffId')} placeholder="EMP-XXXXX" />
                  </Field>
                  <Field label="Department" icon={<Briefcase size={12} />} error={errors.department}>
                    <input style={{ ...inputStyle, borderColor: errors.department ? 'var(--danger)' : undefined }} value={form.department} onChange={set('department')} placeholder="e.g. IT Department" />
                  </Field>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ marginTop: '8px', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: saving ? 'var(--text-muted)' : 'var(--accent-gradient)', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: saving ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
            >
              {saving ? 'Saving...' : 'Complete Profile & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
