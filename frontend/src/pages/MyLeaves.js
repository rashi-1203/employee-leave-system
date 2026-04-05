import { useEffect, useState, useCallback } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const statusStyle = {
  pending:  { background: 'var(--warning-light)', color: 'var(--warning)' },
  approved: { background: 'var(--accent-light)',  color: 'var(--accent)'  },
  rejected: { background: 'var(--danger-light)',  color: 'var(--danger)'  },
};

const s = {
  heading: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text2)', marginBottom: '1.75rem' },
  filters: { display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' },
  select: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 13, background: 'var(--surface)', color: 'var(--text)',
    outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600,
    color: 'var(--text3)', borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text)' },
  badge: { padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 },
  cancelBtn: {
    padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 6,
    background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--danger)',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  },
  empty: { padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 14 },
};

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState({ status: '', leaveType: '' });
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.leaveType) params.leaveType = filter.leaveType;
      const { data } = await API.get('/leave/my-leaves', { params });
      setLeaves(data.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [filter]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this leave application?')) return;
    try {
      await API.delete(`/leave/cancel/${id}`);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    }
  };

  return (
    <div>
      <div style={s.heading}>My Leave Applications</div>
      <div style={s.sub}>Track the status of all your leave requests</div>

      <div style={s.filters}>
        <select style={s.select} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select style={s.select} value={filter.leaveType} onChange={(e) => setFilter({ ...filter, leaveType: e.target.value })}>
          <option value="">All types</option>
          <option value="casual">Casual</option>
          <option value="sick">Sick</option>
          <option value="earned">Earned</option>
        </select>
      </div>

      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : leaves.length === 0 ? (
          <div style={s.empty}>No leave applications found</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Type', 'From', 'To', 'Days', 'Reason', 'Status', 'HR Comment', ''].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td style={s.td}>{l.leaveType}</td>
                  <td style={s.td}>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                  <td style={s.td}>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                  <td style={s.td}>{l.numberOfDays}</td>
                  <td style={{ ...s.td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusStyle[l.status] }}>{l.status}</span>
                  </td>
                  <td style={{ ...s.td, color: 'var(--text2)', fontSize: 13 }}>{l.hrComment || '—'}</td>
                  <td style={s.td}>
                    {l.status === 'pending' && (
                      <button style={s.cancelBtn} onClick={() => cancel(l._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}