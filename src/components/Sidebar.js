"use client";

import { signOut, useSession } from "next-auth/react";

export default function Sidebar({ activeView, onViewChange }) {
  const { data: session } = useSession();

  const menuItems = [
    { id: "import", label: "Import & Sync", icon: "⚡" },
    { id: "packs", label: "Starter Packs", icon: "🎁" },
    { id: "subscriptions", label: "My Subscriptions", icon: "📺" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⚡</div>
        <h1>SubSync</h1>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {session && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="sidebar-avatar"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <div className="sidebar-user-name">{session.user?.name}</div>
              <div className="sidebar-user-email">{session.user?.email}</div>
            </div>
          </div>

          <button className="sidebar-signout" onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
