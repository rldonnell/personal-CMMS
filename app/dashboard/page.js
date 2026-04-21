'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORY_ICONS = {
  hvac: '🌡️', 'water-heater': '🔥', pool: '🏊',
  plumbing: '🔧', electrical: '⚡', septic: '🪣',
  'roof-gutters': '🏠', appliances: '🧺', exterior: '🛡️',
  'garage-door': '🚗', irrigation: '💧',
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function daysUntil(dateStr) {
  const due = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due - now) / 86400000);
}

function DueLabel({ dateStr }) {
  const days = daysUntil(dateStr);
  if (days < 0) return <span className="status-overdue">Overdue by {Math.abs(days)}d</span>;
  if (days === 0) return <span className="status-due-soon">Due today</span>;
  if (days <= 7) return <span className="status-due-soon">Due in {days}d</span>;
  return <span className="status-upcoming">Due in {days}d</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-gray-400 p-8">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-500 p-8">Failed to load dashboard data.</div>;
  }

  const { stats, categories, upcomingTasks } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Home Maintenance Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Overdue" value={stats.overdue} color={stats.overdue > 0 ? 'text-red-600' : 'text-green-600'} />
        <StatCard label="Due This Week" value={stats.dueThisWeek} color={stats.dueThisWeek > 0 ? 'text-orange-600' : 'text-gray-800'} />
        <StatCard label="Total Tasks" value={stats.totalTasks} />
        <StatCard label="Completed This Month" value={stats.completedThisMonth} color="text-green-600" />
        <Link href="/dashboard/honey-do" className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">🍯 Honey-Do</p>
          <p className={`text-3xl font-bold ${stats.openWorkOrders > 0 ? 'text-fw-navy group-hover:text-fw-red' : 'text-gray-800'}`}>{stats.openWorkOrders}</p>
        </Link>
      </div>

      {/* Category cards */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Systems</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/dashboard/${cat.slug}`}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[cat.slug]}</span>
                <h3 className="font-bold text-gray-800 group-hover:text-fw-navy transition">{cat.name}</h3>
              </div>
              <span className="text-gray-300 group-hover:text-fw-navy transition">→</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500">{cat.total_tasks} tasks</span>
              {cat.overdue > 0 && <span className="text-red-600 font-medium">{cat.overdue} overdue</span>}
              {cat.due_soon > 0 && <span className="text-orange-600">{cat.due_soon} due soon</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming tasks */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Next Up</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {upcomingTasks.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No upcoming tasks. You're all caught up!</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {upcomingTasks.map((task) => (
              <li key={task.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICONS[task.category_slug]}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{task.name}</p>
                    <p className="text-xs text-gray-500">{task.category_name}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <DueLabel dateStr={task.next_due?.slice(0, 10)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
