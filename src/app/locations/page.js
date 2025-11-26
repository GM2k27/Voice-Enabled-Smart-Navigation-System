"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import LocationModal from '@/components/LocationModal';
import LocationTable from '@/components/LocationTable';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const result = await api.searchLocations(searchQuery);
      setLocations(result.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      await api.deleteLocation(id);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      toast.error(error.message || 'Failed to delete location');
    }
  };

  const handleSave = async (locationData) => {
    try {
      if (editingLocation) {
        await api.updateLocation(editingLocation.id, locationData);
        toast.success('Location updated successfully');
      } else {
        await api.createLocation(locationData);
        toast.success('Location created successfully');
      }
      setIsModalOpen(false);
      setEditingLocation(null);
      fetchLocations();
    } catch (error) {
      toast.error(error.message || 'Failed to save location');
    }
  };

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="min-h-screen px-4 py-10">
        <div className="glass-panel mx-auto max-w-7xl rounded-[32px] p-10 text-white">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Location Management</h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your saved locations for voice navigation
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            + Add Location
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search locations by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading locations...</div>
          </div>
        ) : (
          <LocationTable
            locations={locations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {isModalOpen && (
          <LocationModal
            location={editingLocation}
            onClose={() => {
              setIsModalOpen(false);
              setEditingLocation(null);
            }}
            onSave={handleSave}
          />
        )}
        </div>
      </div>
    </Layout>
  );
}

