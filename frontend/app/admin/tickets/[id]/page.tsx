'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Send, 
  Calendar, 
  Tag, 
  Shield, 
  Edit3, 
  RotateCcw,
  Sparkles,
  MessageSquare,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // States for overrides
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  const loadTicket = async () => {
    try {
      const data = await fetchWithAuth(`/tickets/${id}`);
      setTicket(data);
      setResponses(data.responses || []);
      setStatus(data.status);
      setPriority(data.priority);
      setCategory(data.category);
    } catch (err) {
      toast.error('Could not find ticket.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIDraft = async () => {
    setDraftLoading(true);
    try {
      const data = await fetchWithAuth(`/tickets/${id}/draft`);
      setAiDraft(data.draft);
      setIsEditingDraft(true);
      setNewResponse(data.draft);
    } catch (err) {
      toast.error('Failed to generate AI draft.');
    } finally {
      setDraftLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, priority, category }),
      });
      toast.success('Ticket updated successfully.');
      loadTicket();
    } catch (err) {
      toast.error('Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim()) return;
    setUpdating(true);

    try {
      await fetchWithAuth(`/tickets/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({ content: newResponse }),
      });
      setNewResponse('');
      setIsEditingDraft(false);
      loadTicket();
      toast.success('Response sent to author!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send response');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout><div className="loading">Loading ticket...</div></DashboardLayout>;
  if (!ticket) return <DashboardLayout><div className="error">Ticket not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="admin-ticket-detail">
        <header className="detail-header">
          <Link href="/admin/tickets" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Queue</span>
          </Link>
          <div className="header-actions">
             <h1>{ticket.subject}</h1>
             <p className="author-info">Author: <strong>{ticket.author?.email || ticket.author_id}</strong> • Ref: #{ticket.id.slice(0, 8)}</p>
          </div>
        </header>

        <div className="layout-grid">
          <section className="main-panel">
            <div className="original-query card">
              <div className="card-header">
                <h3>Original Query</h3>
                <span className="time">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              <p className="query-body">{ticket.description}</p>
            </div>

            <div className="conversation card">
              <div className="card-header">
                <h3>Conversation History</h3>
              </div>
              <div className="message-list">
                {responses.map((res: any) => (
                  <div key={res.id} className={`msg ${res.is_internal ? 'internal' : ''}`}>
                    <div className="msg-header">
                      <strong>{res.is_internal ? 'Staff Note' : 'System/Staff'}</strong>
                      <span>{new Date(res.created_at).toLocaleString()}</span>
                    </div>
                    <p>{res.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="response-area card">
              <div className="card-header">
                <h3>Draft Response</h3>
                <button 
                  onClick={fetchAIDraft} 
                  className="ai-btn" 
                  disabled={draftLoading}
                >
                  <Sparkles size={16} />
                  {draftLoading ? 'Generating...' : 'Get AI Draft'}
                </button>
              </div>
              
              <form onSubmit={handleSendResponse} className="response-form">
                <textarea
                  placeholder="Draft your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={8}
                />
                <div className="form-actions">
                   <p className="hint">Responses are visible to authors.</p>
                   <button type="submit" className="send-btn" disabled={updating}>
                     <Send size={18} />
                     <span>Send Response</span>
                   </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="sidebar-panel">
            <div className="management-card card">
               <h3>Ticket Management</h3>
               
               <div className="mgmt-group">
                 <label>Status</label>
                 <select value={status} onChange={(e) => setStatus(e.target.value)}>
                   <option value="Open">Open</option>
                   <option value="In Progress">In Progress</option>
                   <option value="Resolved">Resolved</option>
                   <option value="Closed">Closed</option>
                 </select>
               </div>

               <div className="mgmt-group">
                 <label>Priority (AI Sug: {ticket.priority})</label>
                 <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Critical">Critical</option>
                 </select>
               </div>

               <div className="mgmt-group">
                 <label>Category (AI Sug: {ticket.category})</label>
                 <select value={category} onChange={(e) => setCategory(e.target.value)}>
                   <option value="Royalty & Payments">Royalty & Payments</option>
                   <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
                   <option value="Printing & Quality">Printing & Quality</option>
                   <option value="General Inquiry">General Inquiry</option>
                 </select>
               </div>

               <button className="update-btn" onClick={handleUpdateTicket} disabled={updating}>
                 <RotateCcw size={16} />
                 <span>{updating ? 'Updating...' : 'Save Meta Changes'}</span>
               </button>
            </div>

            <div className="author-sidebar-card card">
               <h3>Author context</h3>
               <div className="info">
                 <p><strong>Email:</strong> {ticket.author?.email}</p>
                 <p><strong>Role:</strong> {ticket.author?.user_metadata?.role || 'Author'}</p>
                 {ticket.book && (
                   <div className="book-context">
                     <p><strong>Related Book:</strong> {ticket.book.title}</p>
                     <p><strong>Total Royalty:</strong> ₹{ticket.book.total_royalty_earned}</p>
                   </div>
                 )}
               </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .admin-ticket-detail {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .detail-header h1 { font-size: 1.5rem; font-weight: 800; }
        .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); margin-bottom: 1rem; }
        .author-info { color: var(--text-muted); font-size: 0.875rem; }

        .layout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
        .card-header h3 { font-size: 0.875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        
        .query-body { line-height: 1.6; white-space: pre-wrap; color: var(--text-main); }
        
        .message-list { display: flex; flex-direction: column; gap: 1rem; }
        .msg { padding: 1rem; border-radius: 0.5rem; background: var(--bg-main); border: 1px solid var(--border); }
        .msg-header { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.5rem; color: var(--text-muted); }
        .msg.internal { background: #fffbeb; border-color: #fbbf24; }

        .ai-btn { background: #eff6ff; color: #2563eb; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 600; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .ai-btn:hover { background: #dbeafe; }

        .response-form textarea { width: 100%; border: 1.5px solid var(--border); border-radius: 0.5rem; padding: 1rem; background: var(--bg-main); outline: none; margin-bottom: 1rem; }
        .form-actions { display: flex; justify-content: space-between; align-items: center; }
        .hint { font-size: 0.75rem; color: var(--text-muted); }
        .send-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }

        .mgmt-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .mgmt-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
        select { width: 100%; padding: 0.6rem; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--bg-main); }
        .update-btn { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--primary); color: var(--primary); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .update-btn:hover { background: #eff6ff; }
        
        .book-context { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); }
        .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
      `}</style>
    </DashboardLayout>
  );
}
