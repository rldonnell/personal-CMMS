'use client';

import { useState, useEffect } from 'react';
// Inline icon components (no external dependency)
function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
function MagnifyingGlassIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

const CATEGORY_ICONS = {
  hvac: '🌡️',
  'water-heater': '🔥',
  pool: '🏊',
  plumbing: '🔧',
  electrical: '⚡',
  septic: '🪣',
  'roof-gutters': '🏠',
  appliances: '🧺',
  exterior: '🛡️',
  'garage-door': '🚗',
  irrigation: '💧',
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function HistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history?page=${page}&limit=${limit}&year=${year}`)
      .then((r) => r.json())
      .then(setData)
      .catch((err) => {
        console.error('Failed to load history:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [page, year]);

  useEffect(() => {
    if (data?.history) {
      if (search.trim() === '') {
        setFilteredHistory(data.history);
      } else {
        const searchLower = search.toLowerCase();
        setFilteredHistory(
          data.history.filter(
            (item) =>
              item.task_name.toLowerCase().includes(searchLower) ||
              item.category_name.toLowerCase().includes(searchLower) ||
              (item.notes && item.notes.toLowerCase().includes(searchLower))
          )
        );
      }
    }
  }, [data, search]);

  if (loading && !data) {
    return <div className="animate-pulse text-gray-400 p-8">Loading history...</div>;
  }

  if (!data) {
    return <div className="text-red-500 p-8">Failed to load history data.</div>;
  }

  const { summary, total } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Maintenance History</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Spent This Year" value={formatCurrency(summary.totalCost)} color="text-fw-navy" />
        <StatCard label="Tasks Completed" value={summary.totalTasks} color="text-green-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Task name, category, or notes..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
              />
            </div>
          </div>

          {/* Year filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => {
                setYear(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fw-navy"
            >
              {[2026, 2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No history found.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-50">
              {filteredHistory.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl pt-1">{CATEGORY_ICONS[item.category_slug] || '📋'}</div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <p className="font-semibold text-gray-800">{item.task_name}</p>
                          <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-50 rounded">
                            {item.category_name}
                          </span>
                        </div>
                        {item.notes && <p className="text-sm text-gray-600 mb-2">{item.notes}</p>}
                        <p className="text-xs text-gray-400">{formatDate(item.completed_at)}</p>
                      </div>
                    </div>
                    {item.cost && <div className="text-right">
                      <p className="font-semibold text-fw-navy text-lg">{formatCurrency(item.cost)}</p>
                    </div>}
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
