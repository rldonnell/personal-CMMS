'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import EquipmentCard from '@/components/EquipmentCard';
import CompletionModal from '@/components/CompletionModal';

const CATEGORY_META = {
  hvac: { label: 'HVAC', icon: '🌡️', color: '#1e3a5f', desc: 'Heating, ventilation, and air conditioning' },
  'water-heater': { label: 'Water Heater', icon: '🔥', color: '#dd6b20', desc: 'Hot water heater maintenance' },
  pool: { label: 'Pool', icon: '🏊', color: '#2c5282', desc: 'Swimming pool equipment and water chemistry' },
  plumbing: { label: 'Plumbing', icon: '🔧', color: '#2b6cb0', desc: 'Pipes, fixtures, valves, and water supply systems' },
  electrical: { label: 'Electrical', icon: '⚡', color: '#d69e2e', desc: 'Electrical systems, outlets, panels, and safety devices' },
  septic: { label: 'Septic System', icon: '🪣', color: '#744210', desc: 'Septic tank, drain field, and wastewater management' },
  'roof-gutters': { label: 'Roof & Gutters', icon: '🏠', color: '#718096', desc: 'Roofing, gutters, downspouts, and drainage' },
  appliances: { label: 'Appliances', icon: '🧺', color: '#4a5568', desc: 'Major household appliances and their maintenance' },
  exterior: { label: 'Exterior & Foundation', icon: '🛡️', color: '#276749', desc: 'Siding, foundation, driveway, deck, and outdoor structures' },
  'garage-door': { label: 'Garage Door', icon: '🚗', color: '#6b46c1', desc: 'Garage door system, opener, tracks, and hardware' },
  irrigation: { label: 'Irrigation & Sprinklers', icon: '💧', color: '#2f855a', desc: 'Lawn sprinkler systems, drip irrigation, and outdoor watering' },
};

function daysUntil(dateStr) {
  const due = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due - now) / 86400000);
}

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

