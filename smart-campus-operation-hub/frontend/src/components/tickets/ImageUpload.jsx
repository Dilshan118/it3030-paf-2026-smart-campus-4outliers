import React, { useState } from 'react';
import { uploadAttachment, deleteAttachment } from '../../api/ticketApi';

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
    if (!window.confirm('Delete attachment?')) return;
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
    <div style={{ marginTop: '20px', textAlign: 'left' }}>
      <h3>Attachments ({attachments.length}/3)</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {attachments.map(att => (
          <div key={att.id} style={{ border: '1px solid #ccc', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--code-bg)' }}>
            <a href={att.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>{att.fileName}</a>
            <button onClick={() => handleDelete(att.id)} disabled={loading} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '2px 6px', fontSize: '10px' }}>x</button>
          </div>
        ))}
      </div>
      {attachments.length < 3 && (
        <div>
          <input type="file" onChange={handleUpload} disabled={loading} accept="image/jpeg,image/png,application/pdf" style={{ fontSize: '12px' }} />
        </div>
      )}
    </div>
  );
}
