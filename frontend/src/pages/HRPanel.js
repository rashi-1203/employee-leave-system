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
    fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600,
    color: 'var(--text3)', borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  td: { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' },
  badge: { padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 },
  btnRow: { display: 'flex', gap: 6 },
  approveBtn: {
    padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 12,
    background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 500,
  },
  rejectBtn: {
    padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
    background: 'transparent', color: 'var(--danger)', cursor: 'pointer',
  },
  empty: { padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 14 },
  statsRow: { display: 'flex', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' },
  stat: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', flex: 1, minWidth: 120,
  },
  statLabel: { fontSize: 12, color: 'var(--text3)', marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: 600 },
};

export default function HRPanel() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState({ status: 'pending', leaveType: '' });
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.leaveType) params.leaveType = filter.leaveType;
      const { data } = await API.get('/leave/all-leaves', { params });
      setLeaves(data.data);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [filter]);

  const openModal = (leave, act) => {
    setCommentModal(leave);
    setAction(act);
    setComment('');
  };

  const submitAction = async () => {
    try {
      await API.put(`/leave/update-status/${commentModal._id}`, {
        status: action,
        hrComment: comment,
      });
      toast.success(`Leave ${action} successfully`);
      setCommentModal(null);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const pending = leaves.filter((l) => l.status === 'pending').length;
  const approved = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div>
      <div style={s.heading}>HR Panel</div>
      <div style={s.sub}>Review and manage all leave applications</div>

      <div style={s.statsRow}>
        {[
          { label: 'Total shown', val: leaves.length, color: 'var(--text)' },
          { label: 'Pending', val: pending, color: 'var(--warning)' },
          { label: 'Approved', val: approved, color: 'var(--accent)' },
        ].map((c) => (
          <div key={c.label} style={s.stat}>
            <div style={s.statLabel}>{c.label}</div>
            <div style={{ ...s.statVal, color: c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

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
          <div style={s.empty}>No applications found</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Employee', 'Dept', 'Type', 'Dates', 'Days', 'Reason', 'Status', 'Action'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{l.employee?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.employee?.employeeId}</div>
                  </td>
                  <td style={{ ...s.td, fontSize: 13, color: 'var(--text2)' }}>{l.employee?.department}</td>
                  <td style={{ ...s.td, textTransform: 'capitalize' }}>{l.leaveType}</td>
                  <td style={{ ...s.td, fontSize: 12 }}>
                    {new Date(l.startDate).toLocaleDateString('en-IN')} →{' '}
                    {new Date(l.endDate).toLocaleDateString('en-IN')}
                  </td>
                  <td style={s.td}>{l.numberOfDays}</td>
                  <td style={{ ...s.td, maxWidth: 160, fontSize: 13, color: 'var(--text2)' }}>{l.reason}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusStyle[l.status] }}>{l.status}</span>
                  </td>
                  <td style={s.td}>
                    {l.status === 'pending' && (
                      <div style={s.btnRow}>
                        <button style={s.approveBtn} onClick={() => openModal(l, 'approved')}>Approve</button>
                        <button style={s.rejectBtn} onClick={() => openModal(l, 'rejected')}>Reject</button>
                      </div>
                    )}
                    {l.hrComment && l.status !== 'pending' && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{l.hrComment}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Comment Modal */}
      {commentModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            padding: '1.75rem', width: '100%', maxWidth: 420,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6, textTransform: 'capitalize' }}>
              {action} leave — {commentModal.employee?.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1rem' }}>
              {commentModal.leaveType} · {commentModal.numberOfDays} days
            </div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Comment (optional)
            </label>
            <textarea
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 14, background: 'var(--surface2)',
                color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: 70,
                marginBottom: '1.1rem',
              }}
              placeholder="Add a note for the employee..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCommentModal(null)}
                style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                style={{
                  padding: '8px 18px', border: 'none', borderRadius: 7, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer',
                  background: action === 'approved' ? 'var(--accent)' : 'var(--danger)',
                  color: '#fff',
                }}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}