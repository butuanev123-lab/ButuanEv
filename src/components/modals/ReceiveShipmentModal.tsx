import React from 'react';
import { X, CheckCircle2, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { Shipment, Part } from '../../types/inventory';

interface ReceiveShipmentModalProps {
  shipment: Shipment | null;
  parts: Part[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (shipmentId: string) => void;
}

export const ReceiveShipmentModal: React.FC<ReceiveShipmentModalProps> = ({
  shipment,
  parts,
  isOpen,
  onClose,
  onConfirmReceipt,
}) => {
  if (!isOpen || !shipment) return null;

  const handleConfirm = () => {
    onConfirmReceipt(shipment.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Confirm Shipment Receipt
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {shipment.shipmentNumber} · {shipment.supplier}
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

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Confirming this receipt will permanently mark this shipment as <strong>Received</strong> and add the incoming item quantities to your Parts Inventory catalog.
          </p>

          {/* Incoming Items Preview */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              Inventory Adjustments
            </div>
            <div className="divide-y divide-slate-100">
              {shipment.items.map((item, idx) => {
                const currentPart = parts.find((p) => p.code === item.partCode);
                const currentQty = currentPart ? currentPart.availableQty : 0;
                const newQty = currentQty + item.quantity;

                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.partName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.partCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="text-slate-500 font-mono tabular-nums">
                        {currentQty}
                      </div>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      <div className="font-mono tabular-nums font-bold text-emerald-700">
                        {newQty}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +{item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-start gap-2 border border-slate-100">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Confirm receipt to add quantities to Parts Inventory once. Received shipments are view-only.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm & Stock In
          </button>
        </div>
      </div>
    </div>
  );
};
