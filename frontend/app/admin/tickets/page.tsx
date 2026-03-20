'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Filter, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function AdminTicketQueue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ 
    status: '', 
    priority: '', 
    category: '',
    assignee: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const params = new URLSearchParams();
        if (filter.status) params.append('status', filter.status);
        if (filter.category) params.append('category', filter.category);
        if (filter.priority) params.append('priority', filter.priority);
        if (filter.assignee === 'me' && user?.id) params.append('assignee_id', user.id);
        if (filter.fromDate) params.append('from_date', filter.fromDate);
        if (filter.toDate) params.append('to_date', filter.toDate);
        
        const data = await fetchWithAuth(`/tickets/?${params.toString()}`);
        setTickets(data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, [filter]); // Re-fetch when filter changes

  const priorityOrder: { [key: string]: number } = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

  const filteredTickets = tickets
    .filter((t: any) => {
      return (
        (filter.status === '' || t.status === filter.status) &&
        (filter.priority === '' || t.priority === filter.priority) &&
        (filter.category === '' || t.category === filter.category) &&
        (filter.assignee === '' || (filter.assignee === 'me' && t.assignee_id === user?.id) || (filter.assignee === 'unassigned' && !t.assignee_id))
      );
    })
    .sort((a: any, b: any) => {
      // Sort by priority first
      const pA = priorityOrder[a.priority] ?? 99;
      const pB = priorityOrder[b.priority] ?? 99;
      if (pA !== pB) return pA - pB;
      // Then by age (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Circle size={16} color="#eab308" />;
      case 'In Progress': return <Clock size={16} color="#3b82f6" />;
      case 'Resolved': return <CheckCircle2 size={16} color="#22c55e" />;
      case 'Closed': return <XCircle size={16} color="#94a3b8" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-queue">
        <header className="page-header">
          <div>
            <h1>Operations Ticket Queue</h1>
            <p>Manage author queries across all accounts with AI assistance.</p>
          </div>
          <div className="queue-stats">
            <div className="mini-stat">
              <strong>{tickets.filter((t: any) => t.status === 'Open').length}</strong>
              <span>New</span>
            </div>
            <div className="mini-stat">
              <strong>{tickets.filter((t: any) => t.priority === 'High' || t.priority === 'Critical').length}</strong>
              <span>Urgent</span>
            </div>
          </div>
        </header>

        <section className="filters-bar">
          <div className="filter-group">
            <div className="select-wrapper">
              <label>Status</label>
              <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="select-wrapper">
              <label>Priority</label>
              <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="select-wrapper">
              <label>Category</label>
              <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                <option value="">All Categories</option>
                <option value="Royalty & Payments">Royalty & Payments</option>
                <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
                <option value="Printing & Quality">Printing & Quality</option>
                <option value="General Inquiry">General</option>
              </select>
            </div>
            <div className="select-wrapper">
              <label>Assignee</label>
              <select value={filter.assignee} onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}>
                <option value="">Any Assignee</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            <div className="select-wrapper">
              <label>From Date</label>
              <input 
                type="date" 
                value={filter.fromDate} 
                onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
                className="date-input"
              />
            </div>
            <div className="select-wrapper">
              <label>To Date</label>
              <input 
                type="date" 
                value={filter.toDate} 
                onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
                className="date-input"
              />
            </div>
            <button 
              className="reset-btn"
              onClick={() => setFilter({ status: '', priority: '', category: '', assignee: '', fromDate: '', toDate: '' })}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Author</th>
                <th>Assignee</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="loading-row">Loading queue...</td></tr>
              ) : filteredTickets.map((ticket: any) => {
                const ageInDays = (Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24);
                const isUrgent = (ticket.priority === 'Critical' || ticket.priority === 'High') && ticket.status === 'Open';
                const isVeryOld = ageInDays > 2 && ticket.status !== 'Resolved' && ticket.status !== 'Closed';

                return (
                  <tr key={ticket.id} className={`ticket-row ${isUrgent ? 'urgent' : ''} ${isVeryOld ? 'old' : ''}`}>
                    <td className="subject-cell">
                      <Link href={`/admin/tickets/${ticket.id}`} className="subject-link">
                        <div className="subject-wrapper">
                          {isUrgent && <AlertCircle size={14} className="urgent-icon" />}
                          <strong>{ticket.subject}</strong>
                        </div>
                        <span>#{ticket.id.slice(0, 8)}</span>
                      </Link>
                    </td>
                    <td className="author-cell">
                      <span>{ticket.author?.email || 'Unknown'}</span>
                    </td>
                    <td>
                      {ticket.assignee_id ? (
                        <span className="assignee-tag">
                          {ticket.assignee_id === user?.id ? 'You' : 'Agent'}
                        </span>
                      ) : (
                        <span className="unassigned">-</span>
                      )}
                    </td>
                    <td>
                      <span className="category-tag">{ticket.category}</span>
                    </td>
                    <td>
                      <span className={`priority-pill ${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(ticket.status)}
                        <span>{ticket.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`age-text ${isVeryOld ? 'text-red' : ''}`}>
                        {ageInDays < 1 ? 'Today' : `${Math.floor(ageInDays)}d ago`}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/tickets/${ticket.id}`} className="action-link">
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-queue {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .queue-stats {
          display: flex;
          gap: 3rem;
        }
        .mini-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .mini-stat strong { font-size: 1.75rem; color: var(--primary); line-height: 1; margin-bottom: 0.25rem; }
        .mini-stat span { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }

        .filters-bar {
          background-color: var(--bg-card);
          padding: 1.25rem 2rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-muted);
        }
        select {
          background: var(--bg-main);
          border: 1.5px solid var(--border);
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          color: var(--text-main);
          transition: var(--transition);
        }
        select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }

        .queue-table-wrapper {
          background-color: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .queue-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .queue-table th {
          padding: 1.25rem 1.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          font-weight: 800;
          letter-spacing: 0.05em;
          background: var(--bg-main);
        }
        .queue-table td {
          padding: 1.5rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }
        .ticket-row { 
          transition: var(--transition); 
          border-left: 4px solid transparent;
        }
        .ticket-row:hover {
          background-color: var(--primary-soft);
        }
        .ticket-row.urgent { 
          background-color: rgba(239, 68, 68, 0.05); 
          border-left-color: #ef4444;
        }
        .ticket-row.old { 
          background-color: rgba(244, 63, 94, 0.08); 
          border-left-color: #f43f5e;
        }
        .ticket-row.urgent.old {
          background: linear-gradient(to right, rgba(244, 63, 94, 0.08), rgba(239, 68, 68, 0.05));
        }
        
        .subject-wrapper { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
        .urgent-icon { color: #ef4444; animation: pulse 2s infinite; }
        
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .subject-link { display: flex; flex-direction: column; }
        .subject-link strong { color: var(--text-main); font-weight: 700; font-size: 1rem; }
        .subject-link span { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        
        .assignee-tag { background: var(--bg-main); padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; border: 1px solid var(--border); }
        .unassigned { color: var(--text-muted); font-style: italic; }

        .priority-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .priority-pill.critical { background-color: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; animation: pulse-bg 2s infinite; }
        .priority-pill.high { background-color: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .priority-pill.medium { background-color: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
        .priority-pill.low { background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        @keyframes pulse-bg {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .age-text.text-red { color: #ef4444; font-weight: 700; }
        .loading-row { text-align: center; padding: 6rem; color: var(--text-muted); font-weight: 600; }
        .action-link { color: var(--text-muted); transition: var(--transition); }
        .action-link:hover { color: var(--primary); transform: translateX(4px); }
        .queue-stats {
          display: flex;
          gap: 2rem;
        }
        .mini-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .mini-stat strong { font-size: 1.5rem; color: var(--primary); }
        .mini-stat span { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .filters-bar {
          background-color: var(--bg-card);
          padding: 1rem 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .filter-group {
          display: flex;
          align-items: flex-end;
          gap: 1.25rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .select-wrapper label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        select, .date-input {
          background: var(--bg-main);
          border: 1.5px solid var(--border);
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          color: var(--text-main);
          transition: var(--transition);
          min-width: 140px;
        }
        select:focus, .date-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
        .reset-btn {
          background: var(--bg-main);
          border: 1.5px solid var(--border);
          padding: 0.6rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          cursor: pointer;
        }
        .reset-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-soft); }

        .queue-table-wrapper {
          background-color: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .queue-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .queue-table th {
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          font-weight: 600;
        }
        .queue-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
        }
        .ticket-row:hover {
          background-color: var(--bg-main);
        }
        .subject-link {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .subject-link strong { color: var(--text-main); }
        .subject-link span { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        
        .priority-pill {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .priority-pill.critical { background-color: #fef2f2; color: #ef4444; }
        .priority-pill.high { background-color: #fff7ed; color: #ea580c; }
        .priority-pill.medium { background-color: #eff6ff; color: #3b82f6; }
        .priority-pill.low { background-color: #f1f5f9; color: #64748b; }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        .loading-row { text-align: center; padding: 4rem; color: var(--text-muted); }
        .action-link { color: var(--text-muted); }
        .action-link:hover { color: var(--primary); }
      `}</style>
    </DashboardLayout>
  );
}
