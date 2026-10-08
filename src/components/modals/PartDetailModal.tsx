import React, { useState, useEffect } from 'react';
import { X, Package, Edit3, Check, MapPin, Tag, DollarSign, Clock } from 'lucide-react';
import { Part } from '../../types/inventory';

interface PartDetailModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePart?: (updated: Part) => void;
  initialEditMode?: boolean;
}

export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  part,
  isOpen,
  onClose,
  onSavePart,
  initialEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState<Part | null>(part);

  useEffect(() => {
    setFormData(part);
    setIsEditing(initialEditMode);
  }, [part, initialEditMode]);

  if (!isOpen || !part || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePart && formData) {
      onSavePart(formData);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                  {part.code}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    part.status === 'Out of stock'
                      ? 'bg-rose-50 text-rose-700'
                      : part.status === 'Low stock'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {part.status}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{part.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && onSavePart && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title="Edit Part"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Part Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bin Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Qty</label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableQty}
                  onChange={(e) => setFormData({ ...formData, availableQty: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStockThreshold}
                  onChange={(e) => setFormData({ ...formData, minStockThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Spec</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <div className="text-[11px] text-slate-400">Available Qty</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  {part.availableQty}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Safety Buffer</div>
                <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">
                  {part.minStockThreshold}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Location</div>
                <div className="text-xl font-bold font-mono text-teal-700 mt-0.5">
                  {part.location}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Unit Price</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  ${part.unitPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Category:</span>{' '}
                  <span className="text-slate-600">{part.category}</span>
                </div>
              </div>

              {part.description && (
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Specification:</span>{' '}
                    <span className="text-slate-600">{part.description}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Last Audited:</span>{' '}
                  <span className="text-slate-600">{part.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
