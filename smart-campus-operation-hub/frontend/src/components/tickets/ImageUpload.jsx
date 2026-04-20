import React, { useState } from 'react';
import { uploadAttachment, deleteAttachment } from '../../api/ticketApi';
import { ImagePlus, X } from 'lucide-react';
import { resolveBackendUrl } from '../../utils/urlUtils';

export default function ImageUpload({ ticketId, attachments = [], onUploadSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (attachments.length >= 3) {
      alert('Maximum 3 attachments allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await uploadAttachment(ticketId, formData);
      if (onUploadSuccess) onUploadSuccess();
      e.target.value = null; // reset
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (aid) => {
    try {
      setLoading(true);
      await deleteAttachment(ticketId, aid);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '40px', textAlign: 'left' }} className="card">
      <h3 style={{ margin: '0 0 16px 0' }}>Attachments <span style={{ opacity: 0.5, fontWeight: 'normal' }}>({attachments.length}/3)</span></h3>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {attachments.map(att => (
          <div key={att.id} style={{ 
            backgroundColor: 'var(--surface-container-low)', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <a href={resolveBackendUrl(att.fileUrl)} target="_blank" rel="noreferrer" style={{ fontSize: '13px', textDecoration: 'none', color: 'var(--primary)', fontWeight: '500' }}>
              {att.fileName}
            </a>
            <button 
              onClick={() => handleDelete(att.id)} 
              disabled={loading} 
              style={{ display: 'flex', alignItems: 'center', color: '#be123c', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.7 }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
      
      {attachments.length < 3 && (
        <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
          <ImagePlus size={18} strokeWidth={1.5} />
          Upload Image/PDF
          <input type="file" onChange={handleUpload} disabled={loading} accept="image/jpeg,image/png,application/pdf" style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}
