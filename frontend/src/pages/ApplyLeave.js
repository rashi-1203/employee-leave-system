import { useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const s = {
  heading: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text2)', marginBottom: '1.75rem' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.75rem', maxWidth: 540,
  },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', marginBottom: '1.1rem',
  },
  select: {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', marginBottom: '1.1rem',
    appearance: 'none',
  },
  textarea: {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', marginBottom: '1.1rem',
    resize: 'vertical', minHeight: 90,
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btn: {
    padding: '11px 28px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  preview: {
    background: 'var(--accent-light)', border: '1px solid #c5dbc3',
    borderRadius: 8, padding: '10px 14px', marginBottom: '1.1rem',
    fontSize: 13, color: 'var(--accent)',
  },
};

export default function ApplyLeave() {
  const [form, setForm] = useState({
    leaveType: 'casual', startDate: '', endDate: '', reason: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const days = form.startDate && form.endDate
    ? Math.max(0, Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (days <= 0) return toast.error('End date must be on or after start date');
    setLoading(true);
    try {
      await API.post('/leave/apply', form);
      toast.success('Leave application submitted!');
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.heading}>Apply for Leave</div>
      <div style={s.sub}>Fill in the details and submit your application</div>
      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Leave type</label>
          <select style={s.select} value={form.leaveType} onChange={set('leaveType')}>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
          </select>

          <div style={s.row}>
            <div>
              <label style={s.label}>Start date</label>
              <input style={s.input} type="date" value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div>
              <label style={s.label}>End date</label>
              <input style={s.input} type="date" value={form.endDate} onChange={set('endDate')} required />
            </div>
          </div>

          {days > 0 && (
            <div style={s.preview}>
              {days} day{days > 1 ? 's' : ''} of {form.leaveType} leave
            </div>
          )}

          <label style={s.label}>Reason</label>
          <textarea
            style={s.textarea}
            placeholder="Briefly describe the reason for your leave (min 10 characters)"
            value={form.reason}
            onChange={set('reason')}
            required
          />

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}