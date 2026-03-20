'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Book, 
  Ticket, 
  LogOut, 
  Settings,
  ShieldAlert,
  BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();

  const authorMenus = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Books', icon: Book, path: '/books' },
    { name: 'Support Tickets', icon: Ticket, path: '/tickets' },
  ];

  const adminMenus = [
    { name: 'Ticket Queue', icon: ShieldAlert, path: '/admin/tickets' },
    { name: 'User Management', icon: Settings, path: '/admin/users' },
  ];

  const currentMenus = role === 'admin' ? adminMenus : authorMenus;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={32} color="var(--primary)" />
        <div className="logo-section">
          <span className="logo-text">BookLeaf</span>
          {role === 'admin' && <span className="logo-subtext">Operations</span>}
        </div>
      </div>

      <nav className="menu-list">
        {currentMenus.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`menu-item ${pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={() => signOut()} className="logout-btn">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .sidebar-header {
          padding: 3rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .logo-section {
          display: flex;
          flex-direction: column;
        }
        .logo-text {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.05em;
          line-height: 1;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-subtext {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }

        .menu-list {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.9rem;
          transition: var(--transition);
          letter-spacing: -0.01em;
        }
        .menu-item:hover {
          background-color: var(--primary-soft);
          color: var(--primary);
          transform: translateX(6px);
        }
        .menu-item.active {
          background-color: var(--primary);
          color: white;
          box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
        }
        .menu-item.active :global(svg) {
          color: white;
          transform: scale(1.1);
        }
        .sidebar-footer {
          padding: 1.5rem;
          margin: 1rem;
          background: var(--bg-main);
          border-radius: 1.25rem;
          border: 1px solid var(--border);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          width: 100%;
          border-radius: 0.85rem;
          color: #ef4444;
          font-weight: 800;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .logout-btn:hover {
          background-color: #fef2f2;
          transform: scale(1.02);
        }
      `}</style>
    </aside>
  );
}
