'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-muted)'
      }}>
        Loading portal...
      </div>
    );
  }

  return (
    <div className="layout-root">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .layout-root {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-main);
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-height: 100vh;
          overflow-y: auto;
        }
        .page-content {
          padding: 2rem;
          flex: 1;
        }
      `}</style>
    </div>
  );
}
