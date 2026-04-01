'use client';

import { useState, useEffect } from 'react';

const CATEGORY_META = {
  hvac: { label: 'HVAC', icon: '🌡️' },
  'water-heater': { label: 'Water Heater', icon: '🔥' },
  pool: { label: 'Pool', icon: '🏊' },
  plumbing: { label: 'Plumbing', icon: '🔧' },
  electrical: { label: 'Electrical', icon: '⚡' },
  septic: { label: 'Septic System', icon: '🪣' },
  'roof-gutters': { label: 'Roof & Gutters', icon: '🏠' },
  appliances: { label: 'Appliances', icon: '🧺' },
  exterior: { label: 'Exterior & Foundation', icon: '🛡️' },
  'garage-door': { label: 'Garage Door', icon: '🚗' },
  irrigation: { label: 'Irrigation', icon: '💧' },
};

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors flex items-center ${
        checked ? 'bg-blue-500' : 'bg-gray-300'
      }`}
      style={{
        width: '44px',
        height: '24px',
        position: 'relative',
      }}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
        style={{
          width: '20px',
          height: '20px',
          marginLeft: checked ? '20px' : '2px',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [categories, setCategories] = useState([]);
  const [hiddenTasks, setHiddenTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [unhiding, setUnhiding] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/categories').then((r) => r.json()),
      fetch('/api/tasks?showHidden=true').then((r) => r.json()),
    ]).then(([catRes, tasksRes]) => {
      setCategories(catRes.categories || []);
      const allTasks = tasksRes.tasks || [];
      setHiddenTasks(allTasks.filter((t) => t.hidden));
      setLoading(false);
    });
  }, []);

  async function handleToggleCategory(categoryId, currentEnabled) {
    setToggling(categoryId);
    try {
      const res = await fetch('/api/settings/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, enabled: !currentEnabled }),
      });
      if (res.ok) {
        setCategories(
          categories.map((c) =>
            c.id === categoryId ? { ...c, enabled: !currentEnabled } : c
          )
        );
      }
    } finally {
      setToggling(null);
    }
  }

  async function handleUnhideTask(taskId) {
    setUnhiding(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: false }),
      });
      if (res.ok) {
        setHiddenTasks(hiddenTasks.filter((t) => t.id !== taskId));
      }
    } finally {
      setUnhiding(null);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse text-gray-400 p-8">Loading settings...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

      {/* Section 1: My Home Systems */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Home Systems</h2>
        <p className="text-sm text-gray-500 mb-6">
          Toggle categories on or off to customize your dashboard. Disabled categories won't appear in your maintenance schedule.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <div
                key={cat.id}
                className={`border rounded-lg p-4 transition ${
                  cat.enabled
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.icon || '📋'}</span>
                    <div>
                      <h3
                        className={`font-semibold transition ${
                          cat.enabled ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {meta?.label || cat.name}
                      </h3>
                      <p className={`text-xs transition ${
                        cat.enabled ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {cat.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={cat.enabled}
                    onChange={() => handleToggleCategory(cat.id, cat.enabled)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Hidden Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Hidden Tasks</h2>
        {hiddenTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-400">
            No hidden tasks. All your tasks are visible.
          </div>
        ) : (
          <div className="space-y-2 bg-white rounded-lg border border-gray-100 divide-y">
            {hiddenTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{task.name}</p>
                  <p className="text-xs text-gray-500">
                    {task.category_name}
                  </p>
                </div>
                <button
                  onClick={() => handleUnhideTask(task.id)}
                  disabled={unhiding === task.id}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                >
                  {unhiding === task.id ? '...' : 'Unhide'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
