'use client';

import { useState, useEffect, useCallback } from 'react';

const CATEGORY_OPTIONS = [
  { slug: '', label: 'General (no category)' },
  { slug: 'hvac', label: 'HVAC', icon: '🌡️' },
  { slug: 'water-heater', label: 'Water Heater', icon: '🔥' },
  { slug: 'pool', label: 'Pool', icon: '🏊' },
  { slug: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { slug: 'electrical', label: 'Electrical', icon: '⚡' },
  { slug: 'septic', label: 'Septic System', icon: '🪣' },
  { slug: 'roof-gutters', label: 'Roof & Gutters', icon: '🏠' },
  { slug: 'appliances', label: 'Appliances', icon: '🧺' },
  { slug: 'exterior', label: 'Exterior', icon: '🛡️' },
  { slug: 'garage-door', label: 'Garage Door', icon: '🚗' },
  { slug: 'irrigation', label: 'Irrigation', icon: '💧' },
];

const CATEGORY_ICONS = {
  hvac: '🌡️', 'water-heater': '🔥', pool: '🏊',
  plumbing: '🔧', electrical: '⚡', septic: '🪣',
  'roof-gutters': '🏠', appliances: '🧺', exterior: '🛡️',
  'garage-door': '🚗', irrigation: '💧',
};

function PriorityBadge({ priority }) {
  const cls = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls[priority] || cls.medium}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const cls = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
  };
  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Done',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls[status] || cls.open}`}>
      {labels[status] || status}
    </span>
  );
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HoneyDoPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('active'); // active | completed | all
  const [newWO, setNewWO] = useState({ title: '', description: '', priority: 'medium', categorySlug: '', createdBy: '' });
  const [updating, setUpdating] = useState(null);

  const fetchWorkOrders = useCallback(() => {
    fetch(`/api/work-orders?status=${filter}`)
      .then((r) => r.json())
      .then((data) => setWorkOrders(data.workOrders || []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  async function handleCreate(e) {
    e.preventDefault();
    await fetch('/api/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWO),
    });
    setNewWO({ title: '', description: '', priority: 'medium', categorySlug: '', createdBy: '' });
    setShowForm(false);
    fetchWorkOrders();
  }

  async function handleStatusChange(id, newStatus) {
    setUpdating(id);
    await fetch(`/api/work-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchWorkOrders();
    setUpdating(null);
  }

  async function handleDelete(id) {
    if (!confirm('Remove this work order?')) return;
    await fetch(`/api/work-orders/${id}`, { method: 'DELETE' });
    fetchWorkOrders();
  }

  const openCount = workOrders.filter(wo => wo.status === 'open').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in_progress').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍯</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Honey-Do List</h1>
            <p className="text-sm text-gray-500">Work orders and one-off household tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-fw-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-light transition"
        >
          {showForm ? 'Cancel' : '+ New Work Order'}
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'active' ? 'bg-fw-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Active ({filter === 'active' ? workOrders.length : '...'})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          All
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">New Work Order</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">What needs to be done? *</label>
              <input
                type="text"
                required
                value={newWO.title}
                onChange={(e) => setNewWO({ ...newWO, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                placeholder="e.g., Fix the leaky kitchen faucet"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Details</label>
              <textarea
                value={newWO.description}
                onChange={(e) => setNewWO({ ...newWO, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                placeholder="Any extra details, location, notes..."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={newWO.categorySlug}
                  onChange={(e) => setNewWO({ ...newWO, categorySlug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.slug} value={opt.slug}>
                      {opt.icon ? `${opt.icon} ` : ''}{opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={newWO.priority}
                  onChange={(e) => setNewWO({ ...newWO, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Requested By</label>
                <input
                  type="text"
                  value={newWO.createdBy}
                  onChange={(e) => setNewWO({ ...newWO, createdBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  placeholder="e.g., Sarah"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-fw-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-light transition"
            >
              Create Work Order
            </button>
          </form>
        </div>
      )}

      {/* Work order list */}
      {loading ? (
        <div className="animate-pulse text-gray-400 p-8">Loading work orders...</div>
      ) : workOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🍯</div>
          <h3 className="font-semibold text-gray-700 mb-1">
            {filter === 'completed' ? 'No completed work orders yet' : 'No work orders yet'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {filter === 'completed'
              ? 'Completed tasks will appear here.'
              : 'Create your first work order — or have someone in your household add one!'}
          </p>
          {filter !== 'completed' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-fw-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-light transition"
            >
              + New Work Order
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className={`bg-white rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                wo.status === 'completed'
                  ? 'border-green-100 opacity-75'
                  : wo.priority === 'high'
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`font-semibold ${wo.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {wo.title}
                    </h4>
                    <StatusBadge status={wo.status} />
                    <PriorityBadge priority={wo.priority} />
                  </div>
                  {wo.description && (
                    <p className="text-sm text-gray-500 mb-2 leading-relaxed">{wo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    {wo.category_name && (
                      <span className="flex items-center gap-1">
                        <span>{CATEGORY_ICONS[wo.category_slug] || '📁'}</span>
                        {wo.category_name}
                      </span>
                    )}
                    {wo.created_by && <span>From: {wo.created_by}</span>}
                    <span>{timeAgo(wo.created_at)}</span>
                    {wo.completed_at && (
                      <span className="text-green-600">
                        Completed {timeAgo(wo.completed_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {wo.status === 'open' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(wo.id, 'in_progress')}
                        disabled={updating === wo.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {updating === wo.id ? '...' : 'Start'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(wo.id, 'completed')}
                        disabled={updating === wo.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {updating === wo.id ? '...' : '✓ Done'}
                      </button>
                    </div>
                  )}
                  {wo.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(wo.id, 'completed')}
                      disabled={updating === wo.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updating === wo.id ? '...' : '✓ Mark Complete'}
                    </button>
                  )}
                  {wo.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange(wo.id, 'open')}
                      disabled={updating === wo.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {updating === wo.id ? '...' : 'Reopen'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(wo.id)}
                    className="text-gray-400 hover:text-red-500 px-2 py-1 text-xs transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
