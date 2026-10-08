import React, { useState } from 'react';
import { X, Truck, Edit3, Calendar, Building2, Package, CheckCircle2, Clock } from 'lucide-react';
import { Shipment, ShipmentItem, Part } from '../../types/inventory';

interface ShipmentDetailModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveShipment?: (updated: Shipment) => void;
  onReceiveShipment?: (shipment: Shipment) => void;
  initialEditMode?: boolean;
  parts: Part[];
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onSaveShipment,
  onReceiveShipment,
  initialEditMode = false,
  parts,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [supplier, setSupplier] = useState(shipment?.supplier || '');
  const [dateReceived, setDateReceived] = useState(shipment?.dateReceived || '');
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber || '');
  const [notes, setNotes] = useState(shipment?.notes || '');

  if (!isOpen || !shipment) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveShipment) {
      onSaveShipment({
        ...shipment,
        supplier,
        dateReceived,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
      });
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
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                  {shipment.shipmentNumber}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    shipment.status === 'Pending'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {shipment.status}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{shipment.supplier}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && shipment.status === 'Pending' && onSaveShipment && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title="Edit Shipment"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Date</label>
              <input
                type="text"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Shipment
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Supplier: <strong className="text-slate-800">{shipment.supplier}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date: <strong className="text-slate-800">{shipment.dateReceived}</strong></span>
              </div>
              {shipment.trackingNumber && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-mono text-slate-400">#</span>
                  <span>Tracking: <strong className="text-slate-800 font-mono">{shipment.trackingNumber}</strong></span>
                </div>
              )}
              {shipment.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-xs border border-slate-100">
                  {shipment.notes}
                </div>
              )}
            </div>

            {/* Items contained */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-700">Contained Line Items</div>
              <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {shipment.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <div className="font-medium text-slate-800">{item.partName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.partCode}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      +{item.quantity} units
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {shipment.status === 'Pending' && onReceiveShipment ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReceiveShipment(shipment);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Receive Shipment Now
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Received shipments are view-only.</span>
              )}
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
