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
                <option key={book.id} value={book.id}>
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
          gap: 2rem;
        }
        .page-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .page-header p {
          color: var(--text-muted);
        }
        .ticket-form {
          background-color: var(--bg-card);
          padding: 2.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        input, select, textarea {
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: 0.5rem;
          background-color: var(--bg-main);
          color: var(--text-main);
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
        .info-box {
          background-color: #eff6ff;
          color: #1e40af;
          padding: 1rem;
          border-radius: 0.5rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.875rem;
        }
        .submit-btn {
          background-color: var(--primary);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </DashboardLayout>
  );
}
