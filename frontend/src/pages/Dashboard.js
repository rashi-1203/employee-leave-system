import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const s = {
  heading: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text2)', marginBottom: '1.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.75rem' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
  },
  cardLabel: { fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 },
  cardVal: { fontSize: 26, fontWeight: 600, color: 'var(--text)' },
  section: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem',
  },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: '1rem' },
  balRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  balCard: {
    flex: 1, minWidth: 100, padding: '12px 14px',
    background: 'var(--surface2)', borderRadius: 8,
    border: '1px solid var(--border)',
  },
  balType: { fontSize: 12, color: 'var(--text3)', textTransform: 'capitalize' },
  balDays: { fontSize: 22, fontWeight: 600, color: 'var(--accent)', marginTop: 2 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get('/leave/summary').then((r) => setSummary(r.data.data)).catch(() => {});
  }, []);

  const monthlyData = Array(12).fill(0);
  summary?.monthlyBreakdown?.forEach((m) => {
    if (m._id?.month) monthlyData[m._id.month - 1] += m.totalDays;
  });

  return (
    <div>
      <div style={s.heading}>Good morning, {user?.name?.split(' ')[0]} 👋</div>
      <div style={s.sub}>{user?.department} · {user?.employeeId}</div>

      <div style={s.grid}>
        {[
          { label: 'Total Applied', val: summary?.totalApplied ?? '—' },
          { label: 'Approved', val: summary?.approved ?? '—', color: 'var(--accent)' },
          { label: 'Pending', val: summary?.pending ?? '—', color: 'var(--warning)' },
          { label: 'Rejected', val: summary?.rejected ?? '—', color: 'var(--danger)' },
        ].map((c) => (
          <div key={c.label} style={s.card}>
            <div style={s.cardLabel}>{c.label}</div>
            <div style={{ ...s.cardVal, color: c.color || 'var(--text)' }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Leave Balance</div>
        <div style={s.balRow}>
          {Object.entries(summary?.leaveBalance || {}).map(([type, days]) => (
            <div key={type} style={s.balCard}>
              <div style={s.balType}>{type}</div>
              <div style={s.balDays}>{days} <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>days left</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Monthly Leave Usage ({new Date().getFullYear()})</div>
        <Bar
          data={{
            labels: months,
            datasets: [{
              label: 'Days taken',
              data: monthlyData,
              backgroundColor: '#4a8c42aa',
              borderColor: '#2d5a27',
              borderWidth: 1,
              borderRadius: 4,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }}
        />
      </div>
    </div>
  );
}