'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Send, AlertCircle } from 'lucide-react';

export default function NewTicket() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    book_id: '',
    subject: '',
    description: '',
  });

  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetchWithAuth('/tickets/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          book_id: formData.book_id || null,
        }),
      });
      toast.success('Ticket submitted successfully! AI is analyzing your request.');
      router.push('/tickets');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="new-ticket">
        <header className="page-header">
          <h1>Submit a Support Query</h1>
          <p>Raise a ticket for your book or account-related issues.</p>
        </header>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="book_id">Related Book</label>
            <select
              id="book_id"
              value={formData.book_id}
              onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
              disabled={loading}
            >
              <option value="">General / Account Level</option>
              {books.map((book: any) => (
                <option key={book.id} value={book.book_id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="Briefly describe the issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              rows={6}
              placeholder="Provide as much detail as possible so our team (and AI) can help you better..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Attachments (Optional)</label>
            <input
              id="file"
              type="file"
              className="file-input"
            />
            <p className="hint">Images or documents to help explain your issue.</p>
          </div>

          <div className="info-box">
            <AlertCircle size={18} />
            <p>Our AI will automatically classify your ticket and prepare a draft for our support team to ensure a faster response.</p>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : (
              <>
                <Send size={18} />
                <span>Submit Query</span>
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .new-ticket {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
        }
        .page-header p {
          color: var(--text-muted);
          font-size: 1.125rem;
        }
        .ticket-form {
          background-color: var(--bg-card);
          padding: 3rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 2rem;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        input, select, textarea {
          padding: 1rem 1.25rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          background-color: var(--bg-main);
          color: var(--text-main);
          font-size: 1rem;
          font-weight: 500;
          transition: var(--transition);
          outline: none;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-soft);
          transform: translateY(-1px);
        }
        .info-box {
          background-color: var(--primary-soft);
          color: var(--primary);
          padding: 1.25rem;
          border-radius: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
          border: 1px solid #dbeafe;
        }
        .submit-btn {
          background-color: var(--primary);
          color: white;
          padding: 1.125rem;
          border-radius: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          transition: var(--transition);
          margin-top: 1rem;
          box-shadow: var(--shadow-md);
          font-size: 1rem;
          letter-spacing: 0.025em;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: -0.25rem; }
      `}</style>
    </DashboardLayout>
  );
}
