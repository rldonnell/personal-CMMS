'use client';

import { useState, useEffect } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => {
        if (r.status === 403) throw new Error('Access denied. Admin only.');
        if (!r.ok) throw new Error('Failed to load users.');
        return r.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-gray-400 p-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registered Users</h1>
          <p className="text-sm text-gray-500">{total} total signups</p>
        </div>
        <button
          onClick={() => {
            const csv = [
              ['First Name', 'Last Name', 'Email', 'Company', 'Signed Up', 'Tasks Completed', 'Last Activity'].join(','),
              ...users.map((u) =>
                [u.first_name, u.last_name, u.email, u.company || '', formatDate(u.created_at), u.tasks_completed, formatDate(u.last_activity)].map(v => `"${v}"`).join(',')
              ),
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `homecmms-users-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-fw-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-dark transition"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Company</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Signed Up</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Tasks Done</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <a href={`mailto:${u.email}`} className="text-fw-navy hover:underline">
                      {u.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.company || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.tasks_completed > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.tasks_completed}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatDateTime(u.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="text-center text-gray-400 py-8">No users yet.</p>
        )}
      </div>
    </div>
  );
}
