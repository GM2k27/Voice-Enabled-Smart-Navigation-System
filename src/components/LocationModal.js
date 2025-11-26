"use client";

import { useState, useEffect } from 'react';

export default function LocationModal({ location, onClose, onSave }) {
  const [formData, setFormData] = useState({
    location_name: '',
    latitude: '',
    longitude: '',
    tags: [],
    notes: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (location) {
      setFormData({
        location_name: location.location_name || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        tags: location.tags || [],
        notes: location.notes || '',
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 text-white">
        <h2 className="mb-6 text-2xl font-semibold">
          {location ? 'Edit Location' : 'Add New Location'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Location Name *
            </label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Latitude * (-90 to 90)
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                min="-90"
                max="90"
                step="any"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Longitude * (-180 to 180)
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                min="-180"
                max="180"
                step="any"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Tags
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-emerald-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
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
              className="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white hover:bg-emerald-600"
            >
              {location ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

