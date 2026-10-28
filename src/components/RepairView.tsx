import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  ArrowRight,
  CheckCircle,
  User,
} from 'lucide-react';
import { Part, RepairRecord } from '../types/inventory';

interface RepairViewProps {
  repairsList: RepairRecord[];
  parts: Part[];
  onAddRepair: (record: Omit<RepairRecord, 'id' | 'code'>) => void;
  onUpdateRepairStatus: (id: string, status: RepairRecord['status']) => void;
}

export const RepairView: React.FC<RepairViewProps> = ({
  repairsList,
  parts,
  onAddRepair,
  onUpdateRepairStatus,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState(parts[0]?.code || '');
  const [issue, setIssue] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [warranty, setWarranty] = useState<RepairRecord['warranty']>('Out of Warranty');
  const [technician, setTechnician] = useState('J. Miller');

  const numberValue = (value: string): number | '' =>
    value === '' ? '' : Math.max(1, Number(value) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const part = parts.find((p) => p.code === selectedPartCode);
    if (!part || !issue.trim()) return;

    onAddRepair({
      partCode: part.code,
      partName: part.name,
      quantity: Number(quantity),
      issue: issue.trim(),
      status: 'Awaiting Repair',
      dateReported: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      reportedBy: technician,
      warranty,
    });

    setShowAddForm(false);
    setIssue('');
    setQuantity(1);
    setWarranty('Out of Warranty');
    setTechnician('J. Miller');
  };

  const awaitingCount = repairsList.filter((r) => r.status === 'Awaiting Repair').length;
  const inRepairCount = repairsList.filter((r) => r.status === 'In Repair').length;
  const completedCount = repairsList.filter((r) => r.status === 'Completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Repair & Service Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track parts sent for repair, monitor service progress, and manage warranty claims.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-300" />
          Log Repair Job
        </button>
      </div>

      {/* Stats tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl border border-amber-200 bg-amber-50/60"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 opacity-90">
            Awaiting Repair
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-amber-800">
            {awaitingCount}
          </div>
        </div>
        <div
          className="p-4 rounded-xl border border-blue-200 bg-blue-50/60"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 opacity-90">
            In Repair
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-blue-800">
            {inRepairCount}
          </div>
        </div>
        <div
          className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 opacity-90">
            Completed
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-emerald-800">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Add Repair Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-amber-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                New Repair Job
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Part</label>
                  <select
                    value={selectedPartCode}
                    onChange={(e) => setSelectedPartCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {parts.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(numberValue(e.target.value) as number)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fault / Issue Description</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. Motor stalling under load, encoder signal intermittent..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warranty Status</label>
                  <select
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value as RepairRecord['warranty'])}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="In Warranty">In Warranty</option>
                    <option value="Out of Warranty">Out of Warranty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="e.g. J. Miller"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Create Repair Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repairs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Repair Code</th>
                <th className="py-3 px-4">Part</th>
                <th className="py-3 px-4">Issue / Fault</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repairsList.map((repair) => (
                <tr key={repair.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {repair.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {repair.partName}{' '}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({repair.partCode})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    {repair.issue}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {repair.quantity}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        repair.status === 'Awaiting Repair'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : repair.status === 'In Repair'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : repair.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                      } border`}
                    >
                      {repair.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {repair.dateReported}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {repair.technician || '-'}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 text-xs">
                      {repair.status === 'Awaiting Repair' && (
                        <button
                          onClick={() => onUpdateRepairStatus(repair.id, 'In Repair')}
                          className="font-medium text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                        >
                          Start Repair
                        </button>
                      )}
                      {repair.status === 'In Repair' && (
                        <>
                          <button
                            onClick={() => onUpdateRepairStatus(repair.id, 'Completed')}
                            className="font-medium text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                          >
                            Mark Complete
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onUpdateRepairStatus(repair.id, 'Returned')}
                            className="font-medium text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            Returned
                          </button>
                        </>
                      )}
                      {(repair.status === 'Completed' || repair.status === 'Returned') && (
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
