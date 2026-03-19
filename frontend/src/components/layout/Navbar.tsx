'use client';

import { useAuth } from '../../context/AuthContext';
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
          height: 64px;
          padding: 0 2rem;
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--bg-main);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          width: 300px;
        }
        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 0.875rem;
          width: 100%;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .icon-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        .icon-btn:hover {
          background-color: var(--bg-main);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background-color: var(--bg-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
      `}</style>
    </header>
  );
}
