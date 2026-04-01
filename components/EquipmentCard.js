'use client';

import { useState, useEffect } from 'react';

export default function EquipmentCard({ categorySlug }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    install_date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [categorySlug]);

  async function fetchEquipment() {
    try {
      const res = await fetch(`/api/equipment?categorySlug=${categorySlug}`);
      const data = await res.json();
      if (data.equipment) {
        setEquipment(data.equipment);
        setFormData({
          make: data.equipment.make || '',
          model: data.equipment.model || '',
          install_date: data.equipment.install_date || '',
          notes: data.equipment.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!equipment) return;
    setSaving(true);
    try {
      const res = await fetch('/api/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: equipment.id,
          ...formData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEquipment(data.equipment);
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save equipment:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 animate-pulse h-24">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (!equipment) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
      {!editing ? (
        // View mode
        <div>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Equipment Profile</h3>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-fw-navy hover:underline font-medium"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {equipment.make && (
              <div>
                <p className="text-gray-500 text-xs font-medium">Make</p>
                <p className="text-gray-800 font-medium">{equipment.make}</p>
              </div>
            )}
            {equipment.model && (
              <div>
                <p className="text-gray-500 text-xs font-medium">Model</p>
                <p className="text-gray-800 font-medium">{equipment.model}</p>
              </div>
            )}
            {equipment.install_date && (
              <div>
                <p className="text-gray-500 text-xs font-medium">Install Date</p>
                <p className="text-gray-800 font-medium">
                  {new Date(equipment.install_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {equipment.notes && (
              <div className="md:col-span-4">
                <p className="text-gray-500 text-xs font-medium">Notes</p>
                <p className="text-gray-700 text-sm">{equipment.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit mode
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Edit Equipment</h3>
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  placeholder="Manufacturer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  placeholder="Model number"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Install Date</label>
              <input
                type="date"
                value={formData.install_date}
                onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none resize-none"
                placeholder="Equipment notes..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  make: equipment.make || '',
                  model: equipment.model || '',
                  install_date: equipment.install_date || '',
                  notes: equipment.notes || '',
                });
              }}
              disabled={saving}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-3 py-2 bg-fw-navy text-white rounded-lg text-sm font-medium hover:bg-fw-navy-light transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
