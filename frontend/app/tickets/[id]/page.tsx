'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, User, Send, Calendar, Tag, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, role } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadTicket = async () => {
    try {
      const data = await fetchWithAuth(`/tickets/${id}`);
      setTicket(data);
      // Responses are part of the ticket object or a separate call
      // The backend tickets.py shows internal notes and responses are handled
      // Let's assume there's a response sub-resource or included
      setResponses(data.responses || []);
    } catch (err) {
      console.error('Failed to load ticket', err);
      toast.error('Could not find ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // Poll for updates (real-time feel)
    const interval = setInterval(loadTicket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim()) return;
    setSending(true);

    try {
      await fetchWithAuth(`/tickets/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({ content: newResponse }),
      });
      setNewResponse('');
      loadTicket();
      toast.success('Response sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send response');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <DashboardLayout><div className="loading">Loading ticket...</div></DashboardLayout>;
  if (!ticket) return <DashboardLayout><div className="error">Ticket not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="ticket-detail">
        <div className="detail-header">
          <Link href="/tickets" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Tickets</span>
          </Link>
          <div className="header-main">
            <div className="title-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1>{ticket.subject}</h1>
                {role === 'admin' && (
                  <Link href={`/admin/tickets/${id}`} className="admin-link-btn">
                    <Shield size={16} />
                    <span>View in Admin Portal</span>
                  </Link>
                )}
              </div>
              <div className="meta-row">
                <span className="id">#{ticket.id.slice(0, 8)}</span>
                <span className={`status-pill ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                  {ticket.status}
                </span>
                <span className="priority-tag">
                  <Shield size={14} />
                  {ticket.priority} Priority
                </span>
                <span className="category-tag">
                  <Tag size={14} />
                  {ticket.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="thread-section">
            <div className="messages">
              {/* Original Query */}
              <div className="message original">
                <div className="message-header">
                  <div className="sender">
                    <div className="avatar">
                      <User size={16} />
                    </div>
                    <span>{user?.email} (You)</span>
                  </div>
                  <span className="time">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="message-body">
                  {ticket.description}
                </div>
              </div>

              {/* Responses */}
              {responses.map((res: any) => (
                <div key={res.id} className={`message ${res.is_internal ? 'internal' : ''}`}>
                  <div className="message-header">
                    <div className="sender">
                      <div className="avatar admin">
                        <Shield size={16} />
                      </div>
                      <span>BookLeaf Support</span>
                    </div>
                    <span className="time">{new Date(res.created_at).toLocaleString()}</span>
                  </div>
                  <div className="message-body">
                    {res.content}
                  </div>
                </div>
              ))}
            </div>

            {ticket.status !== 'Closed' && (
              <form onSubmit={handleSendResponse} className="reply-box">
                <textarea
                  placeholder="Type your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={4}
                  required
                />
                <button type="submit" disabled={sending}>
                  <Send size={18} />
                  <span>{sending ? 'Sending...' : 'Send Response'}</span>
                </button>
              </form>
            )}
          </div>

          <aside className="info-sidebar">
            <div className="sidebar-card">
              <h3>Ticket Info</h3>
              <div className="info-row">
                <Calendar size={16} />
                <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <Shield size={16} />
                <span>Priority: {ticket.priority}</span>
              </div>
              {ticket.book && (
                <div className="info-row">
                  <Tag size={16} />
                  <span>Relates to: {ticket.book.title}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .ticket-detail {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          transition: var(--transition);
        }
        .back-link:hover { color: var(--primary); transform: translateX(-4px); }

        .header-main h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .id {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.875rem;
          background: var(--bg-main);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
        }
        .priority-tag, .category-tag {
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .status-pill {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-pill.open { background-color: #fefce8; color: #a16207; border: 1px solid #fef3c7; }
        .status-pill.in-progress { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
        .status-pill.resolved { background-color: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
        .status-pill.closed { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        
        .admin-link-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          transition: var(--transition);
          margin-bottom: 1rem;
        }
        .admin-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          opacity: 0.9;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 3rem;
        }
        .messages {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .message {
          background-color: var(--bg-card);
          padding: 2rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .message:hover { box-shadow: var(--shadow-md); }
        .message.original {
          border-left: 6px solid var(--primary);
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          align-items: center;
        }
        .sender {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .avatar {
          width: 32px;
          height: 32px;
          background-color: var(--bg-main);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .avatar.admin {
          background-color: var(--primary-soft);
          color: var(--primary);
          border-color: var(--primary-soft);
        }
        .time {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .message-body {
          line-height: 1.6;
          white-space: pre-wrap;
          font-size: 1rem;
          color: var(--text-main);
        }
        .reply-box {
          background-color: var(--bg-card);
          padding: 2rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
        }
        textarea {
          width: 100%;
          padding: 1.25rem;
          background-color: var(--bg-main);
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          resize: vertical;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          transition: var(--transition);
        }
        textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
        .reply-box button {
          align-self: flex-end;
          background-color: var(--primary);
          color: white;
          padding: 0.85rem 2rem;
          border-radius: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm);
        }
        .reply-box button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }

        .sidebar-card {
          background-color: var(--bg-card);
          padding: 2rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: sticky;
          top: 2rem;
        }
        .sidebar-card h3 {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 600;
        }
        .info-row :global(svg) { color: var(--text-muted); }
        .loading { text-align: center; padding: 4rem; color: var(--text-muted); font-weight: 600; }
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .header-main h1 {
          font-size: 1.875rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .id {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .priority-tag, .category-tag {
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }
        .status-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
        }
        .status-pill.open { background-color: #fefce8; color: #a16207; }
        .status-pill.in-progress { background-color: #eff6ff; color: #1d4ed8; }
        .status-pill.resolved { background-color: #f0fdf4; color: #15803d; }
        .status-pill.closed { background-color: #f1f5f9; color: #475569; }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }
        .messages {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .message {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .message.original {
          border-left: 4px solid var(--primary);
        }
        .message.internal {
          background-color: #fffbeb;
          border: 1px dashed #fbbf24;
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .sender {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .avatar {
          width: 28px;
          height: 28px;
          background-color: var(--bg-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar.admin {
          background-color: #eff6ff;
          color: var(--primary);
        }
        .time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .message-body {
          line-height: 1.6;
          white-space: pre-wrap;
          font-size: 0.95rem;
        }
        .reply-box {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        textarea {
          width: 100%;
          padding: 1rem;
          background-color: var(--bg-main);
          border: 1.5px solid var(--border);
          border-radius: 0.5rem;
          resize: vertical;
          outline: none;
        }
        textarea:focus { border-color: var(--primary); }
        .reply-box button {
          align-self: flex-end;
          background-color: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-card {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sidebar-card h3 {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-main);
        }
        .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
      `}</style>
    </DashboardLayout>
  );
}
