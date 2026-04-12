import React, { useState } from 'react';
import { addComment } from '../../api/ticketApi';

export default function CommentThread({ ticketId, initialComments = [], onCommentAdded }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const res = await addComment(ticketId, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      alert('Failed to add comment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '40px' }} className="card">
      <h3 style={{ margin: '0 0 16px 0' }}>Comments</h3>
      <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="no-border-list">
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 8px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                {c.userName} <span style={{ opacity: 0.7, fontWeight: 400 }}>({c.userRole})</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface)', opacity: 0.6 }}>
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--on-surface)', fontSize: '15px', lineHeight: '1.5' }}>{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', padding: '32px 0' }}>No comments yet.</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <input 
          type="text" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add an update or note..."
          className="input-field"
          style={{ flex: 1, backgroundColor: 'var(--surface-container-low)' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 24px' }}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
