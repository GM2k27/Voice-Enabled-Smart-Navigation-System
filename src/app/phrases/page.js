"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import PhraseModal from '@/components/PhraseModal';
import PhraseTable from '@/components/PhraseTable';

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [phrasesResult, locationsResult] = await Promise.all([
        api.getPhrases(),
        api.getLocations(),
      ]);
      setPhrases(phrasesResult.data || []);
      setLocations(locationsResult.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this magic phrase?')) {
      return;
    }

    try {
      await api.deletePhrase(id);
      toast.success('Magic phrase deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete magic phrase');
    }
  };

  const handleSave = async (phraseData) => {
    try {
      await api.createPhrase(phraseData);
      toast.success('Magic phrase created successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save magic phrase');
    }
  };

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="min-h-screen px-4 py-10">
        <div className="glass-panel mx-auto max-w-7xl rounded-[32px] p-10 text-white">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Magic Phrase Management</h1>
            <p className="mt-2 text-sm text-slate-300">
              Create custom voice commands that trigger navigation to specific locations
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            + Add Phrase
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading magic phrases...</div>
          </div>
        ) : (
          <PhraseTable phrases={phrases} onDelete={handleDelete} />
        )}

        {isModalOpen && (
          <PhraseModal
            locations={locations}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        )}
        </div>
      </div>
    </Layout>
  );
}

