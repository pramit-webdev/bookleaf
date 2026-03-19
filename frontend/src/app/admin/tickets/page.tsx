'use client';

import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';
import Link from 'next/link';
import { 
  Filter, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Circle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function AdminTicketQueue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchWithAuth('/tickets/');
        setTickets(data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const priorityOrder: { [key: string]: number } = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

  const filteredTickets = tickets
    .filter((t: any) => {
      return (
        (filter.status === '' || t.status === filter.status) &&
        (filter.priority === '' || t.priority === filter.priority) &&
        (filter.category === '' || t.category === filter.category)
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
            <Filter size={18} />
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
              <option value="">All Categories</option>
              <option value="Royalty & Payments">Royalty & Payments</option>
              <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
              <option value="Printing & Quality">Printing & Quality</option>
              <option value="General Inquiry">General</option>
            </select>
          </div>
        </section>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Author</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="loading-row">Loading queue...</td></tr>
              ) : filteredTickets.map((ticket: any) => (
                <tr key={ticket.id} className="ticket-row">
                  <td className="subject-cell">
                    <Link href={`/admin/tickets/${ticket.id}`} className="subject-link">
                      <strong>{ticket.subject}</strong>
                      <span>#{ticket.id.slice(0, 8)}</span>
                    </Link>
                  </td>
                  <td className="author-cell">
                    <span>{ticket.author?.email || 'Unknown'}</span>
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
                    <span className="age-text">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <Link href={`/admin/tickets/${ticket.id}`} className="action-link">
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
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
          font-size: 1.875rem;
          font-weight: 800;
        }
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
          align-items: center;
          gap: 1.5rem;
          color: var(--text-muted);
        }
        select {
          background: transparent;
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          color: var(--text-main);
        }

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
