import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, LogOut, Eye } from 'lucide-react';
import { useAuth, type Role } from '../hooks/useAuth';

const NAV: Record<Role, { to: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/pipeline', label: 'Pipeline', icon: <Kanban size={18} /> },
    { to: '/admin/contacts', label: 'Contacts', icon: <Users size={18} /> },
  ],
  partner: [
    { to: '/partner/deals', label: 'My Deals', icon: <Kanban size={18} /> },
  ],
  viewer: [
    { to: '/viewer/pipeline', label: 'Pipeline', icon: <Eye size={18} /> },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const links = NAV[user.role] || NAV.viewer;

  return (
    <aside className="w-56 h-screen fixed left-0 top-0 bg-brand-card border-r border-brand-border flex flex-col">
      <div className="p-5 border-b border-brand-border">
        <div className="text-xs font-mono text-brand-accent tracking-widest uppercase">HCI DealFlow</div>
        <div className="text-[11px] text-brand-text-dim mt-1 truncate">{user.email}</div>
        <div className="mt-1 inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-brand-accent-dim text-brand-accent-light">
          {user.role}
        </div>
      </div>

      <nav className="flex-1 py-4">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-brand-text-bright bg-brand-accent-dim border-r-2 border-brand-accent'
                  : 'text-brand-text-dim hover:text-brand-text hover:bg-brand-elevated'
              }`
            }
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-5 py-3 text-sm text-brand-text-dim hover:text-red-400 border-t border-brand-border transition-colors"
      >
        <LogOut size={18} />
        Uitloggen
      </button>
    </aside>
  );
}