function DueLabel({ dateStr }) {
  const days = daysUntil(dateStr);
  if (days < 0) return <span className="text-red-600 font-semibold text-sm">Overdue ({Math.abs(days)}d)</span>;
  if (days === 0) return <span className="text-orange-600 font-semibold text-sm">Due today</span>;
  if (days <= 7) return <span className="text-orange-500 text-sm">Due in {days}d</span>;
  return <span className="text-gray-500 text-sm">{new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
}

export default function CategoryPage() {
  const { category } = useParams();
  const meta = CATEGORY_META[category];
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionCost, setCompletionCost] = useState('');
  const [hiding, setHiding] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', description: '', intervalDays: 30, priority: 'medium' });
  const [filter, setFilter] = useState('all'); // all, overdue, due-soon, upcoming

  const fetchTasks = useCallback(() => {
    fetch(`/api/tasks?category=${category}`)
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function openCompletionModal(taskId) {
    setCompletingTaskId(taskId);
    setCompletionNotes('');
    setCompletionCost('');
  }

  function closeCompletionModal() {
    setCompletingTaskId(null);
    setCompletionNotes('');
    setCompletionCost('');
  }

  async function handleComplete(taskId, notes = '', cost = '') {
    setCompleting(taskId);
    try {
      const body = {};
      if (notes) body.notes = notes;
      if (cost) body.cost = parseFloat(cost);

      await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      fetchTasks();
    } finally {
      setCompleting(null);
    }
  }

  async function handleCompleteWithModal(taskId) {
    await handleComplete(taskId, completionNotes, completionCost);
    closeCompletionModal();
  }

  async function handleAddTask(e) {
    e.preventDefault();
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, categorySlug: category }),
    });
    setNewTask({ name: '', description: '', intervalDays: 30, priority: 'medium' });
    setShowAddForm(false);
    fetchTasks();
  }

  async function handleDelete(taskId) {
    if (!confirm('Remove this maintenance task?')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    fetchTasks();
  }

  async function handleHide(taskId) {
    setHiding(taskId);
    try {
      await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: true }),
      });
      fetchTasks();
    } finally {
      setHiding(null);
    }
  }

  if (!meta) {
    return <div className="p-8 text-red-500">Unknown category: {category}</div>;
  }

  // Filter tasks
  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const filteredTasks = tasks.filter((t) => {
    const due = t.next_due?.slice(0, 10);
    if (filter === 'overdue') return due < today;
    if (filter === 'due-soon') return due >= today && due <= weekOut;
    if (filter === 'upcoming') return due > weekOut;
    return true;
  });

  const overdueCount = tasks.filter((t) => t.next_due?.slice(0, 10) < today).length;
  const dueSoonCount = tasks.filter((t) => {
    const d = t.next_due?.slice(0, 10);
    return d >= today && d <= weekOut;
  }).length;

  return (
    <div>
      {/* Equipment Profile Card */}
      <EquipmentCard categorySlug={category} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{meta.label}</h1>
            <p className="text-sm text-gray-500">{meta.desc}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-fw-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-light transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Custom Task'}
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'all' ? 'bg-fw-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Overdue ({overdueCount})
        </button>
        <button
          onClick={() => setFilter('due-soon')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'due-soon' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Due Soon ({dueSoonCount})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === 'upcoming' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Upcoming
        </button>
      </div>

      {/* Add custom task form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Add Custom Maintenance Task</h3>
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Task Name *</label>
                <input
                  type="text"
                  required
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  placeholder="e.g., Clean evaporator coils"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Repeat Every (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.intervalDays}
                    onChange={(e) => setNewTask({ ...newTask, intervalDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                placeholder="Optional notes about what this task involves..."
              />
            </div>
            <button
              type="submit"
              className="bg-fw-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-fw-navy-light transition"
            >
              Add Task
            </button>
          </form>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="animate-pulse text-gray-400 p-8">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          No tasks match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const days = daysUntil(task.next_due?.slice(0, 10));
            const isOverdue = days < 0;
            const isDueSoon = days >= 0 && days <= 30;
            const isGood = days > 30 && task.last_completed;

            // Done button style based on task status
            let doneButtonClass, doneButtonLabel;
            if (isOverdue) {
              doneButtonClass = 'bg-red-600 text-white hover:bg-red-700';
              doneButtonLabel = '✓ Mark Done';
            } else if (isDueSoon) {
              doneButtonClass = 'bg-orange-500 text-white hover:bg-orange-600';
              doneButtonLabel = '✓ Mark Done';
            } else if (isGood) {
              doneButtonClass = 'bg-green-100 text-green-700 border border-green-200';
              doneButtonLabel = '✓ Up to Date';
            } else {
              doneButtonClass = 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200';
              doneButtonLabel = '✓ Mark Done';
            }

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                  isOverdue ? 'border-red-200 bg-red-50/30' : isDueSoon ? 'border-orange-200 bg-orange-50/20' : isGood ? 'border-green-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{task.name}</h4>
                      <PriorityBadge priority={task.priority} />
                      {task.is_custom && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Custom</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Every {task.interval_days}d</span>
                      {task.last_completed && (
                        <span>
                          Last done:{' '}
                          {new Date(task.last_completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <DueLabel dateStr={task.next_due?.slice(0, 10)} />
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => openCompletionModal(task.id)}
                        disabled={completing === task.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${doneButtonClass}`}
                      >
                        {completing === task.id ? '...' : doneButtonLabel}
                      </button>
                      <button
                        onClick={() => handleHide(task.id)}
                        disabled={hiding === task.id}
                        className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-xs transition disabled:opacity-50"
                      >
                        {hiding === task.id ? '...' : 'Hide'}
                      </button>
                      {task.is_custom && (
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-gray-400 hover:text-red-500 px-2 py-1.5 text-xs transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Modal */}
      <CompletionModal
        isOpen={completingTaskId !== null}
        onClose={closeCompletionModal}
        onSaveAndComplete={() => handleCompleteWithModal(completingTaskId)}
        onSkip={() => {
          handleComplete(completingTaskId, '', '');
          closeCompletionModal();
        }}
        notes={completionNotes}
        onNotesChange={setCompletionNotes}
        cost={completionCost}
        onCostChange={setCompletionCost}
        isLoading={completing !== null}
      />
    </div>
  );
}
