import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navConfig } from '../config/navConfig';
import Icon from './Icon';
import logo from '../assets/logo.jpg';

const navIcons = {
  Dashboard: 'grid',
  Appointments: 'calendar',
  Patients: 'users',
  Doctors: 'users',
  'Medical Records': 'fileText',
  Prescriptions: 'pill',
  'Lab Results': 'flask',
  'Lab Requests': 'flask',
  'Create Staff': 'users',
};

const avatarColors = ['#dc2626', '#7c3aed', '#059669', '#2563eb', '#db2777', '#d97706'];

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = navConfig[user.role] || [];
  const displayName = user.email.split('@')[0];
  const initials = displayName.charAt(0).toUpperCase();
  const avatarColor = colorForName(user.email);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const currentLink = links.find((l) => l.path === location.pathname);

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-logo">
          <div className="shell-logo-icon">
            <img src={logo} alt="SCMS logo" className="shell-logo-img" />
          </div>
          <div>
            <div className="shell-logo-title">SCMS</div>
            <div className="shell-logo-sub">SMART CLINIC</div>
          </div>
        </div>

        <nav className="shell-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`shell-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <Icon name={navIcons[link.label] || 'fileText'} size={17} strokeWidth={2} />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="shell-body">
        <header className="shell-topbar">
          <div className="shell-topbar-title">{currentLink?.label || 'Dashboard'}</div>

          <div className="shell-topbar-right">
            <span className="shell-topbar-date">{today}</span>
            <button className="shell-icon-btn">
              <Icon name="bell" size={19} strokeWidth={1.8} />
            </button>

            <div className="shell-user-menu">
              <button className="shell-user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="shell-user-avatar" style={{ background: avatarColor }}>
                  {initials}
                </div>
                <div className="shell-user-text">
                  <div className="shell-user-name">{displayName}</div>
                  <div className="shell-user-role">{user.role}</div>
                </div>
                <Icon name="chevronDown" size={15} strokeWidth={2} />
              </button>

              {menuOpen && (
                <div className="shell-user-dropdown">
                  <button className="shell-user-dropdown-item" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}