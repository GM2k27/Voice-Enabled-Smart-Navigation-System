"use client";

export default function PhraseTable({ phrases, onDelete }) {
  if (phrases.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-slate-400">
          No magic phrases found. Create your first phrase to enable custom voice commands.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Phrase</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action Type</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Target Location</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {phrases.map((phrase) => (
            <tr key={phrase.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-6 py-4 font-medium">{phrase.phrase}</td>
              <td className="px-6 py-4 text-sm text-slate-300 capitalize">{phrase.action_type}</td>
              <td className="px-6 py-4 text-sm text-slate-300">
                {phrase.location_name || 'N/A'}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDelete(phrase.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

