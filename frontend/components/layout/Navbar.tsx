'use client';

import { useAuth } from '@/context/AuthContext';
import { User, Bell, Search } from 'lucide-react';

export default function Navbar() {
  const { user, role } = useAuth();

  return (
    <header className="navbar">
      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search for books or tickets..." />
      </div>

      <div className="nav-actions">
        <button className="icon-btn">
          <Bell size={20} color="var(--text-muted)" />
        </button>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.email?.split('@')[0]}</span>
            <span className="user-role">{role === 'admin' ? 'Administrator' : 'Author'}</span>
          </div>
          <div className="avatar">
            <User size={20} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          height: 72px;
          padding: 0 3rem;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--bg-main);
          padding: 0.65rem 1.25rem;
          border-radius: 0.75rem;
          width: 360px;
          border: 1.5px solid var(--border);
          transition: var(--transition);
        }
        .search-bar:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-soft);
          width: 400px;
        }
        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 500;
          width: 100%;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .icon-btn {
          padding: 0.65rem;
          border-radius: 0.75rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
        }
        .icon-btn:hover {
          background-color: var(--bg-main);
          border-color: var(--border);
          transform: translateY(-1px);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding-left: 2rem;
          border-left: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .user-role {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-soft) 0%, #e0e7ff 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .avatar:hover { transform: rotate(5deg) scale(1.05); }
      `}</style>
    </header>
  );
}
