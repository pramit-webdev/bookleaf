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
    <div className={`layout-root theme-${user?.role || 'author'}`}>
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
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 50%);
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-height: 100vh;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        .page-content {
          padding: 3rem;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          transition: var(--transition);
        }
      `}</style>
    </div>
  );
}
