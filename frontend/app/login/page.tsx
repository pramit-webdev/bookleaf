'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Logged in successfully!');
      const role = data.user?.user_metadata.role;
      if (role === 'admin') {
        router.push('/admin/tickets');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand">
          <BookOpen size={48} color="var(--primary)" />
          <h1>BookLeaf</h1>
        </div>
        <p className="subtitle">Sign in to your portal</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="author@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-main);
        }
        .login-card {
          background-color: var(--bg-card);
          padding: 3rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-md);
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .brand h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .subtitle {
          color: var(--text-muted);
          text-align: center;
          margin-top: -1rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        input {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background-color: transparent;
          color: var(--text-main);
          transition: border-color 0.2s;
        }
        input:focus {
          outline: none;
          border-color: var(--primary);
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background-color: var(--primary);
          color: white;
          border-radius: 0.5rem;
          font-weight: 600;
          margin-top: 1rem;
          transition: background-color 0.2s;
        }
        button:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
