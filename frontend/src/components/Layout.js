import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⬛', roles: ['employee', 'hr'] },
  { label: 'Apply Leave', path: '/apply-leave', icon: '＋', roles: ['employee'] },
  { label: 'My Leaves', path: '/my-leaves', icon: '☰', roles: ['employee'] },
  { label: 'HR Panel', path: '/hr-panel', icon: '◈', roles: ['hr'] },
];

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 220, flexShrink: 0, background: 'var(--surface)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '1.5rem 0',
  },
  logo: {
    padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
    marginBottom: '1rem',
  },
  logoTitle: { fontSize: 15, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.01em' },
  logoSub: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  nav: { flex: 1, padding: '0 0.75rem' },
  link: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 8, color: 'var(--text2)', fontSize: 14,
    marginBottom: 2, transition: 'all 0.15s', cursor: 'pointer',
  },
  icon: { fontSize: 13, width: 18, textAlign: 'center' },
  userBox: {
    margin: '0 0.75rem', padding: '12px', borderTop: '1px solid var(--border)',
    paddingTop: '1rem', marginTop: '0.5rem',
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  userRole: {
    fontSize: 11, color: 'var(--accent)', background: 'var(--accent-light)',
    padding: '1px 8px', borderRadius: 99, display: 'inline-block', marginTop: 3,
  },
  logoutBtn: {
    marginTop: 10, width: '100%', padding: '7px 0', border: '1px solid var(--border)',
    borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 13,
    color: 'var(--text2)', transition: 'all 0.15s',
  },
  main: { flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: 1000 },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const visible = navItems.filter((n) => n.roles.includes(user?.role));

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoTitle}>LeaveDesk</div>
          <div style={s.logoSub}>Leave Management</div>
        </div>
        <nav style={s.nav}>
          {visible.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...s.link,
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <span style={s.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={s.userBox}>
          <div style={s.userName}>{user?.name}</div>
          <span style={s.userRole}>{user?.role?.toUpperCase()}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  );
}