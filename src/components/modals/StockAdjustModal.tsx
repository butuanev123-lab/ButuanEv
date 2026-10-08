import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Package } from 'lucide-react';
import { Part } from '../../types/inventory';

interface StockAdjustModalProps {
  part: Part | null;
  parts?: Part[];
  mode: 'in' | 'out';
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (partId: string, delta: number, reason: string, issuedTo?: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  part,
  parts = [],
  mode,
  isOpen,
  onClose,
  onAdjust,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string>(part?.id || parts[0]?.id || '');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState(
    mode === 'in' ? 'Manual stock arrival / count audit' : 'Assembly Line 1 - EV Traction Drive Build'
  );
  const [issuedTo, setIssuedTo] = useState('Powertrain Assembly Unit');

  React.useEffect(() => {
    if (part) {
      setSelectedPartId(part.id);
    } else if (parts.length > 0) {
      setSelectedPartId(parts[0].id);
    }
  }, [part, parts]);

  if (!isOpen) return null;

  const activePart = part || parts.find((p) => p.id === selectedPartId) || null;
  if (!activePart) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const delta = mode === 'in' ? amount : -amount;
    onAdjust(activePart.id, delta, reason, issuedTo);
    onClose();
  };

  const resultingQty =
    mode === 'in'
      ? activePart.availableQty + amount
      : Math.max(0, activePart.availableQty - amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${
            mode === 'in' ? 'bg-teal-50/70' : 'bg-blue-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'in'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {mode === 'in' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {mode === 'in' ? 'Stock In (Add Quantity)' : 'Stock Out (Issue & Deduct)'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {activePart.code} · {activePart.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!part && parts.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Part to Issue
              </label>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.availableQty} units on hand)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Available Stock:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums text-sm">
              {activePart.availableQty} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to {mode === 'in' ? 'Add' : 'Issue / Deduct'}
            </label>
            <input
              type="number"
              min="1"
              max={mode === 'out' ? activePart.availableQty : undefined}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              required
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Projected Resulting Qty:</span>
            <span
              className={`font-mono font-bold text-sm ${
                mode === 'in' ? 'text-teal-700' : 'text-slate-900'
              }`}
            >
              {resultingQty} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'in' ? 'Adjustment Reason' : 'Stock Out Reason (Purpose)'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Assembly Line 1, Maintenance, Customer Order..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          {mode === 'out' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issued To (Department / Work Order / Tech)
              </label>
              <input
                type="text"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                placeholder="e.g. Powertrain Assembly Unit"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                mode === 'in'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm {mode === 'in' ? 'Stock In' : 'Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
