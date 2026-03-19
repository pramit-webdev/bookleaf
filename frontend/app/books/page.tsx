'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Book as BookIcon, ExternalLink, IndianRupee } from 'lucide-react';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchWithAuth('/books/');
        setBooks(data);
      } catch (err) {
        console.error('Failed to load books', err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  return (
    <DashboardLayout>
      <div className="books-page">
        <header className="page-header">
          <div>
            <h1>My Books</h1>
            <p>View and manage your published titles and royalties.</p>
          </div>
        </header>

        {loading ? (
          <div className="loading">Loading your library...</div>
        ) : (
          <div className="books-grid">
            {books.map((book: any) => (
              <div key={book.id} className="book-card">
                <div className="book-header">
                  <div className="book-icon">
                    <BookIcon size={24} color="var(--primary)" />
                  </div>
                  <div className="status-badge" data-status={book.status}>
                    {book.status}
                  </div>
                </div>

                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="isbn">ISBN: {book.isbn || 'Pending'}</p>
                </div>

                <div className="royalty-stats">
                  <div className="stat">
                    <span>Copies Sold</span>
                    <strong>{book.total_copies_sold}</strong>
                  </div>
                  <div className="stat">
                    <span>MRP</span>
                    <strong>{book.mrp ? `₹${book.mrp}` : '-'}</strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Earned</span>
                    <strong className="royalty-value">
                      {book.total_royalty_earned ? `₹${book.total_royalty_earned.toLocaleString()}` : '-'}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Paid</span>
                    <strong className="paid">
                      {book.royalty_paid ? `₹${book.royalty_paid.toLocaleString()}` : '-'}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Pending</span>
                    <strong className="pending">
                      {book.royalty_pending ? `₹${book.royalty_pending.toLocaleString()}` : '-'}
                    </strong>
                  </div>
                </div>

                <div className="book-footer">
                  <div className="metadata">
                    <span>{book.genre}</span>
                    <span className="dot">•</span>
                    <span>{book.publication_date ? new Date(book.publication_date).toLocaleDateString() : 'Pending Release'}</span>
                  </div>
                  <button className="details-btn">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .books-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-header p {
          color: var(--text-muted);
          font-size: 1.125rem;
        }
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        .book-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }
        .book-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .book-icon {
          width: 48px;
          height: 48px;
          background-color: var(--primary-soft);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-badge[data-status^="Published"] { background-color: #f0fdf4; color: #16a34a; }
        .status-badge[data-status^="In Production"] { background-color: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        
        .book-info h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
          color: var(--text-main);
          line-height: 1.2;
        }
        .isbn {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-family: monospace;
          background: var(--bg-main);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }
        .royalty-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1.25rem;
          background-color: var(--bg-main);
          border-radius: 1rem;
          border: 1px solid var(--border);
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .stat span {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat strong {
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
        }
        .royalty-value { color: var(--primary); }
        .paid { color: #16a34a; }
        .pending { color: #ea580c; }
        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .metadata {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dot { font-size: 1rem; }
        .details-btn {
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .details-btn:hover {
          color: var(--primary);
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
