'use client';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Book, Ticket, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function AuthorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalRoyalty: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const books = await fetchWithAuth('/books/');
        const tickets = await fetchWithAuth('/tickets/');
        
        const open = tickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress').length;
        const resolved = tickets.filter((t: any) => t.status === 'Resolved' || t.status === 'Closed').length;
        const royalty = books.reduce((acc: number, book: any) => acc + (book.total_royalty_earned || 0), 0);

        setStats({
          totalBooks: books.length,
          openTickets: open,
          resolvedTickets: resolved,
          totalRoyalty: royalty,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="dashboard">
        <header className="welcome">
          <h1>Welcome back, {user?.email?.split('@')[0]}!</h1>
          <p>Here's what's happening with your books and support requests.</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon-wrapper blue">
              <Book size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Books</h3>
              <p className="value">{loading ? '...' : stats.totalBooks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper orange">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Open Tickets</h3>
              <p className="value">{loading ? '...' : stats.openTickets}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper green">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Resolved</h3>
              <p className="value">{loading ? '...' : stats.resolvedTickets}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper purple">
              <Ticket size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Royalty</h3>
              <p className="value">₹{loading ? '...' : stats.totalRoyalty.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <a href="/tickets/new" className="action-card">
              <Ticket size={24} />
              <span>Raise a Query</span>
            </a>
            <a href="/books" className="action-card">
              <Book size={24} />
              <span>View Royalties</span>
            </a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .welcome h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .welcome p {
          color: var(--text-muted);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border: 1px solid var(--border);
        }
        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blue { background-color: #eff6ff; color: #3b82f6; }
        .orange { background-color: #fff7ed; color: #f97316; }
        .green { background-color: #f0fdf4; color: #22c55e; }
        .purple { background-color: #faf5ff; color: #a855f7; }
        
        .stat-content h3 {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .quick-actions h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }
        .actions-grid {
          display: flex;
          gap: 1.5rem;
        }
        .action-card {
          flex: 1;
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .action-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          color: var(--primary);
        }
        .action-card span {
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </DashboardLayout>
  );
}
