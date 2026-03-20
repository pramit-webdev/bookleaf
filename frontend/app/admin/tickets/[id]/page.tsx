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
  const [isInternal, setIsInternal] = useState(false);
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
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const loadTicket = async () => {
    try {
      const data = await fetchWithAuth(`/tickets/${id}`);
      setTicket(data);
      setResponses(data.responses || []);
      setStatus(data.status);
      setPriority(data.priority);
      setCategory(data.category);
      setAssigneeId(data.assignee_id);
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
      setIsInternal(false);
    } catch (err) {
      toast.error('Failed to generate AI draft.');
    } finally {
      setDraftLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // Real-time polling
    const interval = setInterval(loadTicket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Auto-generate AI draft on first open if no public response exists
  useEffect(() => {
    const hasPublicResponse = responses.some(r => !r.is_internal);
    if (ticket && !newResponse && !hasPublicResponse && ticket.status === 'Open' && !draftLoading) {
      fetchAIDraft();
    }
  }, [ticket?.id, responses.length]);

  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, priority, category, assignee_id: assigneeId }),
      });
      toast.success('Ticket updated successfully.');
      loadTicket();
    } catch (err) {
      toast.error('Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignToMe = async () => {
    setUpdating(true);
    try {
      await fetchWithAuth(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assignee_id: user?.id }),
      });
      toast.success('Ticket assigned to you.');
      loadTicket();
    } catch (err) {
      toast.error('Failed to assign ticket.');
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
        body: JSON.stringify({ 
          content: newResponse,
          is_internal: isInternal 
        }),
      });
      setNewResponse('');
      setIsEditingDraft(false);
      setIsInternal(false);
      loadTicket();
      toast.success(isInternal ? 'Internal note added!' : 'Response sent to author!');
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
                <div className="tab-group">
                  <button 
                    className={`tab ${!isInternal ? 'active' : ''}`} 
                    onClick={() => setIsInternal(false)}
                  >
                    Public Response
                  </button>
                  <button 
                    className={`tab ${isInternal ? 'active internal' : ''}`} 
                    onClick={() => setIsInternal(true)}
                  >
                    Internal Note
                  </button>
                </div>
                <button 
                  onClick={fetchAIDraft} 
                  className="ai-btn" 
                  disabled={draftLoading || isInternal}
                >
                  <Sparkles size={16} />
                  {draftLoading ? 'Generating...' : 'Get AI Draft'}
                </button>
              </div>
              
              <form onSubmit={handleSendResponse} className="response-form">
                <textarea
                  placeholder={isInternal ? "Add a private note for the operations team..." : "Draft your response to the author..."}
                  className={isInternal ? 'internal-textarea' : ''}
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={8}
                />
                <div className="form-actions">
                   <p className="hint">
                     {isInternal 
                       ? "🔒 Internal notes are only visible to the operations team." 
                       : "👋 Public responses are visible to the author."}
                   </p>
                   <button type="submit" className={`send-btn ${isInternal ? 'internal-btn' : ''}`} disabled={updating}>
                     {isInternal ? <Lock size={18} /> : <Send size={18} />}
                     <span>{isInternal ? 'Add Internal Note' : 'Send Response'}</span>
                   </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="sidebar-panel">
            <div className="management-card card">
               <div className="mgmt-header">
                 <h3>Ticket Management</h3>
                 {!assigneeId ? (
                   <button className="assign-btn" onClick={handleAssignToMe} disabled={updating}>
                     Assign to Me
                   </button>
                 ) : assigneeId === user?.id ? (
                   <span className="assigned-badge">Assigned to You</span>
                 ) : (
                   <span className="assigned-badge other">Assigned to Other</span>
                 )}
               </div>
               
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
                 <div className="label-with-badge">
                   <label>Priority</label>
                   {priority === ticket.priority && <span className="ai-badge"><Sparkles size={10} /> AI Classified</span>}
                 </div>
                 <select value={priority} onChange={(e) => setPriority(e.target.value)} className={priority.toLowerCase()}>
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Critical">Critical</option>
                 </select>
               </div>

               <div className="mgmt-group">
                 <div className="label-with-badge">
                   <label>Category</label>
                   {category === ticket.category && <span className="ai-badge"><Sparkles size={10} /> AI Classified</span>}
                 </div>
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

        .ai-btn { background: var(--primary-soft); color: var(--primary); padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .ai-btn:hover:not(:disabled) { background: #e0e7ff; }

        .tab-group { display: flex; gap: 0.5rem; }
        .tab { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; color: var(--text-muted); }
        .tab.active { background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border); }
        .tab.active.internal { background: #fffbeb; color: #92400e; border-color: #fde68a; }

        .response-form textarea { width: 100%; border: 1.5px solid var(--border); border-radius: 0.5rem; padding: 1rem; background: var(--bg-main); outline: none; margin-bottom: 1rem; transition: var(--transition); }
        .response-form textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
        .response-form textarea.internal-textarea { background: #fffdf5; border-color: #fde68a; }
        .response-form textarea.internal-textarea:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }

        .form-actions { display: flex; justify-content: space-between; align-items: center; }
        .hint { font-size: 0.75rem; color: var(--text-muted); }
        .send-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm); }
        .send-btn.internal-btn { background: #f59e0b; }
        .send-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); opacity: 0.9; }

        .mgmt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .assign-btn { font-size: 0.75rem; font-weight: 700; color: var(--primary); background: var(--primary-soft); padding: 0.35rem 0.75rem; border-radius: 6px; }
        .assigned-badge { font-size: 0.75rem; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 0.35rem 0.75rem; border-radius: 6px; }
        .assigned-badge.other { color: var(--text-muted); background: var(--bg-main); }

        .mgmt-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .label-with-badge { display: flex; justify-content: space-between; align-items: center; }
        .mgmt-group label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .ai-badge { font-size: 0.65rem; font-weight: 800; color: var(--primary); background: var(--primary-soft); padding: 0.2rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.25rem; text-transform: uppercase; }
        select { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1.5px solid var(--border); background: var(--bg-main); font-weight: 600; outline: none; transition: var(--transition); }
        select:focus { border-color: var(--primary); }
        select.critical { color: #ef4444; border-color: #fecaca; }
        select.high { color: #ea580c; border-color: #fed7aa; }

        .update-btn { width: 100%; padding: 0.85rem; border-radius: 0.5rem; border: 1.5px solid var(--primary); color: var(--primary); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: var(--transition); }
        .update-btn:hover { background: var(--primary-soft); }
        
        .book-context { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); }
        .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
      `}</style>
    </DashboardLayout>
  );
}
