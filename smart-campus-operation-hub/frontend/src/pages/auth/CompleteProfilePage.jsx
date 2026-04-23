import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Phone, MapPin, BookOpen, GraduationCap, Layers, Briefcase, Lock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { completeProfile } from '../../api/profileApi';

const FACULTIES = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities & Sciences'];

const PROGRAMS_BY_FACULTY = {
  Computing: [
    'BSc (Hons) in Information Technology',
    'BSc (Hons) in Computer Science',
    'BSc (Hons) in Software Engineering',
    'BSc (Hons) in Cyber Security',
    'BSc (Hons) in Data Science',
    'BSc (Hons) in Artificial Intelligence & Machine Learning',
  ],
  Engineering: [
    'BEng (Hons) in Computer Systems & Networking',
    'BEng (Hons) in Electrical & Electronic Engineering',
    'BEng (Hons) in Mechanical Engineering',
    'BEng (Hons) in Civil Engineering',
    'BEng (Hons) in Mechatronics Engineering',
  ],
  Business: [
    'BSc (Hons) in Business Information Systems',
    'BSc (Hons) in Business Management',
    'BSc (Hons) in Marketing Management',
    'BSc (Hons) in Human Resource Management',
    'BSc (Hons) in Finance & Accounting',
  ],
  Architecture: [
    'BSc (Hons) in Architecture & Design',
  ],
  'Humanities & Sciences': [
    'BSc (Hons) in Quantity Surveying',
    'BSc (Hons) in Science',
  ],
};

const DEPARTMENTS = [
  'Information Technology', 'Computing', 'Engineering', 'Business',
  'Architecture', 'Humanities & Sciences', 'Administration', 'Finance',
  'Human Resources', 'Library Services', 'Facilities Management', 'Security',
];

const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2];

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--border-main)',
  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--text-main)', background: 'var(--bg-primary)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const readonlyStyle = {
  ...inputStyle,
  background: 'var(--bg-surface-elevated)',
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
};

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

function AutoIdBadge({ label, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon} {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
        <Lock size={13} color="#9ca3af" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#9ca3af', letterSpacing: '0.05em' }}>
          Will be assigned automatically
        </span>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const isStudent = !user?.role || user?.role === 'USER';
  const isStaff = ['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(user?.role);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    faculty: '',
    specialization: '',
    year: '',
    semester: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === 'faculty') next.specialization = '';
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (isStudent) {
      if (!form.faculty)              e.faculty = 'Faculty is required';
      if (!form.specialization)       e.specialization = 'Degree programme is required';
      if (!form.year)                 e.year = 'Year is required';
      if (!form.semester)             e.semester = 'Semester is required';
    }
    if (isStaff && !form.department)  e.department = 'Department is required';
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
        faculty:         isStudent ? form.faculty         : undefined,
        specialization:  isStudent ? form.specialization  : undefined,
        year:            isStudent ? Number(form.year)    : undefined,
        semester:        isStudent ? Number(form.semester): undefined,
        department:      isStaff   ? form.department      : undefined,
      });
      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      setServerError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.role === 'TECHNICIAN' ? 'Technician'
    : user?.role === 'MANAGER' ? 'Manager'
    : user?.role === 'ADMIN'   ? 'Administrator'
    : 'Student';

  const availablePrograms = PROGRAMS_BY_FACULTY[form.faculty] || [];

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

            {/* Basic info */}
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

            {/* Student fields */}
            {isStudent && (
              <>
                <div style={{ height: '1px', background: 'var(--border-main)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Academic Information
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <AutoIdBadge label="Student ID" icon={<Lock size={12} />} />
                  <Field label="Faculty" icon={<BookOpen size={12} />} error={errors.faculty}>
                    <select style={{ ...inputStyle, borderColor: errors.faculty ? 'var(--danger)' : undefined }} value={form.faculty} onChange={set('faculty')}>
                      <option value="">Select faculty</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Degree Programme" icon={<GraduationCap size={12} />} error={errors.specialization}>
                  <select
                    style={{ ...inputStyle, borderColor: errors.specialization ? 'var(--danger)' : undefined }}
                    value={form.specialization}
                    onChange={set('specialization')}
                    disabled={!form.faculty}
                  >
                    <option value="">{form.faculty ? 'Select degree programme' : 'Select a faculty first'}</option>
                    {availablePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
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

            {/* Staff fields */}
            {isStaff && (
              <>
                <div style={{ height: '1px', background: 'var(--border-main)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Staff Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <AutoIdBadge label="Employee ID" icon={<Lock size={12} />} />
                  <Field label="Department" icon={<Briefcase size={12} />} error={errors.department}>
                    <select style={{ ...inputStyle, borderColor: errors.department ? 'var(--danger)' : undefined }} value={form.department} onChange={set('department')}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ marginTop: '8px', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: saving ? 'var(--text-muted)' : 'var(--accent-gradient)', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Complete Profile & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
