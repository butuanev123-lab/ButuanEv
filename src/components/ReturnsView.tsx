import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ReturnRecord, Part } from '../types/inventory';

interface ReturnsViewProps {
  returnsList: ReturnRecord[];
  parts: Part[];
  onAddReturn: (record: Omit<ReturnRecord, 'id' | 'code'>) => void;
  onRestockReturn: (id: string) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  returnsList,
  parts,
  onAddReturn,
  onRestockReturn,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState(parts[0]?.code || '');
  const [quantity, setQuantity] = useState(1);
  const [partner, setPartner] = useState('');
  const [type, setType] = useState<ReturnRecord['type']>('Customer Return');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const part = parts.find((p) => p.code === selectedPartCode);
    if (!part) return;

    onAddReturn({
      partCode: part.code,
      partName: part.name,
      quantity: Number(quantity),
      partner,
      type,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Awaiting Inspection',
    });

    setShowAddForm(false);
    setPartner('');
    setQuantity(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Returns & RMA Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Process customer returns and return-to-vendor RMAs with stock reconciliations.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          Create Return Log
        </button>
      </div>

      {/* Add Return Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-600" />
                New RMA / Return Log
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Return Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Customer Return')}
                    className={`py-2 text-xs font-medium rounded-lg border ${
                      type === 'Customer Return'
                        ? 'border-teal-500 bg-teal-50 text-teal-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Customer Return
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Vendor RMA')}
                    className={`py-2 text-xs font-medium rounded-lg border ${
                      type === 'Vendor RMA'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Vendor RMA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Part</label>
                <select
                  value={selectedPartCode}
                  onChange={(e) => setSelectedPartCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partner / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Dynamics Lab"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Create Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">RMA / Return Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Part</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returnsList.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {ret.code}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        ret.type === 'Customer Return'
                          ? 'bg-teal-50 text-teal-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {ret.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {ret.partName}{' '}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({ret.partCode})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {ret.quantity}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {ret.partner}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {ret.date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        ret.status === 'Restocked'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ret.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {ret.status === 'Awaiting Inspection' ? (
                      <button
                        onClick={() => onRestockReturn(ret.id)}
                        className="font-medium text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                      >
                        Approve & Restock
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Completed</span>
                    )}
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
