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
                    <strong>₹{book.mrp}</strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Earned</span>
                    <strong className="royalty-value">
                      ₹{book.total_royalty_earned.toLocaleString()}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Paid</span>
                    <strong className="paid">
                      ₹{book.royalty_paid.toLocaleString()}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Royalty Pending</span>
                    <strong className="pending">
                      ₹{book.royalty_pending.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="book-footer">
                  <div className="metadata">
                    <span>{book.genre}</span>
                    <span className="dot">•</span>
                    <span>{book.publication_date ? new Date(book.publication_date).toLocaleDateString() : 'In Production'}</span>
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
          font-size: 1.875rem;
          font-weight: 700;
        }
        .page-header p {
          color: var(--text-muted);
        }
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .book-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .book-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .book-icon {
          width: 40px;
          height: 40px;
          background-color: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .status-badge[data-status="Published"] { background-color: #f0fdf4; color: #16a34a; }
        .status-badge[data-status="In Production"] { background-color: #fff7ed; color: #ea580c; }
        
        .book-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--text-main);
        }
        .isbn {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .royalty-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding: 1rem;
          background-color: var(--bg-main);
          border-radius: 0.75rem;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stat span {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
        }
        .stat strong {
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .royalty-value { color: var(--primary); }
        .paid { color: #16a34a; }
        .pending { color: #ea580c; }
        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
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
