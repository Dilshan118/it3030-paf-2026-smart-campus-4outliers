import React, { useState, useEffect } from 'react';
import { getAllResources, createResource, updateResource, deleteResource, toggleResourceStatus, uploadResourceImage } from '../../api/resourceApi';
import ResourceForm from '../../components/resources/ResourceForm';
import { Plus, Box, Edit2, Trash2, PowerOff, CheckCircle } from 'lucide-react';

const EMPTY_FORM = { name: '', type: 'LAB', capacity: '', location: '', description: '', availabilityWindows: '', imageUrls: [], imageFiles: [] };
const TYPE_OPTIONS = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const typeLabel = (type) => type.replace('_', ' ');

export default function ResourceManagePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllResources(0, 50);
      setResources(res.data?.content || []);
    } catch {
      setError('Failed to load.'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ 
      name: r.name, type: r.type, capacity: r.capacity || '', location: r.location,
      description: r.description || '', availabilityWindows: r.availabilityWindows || '', 
      imageUrls: r.imageUrls || [], imageFiles: [] 
    });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      delete payload.imageFiles;

      let savedResource;
      if (editingId) {
         savedResource = await updateResource(editingId, payload);
      } else {
         savedResource = await createResource(payload);
      }

      if (form.imageFiles && form.imageFiles.length > 0) {
        const formData = new FormData();
        form.imageFiles.forEach(file => formData.append('file', file));
        const resourceId = editingId || savedResource.data.id;
        await uploadResourceImage(resourceId, formData);
      }

      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await deleteResource(id); load(); }
    catch { alert('Delete failed.'); }
  };

  const handleToggle = async (id) => {
    try { await toggleResourceStatus(id); load(); }
    catch { alert('Status toggle failed.'); }
  };

  return (
    <div className="page-container" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .page-header {
          display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px;
        }
        .page-title {
          font-size: clamp(2rem, 4vw, 3rem); font-family: var(--font-display); font-weight: 800; letter-spacing: -0.03em; color: var(--text-main); line-height: 1.1;
        }
        .data-row {
          display: grid; grid-template-columns: minmax(150px, 1.5fr) 150px minmax(150px, 1fr) 100px 100px minmax(140px, auto);
          gap: 16px; padding: 24px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.03);
          transition: background 0.2s;
        }
        .data-row:hover { background: rgba(42, 20, 180, 0.02); }
        .data-row:last-child { border-bottom: none; }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(7, 5, 26, 0.7); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }
        .modal-card {
          width: 100%; max-width: 620px; max-height: 88vh; overflow-y: auto;
          background: var(--bg-surface); border-radius: var(--radius-lg);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
          animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 32px 0;
        }
        .modal-body { padding: 24px 32px 32px; }
        .modal-close-btn {
          background: transparent; border: none; cursor: pointer;
          color: var(--text-muted); padding: 6px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .modal-close-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.06); }
        .modal-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 20px 0 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div className="page-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 700 }}>
            Central Administration
          </div>
          <h1 className="page-title">
            Resource <span style={{ color: 'var(--text-muted)' }}>Registry</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={20} strokeWidth={2} /> New Resource
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px 24px', borderRadius: 'var(--radius)', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>SYS_ERR:</strong> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,0,0,0.05)', borderTopColor: 'var(--accent-base)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : resources.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, minHeight: '400px', background: 'var(--bg-surface)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
               <Box size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Empty Repository</h3>
            <p style={{ color: 'var(--text-muted)' }}>No facility or equipment metadata established.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--ambient-shadow)', overflow: 'hidden' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1.5fr) 150px minmax(150px, 1fr) 100px 100px minmax(140px, auto)', gap: '16px', padding: '16px 24px', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div>Asset Designation</div>
              <div>Category</div>
              <div>Location</div>
              <div>Capacity</div>
              <div>Condition</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {resources.map(r => (
                <div key={r.id} className="data-row">
                  
                  <span style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </span>
                  
                  <div>
                    <span style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--info)', borderRadius: '100px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {typeLabel(r.type)}
                    </span>
                  </div>

                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {r.location}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {r.capacity ?? '—'}
                  </span>

                  <div>
                    <span className={`status-badge status-${r.status === 'ACTIVE' ? 'open' : 'closed'}`} style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                      {r.status}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => openEdit(r)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }} title="Edit Resource" onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit2 size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleToggle(r.id)} style={{ background: 'transparent', border: 'none', color: r.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)', cursor: 'pointer', padding: '6px' }} title={r.status === 'ACTIVE' ? 'Disable Resource' : 'Enable Resource'}>
                      {r.status === 'ACTIVE' ? <PowerOff size={18} strokeWidth={2} /> : <CheckCircle size={18} strokeWidth={2} />}
                    </button>
                    <button onClick={() => handleDelete(r.id, r.name)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px', opacity: 0.6 }} title="Delete Resource" onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}>
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-base)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '6px' }}>
                  {editingId ? 'Edit Resource' : 'New Resource'}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  {editingId ? 'Update Entity Metadata' : 'Provision Hardware/Space'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} title="Close">
                <Plus size={20} strokeWidth={2.5} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            <div className="modal-divider" />
            <div className="modal-body">
              <ResourceForm
                form={form}
                setForm={setForm}
                onSubmit={handleSave}
                onCancel={() => setShowModal(false)}
                saving={saving}
                isEdit={!!editingId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
