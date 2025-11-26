"use client";

export default function LocationTable({ locations, onEdit, onDelete }) {
  if (locations.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-slate-400">No locations found. Create your first location to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Coordinates</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tags</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Notes</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-6 py-4 font-medium">{location.location_name}</td>
              <td className="px-6 py-4 text-sm text-slate-300">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {location.tags && location.tags.length > 0 ? (
                    location.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No tags</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {location.notes || '-'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(location)}
                    className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(location.id)}
                    className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

