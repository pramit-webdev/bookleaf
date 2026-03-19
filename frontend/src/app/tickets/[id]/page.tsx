'use client';

import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, User, Send, Calendar, Tag, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
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
    const interval = setInterval(loadTicket, 10000);
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
              <h1>{ticket.subject}</h1>
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
              {ticket.book_id && (
                <div className="info-row">
                  <Tag size={16} />
                  <span>Topic: Book Related</span>
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
          gap: 2rem;
        }
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
