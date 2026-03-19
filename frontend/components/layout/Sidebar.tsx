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
          width: 260px;
          height: 100vh;
          background-color: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }
        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.025em;
        }
        .menu-list {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: var(--text-muted);
          font-weight: 500;
          transition: all 0.2s;
        }
        .menu-item:hover {
          background-color: var(--bg-main);
          color: var(--primary);
        }
        .menu-item.active {
          background-color: var(--bg-main);
          color: var(--primary);
        }
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          width: 100%;
          border-radius: 0.5rem;
          color: #ef4444;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .logout-btn:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </aside>
  );
}
