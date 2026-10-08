import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertTriangle, Clock, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { Part, PurchaseRequisition, RequisitionPriority } from '../../types/inventory';

interface PurchaseRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  selectedPart?: Part | null;
  onSaveRequisition: (requisition: Omit<PurchaseRequisition, 'id' | 'requisitionNumber' | 'dateRequested'>) => void;
  existingCount: number;
}

export const PurchaseRequisitionModal: React.FC<PurchaseRequisitionModalProps> = ({
  isOpen,
  onClose,
  parts,
  selectedPart,
  onSaveRequisition,
  existingCount,
}) => {
  const [partCode, setPartCode] = useState(selectedPart?.code || parts[0]?.code || 'PRT-001');
  const [quantity, setQuantity] = useState(50);
  const [supplier, setSupplier] = useState('Metro Industrial Supply');
  const [priority, setPriority] = useState<RequisitionPriority>('Normal');
  const [justification, setJustification] = useState('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('14 Oct 2026');
  const [requestedBy, setRequestedBy] = useState('J. Miller');

  // When selectedPart changes, update state
  useEffect(() => {
    if (selectedPart) {
      setPartCode(selectedPart.code);
      const suggested = Math.max(10, selectedPart.minStockThreshold * 2 - selectedPart.availableQty);
      setQuantity(suggested);
      setPriority(selectedPart.availableQty === 0 ? 'Urgent' : selectedPart.availableQty < selectedPart.minStockThreshold ? 'High' : 'Normal');
      setJustification(
        selectedPart.availableQty === 0
          ? `Urgent replenishment: part is out of stock (0 on hand, safety buffer ${selectedPart.minStockThreshold}).`
          : `Restock to replenish below safety threshold (${selectedPart.availableQty} units on hand vs ${selectedPart.minStockThreshold} threshold).`
      );
    }
  }, [selectedPart]);

  if (!isOpen) return null;

  const currentPart = parts.find((p) => p.code === partCode) || parts[0];
  const estimatedCost = currentPart ? currentPart.unitPrice * quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPart || quantity <= 0) return;

    onSaveRequisition({
      partCode: currentPart.code,
      partName: currentPart.name,
      quantity: Number(quantity),
      estimatedCost,
      supplier,
      priority,
      status: 'Pending Approval',
      requestedBy,
      justification: justification.trim() || `Replenishment order for ${currentPart.name}`,
      targetDeliveryDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Purchase Requisition
                </h2>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded font-mono">
                  Restock Request
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Formal procurement request to replenish depleted inventory
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Part Selection & Current State Badge */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Component / Part
            </label>
            <select
              value={partCode}
              onChange={(e) => {
                const code = e.target.value;
                setPartCode(code);
                const found = parts.find((p) => p.code === code);
                if (found) {
                  const suggested = Math.max(10, found.minStockThreshold * 2 - found.availableQty);
                  setQuantity(suggested);
                  setPriority(found.availableQty === 0 ? 'Urgent' : found.availableQty < found.minStockThreshold ? 'High' : 'Normal');
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
            >
              {parts.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} - {p.name} ({p.availableQty} in stock · min: {p.minStockThreshold})
                </option>
              ))}
            </select>
          </div>

          {/* Real-time stock status preview */}
          {currentPart && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">On Hand</span>
                <div className={`font-mono font-bold text-sm ${
                  currentPart.availableQty === 0 ? 'text-rose-600' : currentPart.availableQty < currentPart.minStockThreshold ? 'text-amber-600' : 'text-slate-900'
                }`}>
                  {currentPart.availableQty} units
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Safety Buffer</span>
                <div className="font-mono text-sm text-slate-700">
                  {currentPart.minStockThreshold} units
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Unit Cost</span>
                <div className="font-mono text-sm text-slate-700">
                  ${currentPart.unitPrice.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Estimated Requisition Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Total PO Cost
              </label>
              <div className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono font-bold text-teal-800">
                ${estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Supplier & Target Delivery Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Supplier
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Metro Industrial Supply"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required By Date
              </label>
              <input
                type="text"
                required
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                placeholder="e.g. 14 Oct 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procurement Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Urgent', 'High', 'Normal'] as RequisitionPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    priority === p
                      ? p === 'Urgent'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                        : p === 'High'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                        : 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requisition Justification / Reason
            </label>
            <textarea
              rows={2}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Stock fell below buffer; upcoming production line run requires 40 units."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Submit Purchase Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
