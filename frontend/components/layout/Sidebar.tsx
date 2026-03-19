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
        <span className="logo-text">BookLeaf</span>
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
          background-color: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          box-shadow: var(--shadow-sm);
        }
        .sidebar-header {
          padding: 2.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .menu-list {
          flex: 1;
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .menu-item:hover {
          background-color: var(--bg-main);
          color: var(--primary);
          transform: translateX(4px);
        }
        .menu-item.active {
          background-color: var(--primary-soft);
          color: var(--primary);
          box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.1);
        }
        .menu-item.active :global(svg) {
          transform: scale(1.1);
          color: var(--primary);
        }
        .sidebar-footer {
          padding: 2rem;
          border-top: 1px solid var(--border);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          width: 100%;
          border-radius: 0.75rem;
          color: #ef4444;
          font-weight: 700;
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .logout-btn:hover {
          background-color: #fef2f2;
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </aside>
  );
}
