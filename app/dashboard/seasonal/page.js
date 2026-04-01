'use client';

import { useState } from 'react';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

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

const SEASONAL_TASKS = {
  spring: [
    { name: 'Test sprinkler system', category: 'irrigation' },
    { name: 'Clean gutters', category: 'roof-gutters' },
    { name: 'Service AC unit', category: 'hvac' },
    { name: 'Power wash deck', category: 'exterior' },
    { name: 'Check window screens', category: 'exterior' },
    { name: 'Inspect roof for winter damage', category: 'roof-gutters' },
    { name: 'Fertilize lawn', category: 'exterior' },
    { name: 'Check exterior caulking', category: 'exterior' },
  ],
  summer: [
    { name: 'Clean dryer vent', category: 'appliances' },
    { name: 'Deep clean kitchen appliances', category: 'appliances' },
    { name: 'Check smoke/CO detectors', category: 'electrical' },
    { name: 'Inspect and clean ceiling fans', category: 'electrical' },
    { name: 'Check attic ventilation', category: 'roof-gutters' },
    { name: 'Service pool equipment', category: 'pool' },
    { name: 'Inspect outdoor faucets', category: 'plumbing' },
  ],
  fall: [
    { name: 'Schedule furnace tune-up', category: 'hvac' },
    { name: 'Clean gutters again', category: 'roof-gutters' },
    { name: 'Winterize sprinklers', category: 'irrigation' },
    { name: 'Reverse ceiling fans', category: 'electrical' },
    { name: 'Check weather stripping', category: 'exterior' },
    { name: 'Inspect chimney/fireplace', category: 'roof-gutters' },
    { name: 'Rake and aerate lawn', category: 'exterior' },
    { name: 'Test sump pump', category: 'plumbing' },
  ],
  winter: [
    { name: 'Check for ice dams', category: 'roof-gutters' },
    { name: 'Inspect pipe insulation', category: 'plumbing' },
    { name: 'Test backup generator', category: 'electrical' },
    { name: 'Check heating system filters', category: 'hvac' },
    { name: 'Inspect attic for moisture', category: 'roof-gutters' },
    { name: 'Clean humidifier', category: 'hvac' },
    { name: 'Check carbon monoxide detectors', category: 'electrical' },
  ],
};

const SEASON_COLORS = {
  spring: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  summer: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  fall: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
  winter: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
};

function ChecklistItem({ item, onAddTask, isAdding }) {
  const [checked, setChecked] = useState(false);
  const icon = CATEGORY_ICONS[item.category] || '📋';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition ${checked ? 'bg-gray-50' : 'bg-white'}`}>
      <button
        onClick={() => setChecked(!checked)}
        className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition ${
          checked ? 'bg-fw-navy border-fw-navy' : 'border-gray-300 hover:border-fw-navy'
        }`}
      >
        {checked && <CheckIcon className="h-3 w-3 text-white" />}
      </button>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.name}
        </p>
      </div>
      <button
        onClick={() => onAddTask(item)}
        disabled={isAdding === item.name}
        title="Add as recurring task"
        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-fw-navy hover:bg-gray-100 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function SeasonTab({ season, tasks, onAddTask, isAdding }) {
  const colors = SEASON_COLORS[season];

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6`}>
      <h2 className={`text-2xl font-bold ${colors.text} mb-6 capitalize`}>{season}</h2>
      <div className="space-y-3">
        {tasks.map((item, idx) => (
          <ChecklistItem
            key={idx}
            item={item}
            onAddTask={onAddTask}
            isAdding={isAdding}
          />
        ))}
      </div>
    </div>
  );
}

export default function SeasonalPage() {
  const [activeTab, setActiveTab] = useState('spring');
  const [isAdding, setIsAdding] = useState(null);

  async function handleAddTask(item) {
    setIsAdding(item.name);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          categorySlug: item.category,
          description: `Seasonal maintenance task - ${activeTab}`,
          intervalDays: 365, // Yearly
          priority: 'medium',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Added "${item.name}" as a recurring task!`);
      } else {
        alert('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task');
    } finally {
      setIsAdding(null);
    }
  }

  const seasons = ['spring', 'summer', 'fall', 'winter'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Seasonal Maintenance Checklists</h1>
        <p className="text-gray-600">
          Prepare your home for each season. Check off items as you complete them, or add them as recurring tasks to your maintenance schedule.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {seasons.map((season) => {
          const colors = SEASON_COLORS[season];
          const isActive = activeTab === season;
          return (
            <button
              key={season}
              onClick={() => setActiveTab(season)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition whitespace-nowrap ${
                isActive
                  ? `${colors.badge} ${colors.text} border-2 border-current`
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {season === 'spring' && '🌱'}
              {season === 'summer' && '☀️'}
              {season === 'fall' && '🍂'}
              {season === 'winter' && '❄️'}
              {' '}
              {season}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <SeasonTab
        season={activeTab}
        tasks={SEASONAL_TASKS[activeTab]}
        onAddTask={handleAddTask}
        isAdding={isAdding}
      />

      {/* Info box */}
      <div className="mt-8 bg-gradient-to-r from-fw-navy to-fw-navy-dark rounded-xl p-6 text-white">
        <h3 className="font-bold mb-2">Pro Tip</h3>
        <p className="text-blue-100 text-sm">
          Add seasonal tasks as recurring tasks to automatically schedule them throughout the year. This ensures you never miss important maintenance!
        </p>
      </div>
    </div>
  );
}
