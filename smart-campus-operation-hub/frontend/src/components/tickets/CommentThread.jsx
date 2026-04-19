import React, { useEffect, useState, useContext } from 'react';
import { addComment, getComments, deleteComment, editComment } from '../../api/ticketApi';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function CommentThread({ ticketId, initialComments = [], onCommentAdded }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        setLoadingComments(true);
        const res = await getComments(ticketId);
        const items = Array.isArray(res.data) ? res.data : [];
        if (isMounted) setComments(items);
      } catch {
        if (isMounted) setComments([]);
      } finally {
        if (isMounted) setLoadingComments(false);
      }
    };

    loadComments();
    return () => { isMounted = false; };
  }, [ticketId]);

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

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(ticketId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleEditSave = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await editComment(ticketId, commentId, { content: editContent });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editContent } : c));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update comment: ' + err.message);
    }
  };

  return (
    <div style={{ marginTop: '40px' }} className="card">
      <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-display)' }}>Communication Log</h3>
      <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loadingComments && <p style={{ opacity: 0.6, textAlign: 'center', padding: '16px 0' }}>Loading comments...</p>}
        {comments.map(c => {
          const canManage = isAdmin || c.authorId === user?.id;
          return (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {c.authorName || `User ${c.authorId || 'System'}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  
                  {canManage && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === c.id ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input 
                    className="input-field" 
                    value={editContent} 
                    onChange={e => setEditContent(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                    autoFocus
                  />
                  <button onClick={() => handleEditSave(c.id)} className="btn-primary" style={{ padding: '8px', borderRadius: '8px' }}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>{c.content}</p>
              )}
            </div>
          );
        })}
        {!loadingComments && comments.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-mono)' }}>No communications logged.</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <input 
          type="text" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Type an update or note..."
          className="input-field"
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 24px' }}>
          {loading ? 'Posting...' : 'Post Communication'}
        </button>
      </form>
    </div>
  );
}
