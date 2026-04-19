import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById } from '../../api/resourceApi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

const typeLabel = (type) => type?.replace('_', ' ');

const formatAvailability = (jsonString) => {
  if (!jsonString) return null;
  try {
    const windows = JSON.parse(jsonString);
    if (!windows || Object.keys(windows).length === 0) return null;
    
    // Ordered days of the week map
    const dayMap = {
      mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', 
      thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
        {Object.entries(windows).map(([day, time]) => (
          <div key={day} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 12px', background: 'var(--bg-primary)', 
            borderRadius: '6px', border: '1px solid var(--border-main)',
            fontSize: '0.8rem'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {dayMap[day.toLowerCase()] || day}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-base)', fontWeight: 600, fontSize: '0.75rem' }}>
              {time}
            </span>
          </div>
        ))}
      </div>
    );
  } catch (e) {
    return (
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {jsonString}
      </p>
    );
  }
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getResourceById(id);
        setResource(res.data);
      } catch {
        setError('Resource not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="page-container">
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="page-container">
      <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{error}</p>
      <button className="btn-secondary" onClick={() => navigate('/resources')} style={{ marginTop: '16px' }}>
        ← Back to Resources
      </button>
    </div>
  );

  const isActive = resource.status === 'ACTIVE';

  return (
    <div className="page-container">
      {/* Back */}
      <button className="btn-secondary" onClick={() => navigate('/resources')} style={{ marginBottom: '24px' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left — Main Info */}
        <div>
          {/* Image */}
          <div style={{
            width: '100%', height: '280px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-main)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: '4px'
          }}>
            {resource.imageUrls && resource.imageUrls.length > 0
              ? (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {resource.imageUrls.map((url, i) => (
                      <SwiperSlide key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={`http://localhost:8080${url}`} alt={`${resource.name}-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.parentNode.innerHTML = '<span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem;">NO IMAGE AVAILABLE</span>'; }} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )
              : resource.imageUrl 
              ? <img src={`http://localhost:8080${resource.imageUrl}`} alt={resource.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.parentNode.innerHTML = '<span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem;">NO IMAGE AVAILABLE</span>'; }} />
              : <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>NO IMAGE AVAILABLE</span>
            }
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span className="badge" style={{ color: 'var(--info)', borderColor: 'var(--info)' }}>
              {typeLabel(resource.type)}
            </span>
            <span className={`badge ${isActive ? 'status-open' : 'status-closed'}`}>
              {resource.status}
            </span>
          </div>

          <h2 className="h1">{resource.name}</h2>

          {resource.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {resource.description}
            </p>
          )}
        </div>

        {/* Right — Details Card */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Resource Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label-text">Location</label>
                <p style={{ fontFamily: 'var(--font-mono)' }}>{resource.location}</p>
              </div>
              {resource.capacity && (
                <div>
                  <label className="label-text">Capacity</label>
                  <p style={{ fontFamily: 'var(--font-mono)' }}>{resource.capacity} people</p>
                </div>
              )}
              {resource.availabilityWindows && (
                <div>
                  <label className="label-text">Availability</label>
                  {formatAvailability(resource.availabilityWindows)}
                </div>
              )}
              <div>
                <label className="label-text">Added On</label>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {new Date(resource.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Book Button */}
          {isActive ? (
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
            >
              Book This Resource
            </button>
          ) : (
            <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
              <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                This resource is currently out of service
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}