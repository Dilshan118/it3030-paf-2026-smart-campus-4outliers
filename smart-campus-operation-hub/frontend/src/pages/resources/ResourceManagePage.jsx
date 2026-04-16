import { useState, useEffect } from 'react';
import { getAllResources, createResource, updateResource, deleteResource, toggleResourceStatus, uploadResourceImage } from '../../api/resourceApi';
import ResourceForm from '../../components/resources/ResourceForm';

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
      setResources(res.data.content || []);
    } catch { setError('Failed to load.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ name: r.name, type: r.type, capacity: r.capacity || '', location: r.location,
      description: r.description || '', availabilityWindows: r.availabilityWindows || '', imageUrls: r.imageUrls || [], imageFiles: [] });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      delete payload.imageFiles; // Remove from JSON payload

      let savedResource;
      if (editingId) {
         savedResource = await updateResource(editingId, payload);
      } else {
         savedResource = await createResource(payload);
      }

      // Handle Image Upload if selected
      if (form.imageFiles && form.imageFiles.length > 0) {
        const formData = new FormData();
        form.imageFiles.forEach(file => {
          formData.append('file', file);
        });
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
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <h2 className="h1">Manage Resources</h2>
        <button className="btn-primary" onClick={openCreate}>+ Add Resource</button>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading...</p>}

      {/* Table */}
      {!loading && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-main)', background: 'var(--bg-primary)' }}>
                {['Name', 'Type', 'Location', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  No resources yet. Click + Add Resource.
                </td></tr>
              )}
              {resources.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-main)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{r.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge" style={{ color: 'var(--info)', borderColor: 'var(--info)' }}>
                      {typeLabel(r.type)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.location}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {r.capacity ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${r.status === 'ACTIVE' ? 'status-open' : 'status-closed'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleToggle(r.id)}>
                        {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(r.id, r.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '24px' }}>
              {editingId ? 'Edit Resource' : 'Add New Resource'}
            </h3>
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
      )}
    </div>
  );
}