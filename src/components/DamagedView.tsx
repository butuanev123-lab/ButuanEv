import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { DamagedRecord, Part } from '../types/inventory';

interface DamagedViewProps {
  damagedList: DamagedRecord[];
  parts: Part[];
  onAddDamaged: (record: Omit<DamagedRecord, 'id' | 'code'>) => void;
  onUpdateDisposition: (id: string, disposition: DamagedRecord['disposition']) => void;
}

export const DamagedView: React.FC<DamagedViewProps> = ({
  damagedList,
  parts,
  onAddDamaged,
  onUpdateDisposition,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState(parts[0]?.code || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [reportedBy, setReportedBy] = useState('J. Miller');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const part = parts.find((p) => p.code === selectedPartCode);
    if (!part) return;

    onAddDamaged({
      partCode: part.code,
      partName: part.name,
      quantity: Number(quantity),
      reason,
      dateReported: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportedBy,
      disposition: 'Under Inspection',
    });

    setShowAddForm(false);
    setReason('');
    setQuantity(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Damaged & Quarantine Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log parts damaged in transit or handling, conduct quarantine inspections, and record dispositions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Damaged Item
        </button>
      </div>

      {/* Add Damaged Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Log Defective / Damaged Stock
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Part</label>
                <select
                  value={selectedPartCode}
                  onChange={(e) => setSelectedPartCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {parts.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name} (Available: {p.availableQty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Damaged Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Reason & Failure Details</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Dropped during forklift transfer, packaging punctured..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector / Reporter</label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Damaged Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Part Details</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Reason / Failure Description</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4">Disposition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {damagedList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {item.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.partName}{' '}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({item.partCode})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    {item.reason}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {item.dateReported} · {item.reportedBy}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.disposition === 'Scrapped'
                          ? 'bg-slate-100 text-slate-700'
                          : item.disposition === 'RMA Return'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.disposition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 text-xs">
                      {item.disposition === 'Under Inspection' && (
                        <>
                          <button
                            onClick={() => onUpdateDisposition(item.id, 'Scrapped')}
                            className="text-slate-600 hover:text-slate-900 hover:underline"
                          >
                            Mark Scrapped
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onUpdateDisposition(item.id, 'RMA Return')}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Send RMA
                          </button>
                        </>
                      )}
                      {item.disposition !== 'Under Inspection' && (
                        <span className="text-slate-400 italic">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
