import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import BookingForm from '../../components/bookings/BookingForm';
import { ChevronLeft, CalendarPlus, Zap } from 'lucide-react';

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await createBooking(data);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
        <button 
          onClick={() => navigate('/bookings')} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', boxShadow: 'var(--ambient-shadow)', transition: 'all 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--ambient-shadow-hover)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ambient-shadow)'; }}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} /> Facility Module
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1, marginTop: '8px' }}>
            New <span style={{ color: 'var(--text-muted)' }}>Reservation</span>
          </h1>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', paddingBottom: '64px' }}>
          {error && (
            <div style={{ background: 'var(--danger-muted)', color: 'var(--danger)', padding: '16px 24px', borderRadius: 'var(--radius)', marginBottom: '24px', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>!</div>
               {error}
            </div>
          )}
          
          <div className="card" style={{ padding: 'clamp(32px, 5vw, 64px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', paddingBottom: '24px', borderBottom: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--success-muted)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarPlus size={28} strokeWidth={2} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Secure a Slot</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Fill in the details to check conflict logic and reserve campus resources.</p>
              </div>
            </div>

            <BookingForm onSubmit={handleSubmit} onCancel={() => navigate('/bookings')} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
