import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '2.5rem', width: '100%', maxWidth: 400,
  },
  heading: { fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text2)', marginBottom: '2rem' },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', marginBottom: '1.25rem',
    transition: 'border 0.15s',
  },
  btn: {
    width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  hint: {
    marginTop: '1.5rem', padding: '12px', background: 'var(--surface2)',
    borderRadius: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7,
  },
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.data);
      toast.success(`Welcome back, ${data.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.heading}>LeaveDesk</div>
        <div style={s.sub}>Sign in to your account</div>
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email address</label>
          <input
            style={s.input} type="email" placeholder="you@company.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={s.label}>Password</label>
          <input
            style={s.input} type="password" placeholder="••••••••"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={s.hint}>
          <strong>Test accounts:</strong><br />
          HR: hr@company.com / hr123456<br />
          Employee: rahul@company.com / emp123456
        </div>
      </div>
    </div>
  );
}