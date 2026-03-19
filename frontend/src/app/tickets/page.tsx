'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { Clock, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="tickets-page">
        <header className="page-header">
          <div>
            <h1>My Support Tickets</h1>
            <p>Track the status of your queries and responses from our team.</p>
          </div>
          <Link href="/tickets/new" className="new-btn">
            Submit New Ticket
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} color="var(--text-muted)" />
            <h3>No tickets found</h3>
            <p>You haven't submitted any support queries yet.</p>
            <Link href="/tickets/new" className="primary-link">Submit your first ticket</Link>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket: any) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="ticket-item">
                <div className="ticket-main">
                  <div className="ticket-icon">
                    <Clock size={20} color="var(--text-muted)" />
                  </div>
                  <div className="ticket-info">
                    <h3>{ticket.subject}</h3>
                    <p className="ticket-meta">
                      <span>Ref: #{ticket.id.slice(0, 8)}</span>
                      <span className="dot">•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="dot">•</span>
                      <span>{ticket.category}</span>
                    </p>
                  </div>
                </div>

                <div className="ticket-status-group">
                  <div className={`status-pill ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                    {ticket.status}
                  </div>
                  <div className={`priority-pill ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .tickets-page {
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
          font-weight: 700;
        }
        .page-header p {
          color: var(--text-muted);
        }
        .new-btn {
          background-color: var(--primary);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 0.875rem;
        }
        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ticket-item {
          background-color: var(--bg-card);
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.2s, border-color 0.2s;
        }
        .ticket-item:hover {
          transform: translateX(4px);
          border-color: var(--primary);
        }
        .ticket-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex: 1;
        }
        .ticket-icon {
          width: 40px;
          height: 40px;
          background-color: var(--bg-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ticket-info h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .ticket-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dot { font-size: 1rem; }
        .ticket-status-group {
          display: flex;
          align-items: center;
          gap: 1rem;
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

        .priority-pill {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--border);
          border-radius: 4px;
        }
        .priority-pill.high, .priority-pill.critical { color: #ef4444; border-color: #fecaca; }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background-color: var(--bg-card);
          border-radius: var(--radius);
          border: 1.5px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .primary-link {
          color: var(--primary);
          font-weight: 600;
          text-decoration: underline;
        }
        .loading {
          text-align: center;
          padding: 4rem;
          color: var(--text-muted);
        }
      `}</style>
    </DashboardLayout>
  );
}
