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
    <div style={{ marginTop: '20px' }}>
      <h3>Comments</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg)' }}>
        {comments.map(c => (
          <div key={c.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e4e7', textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-h)' }}>
              {c.userName} ({c.userRole})
            </div>
            <div style={{ fontSize: '12px', color: 'gray', marginBottom: '8px' }}>
              {new Date(c.createdAt).toLocaleString()}
            </div>
            <p style={{ margin: 0, color: 'var(--text)' }}>{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <p style={{ color: 'gray', textAlign: 'center' }}>No comments yet.</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <input 
          type="text" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Type a comment..."
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid gray' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
