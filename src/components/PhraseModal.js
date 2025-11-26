"use client";

import { useState } from 'react';

export default function PhraseModal({ locations, onClose, onSave }) {
  const [formData, setFormData] = useState({
    phrase: '',
    action_type: 'navigate',
    target_location_id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.phrase.trim() || !formData.target_location_id) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 text-white">
        <h2 className="mb-6 text-2xl font-semibold">Add New Magic Phrase</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Phrase * (exact match for voice command)
            </label>
            <input
              type="text"
              name="phrase"
              value={formData.phrase}
              onChange={handleChange}
              required
              placeholder="e.g., take me home"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              This phrase will be matched exactly (case-insensitive) when spoken
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Action Type *
            </label>
            <select
              name="action_type"
              value={formData.action_type}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="navigate">Navigate</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Target Location *
            </label>
            <select
              name="target_location_id"
              value={formData.target_location_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Select a location...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.location_name}
                </option>
              ))}
            </select>
            {locations.length === 0 && (
              <p className="mt-1 text-xs text-red-400">
                No locations available. Please create a location first.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-2 font-medium text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={locations.length === 0}
              className="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

