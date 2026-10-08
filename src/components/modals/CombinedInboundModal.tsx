import React, { useState } from 'react';
import { X, Truck, Package, Plus, Trash2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Shipment, ShipmentItem, Part } from '../../types/inventory';

interface CombinedInboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  onAddPart: (part: Omit<Part, 'id' | 'status' | 'lastUpdated'>) => Part;
  onAddShipment: (shipment: Omit<Shipment, 'id'>, autoReceive?: boolean) => void;
  existingShipmentCount: number;
  initialMode?: 'shipment' | 'part';
}

export const CombinedInboundModal: React.FC<CombinedInboundModalProps> = ({
  isOpen,
  onClose,
  parts,
  onAddPart,
  onAddShipment,
  existingShipmentCount,
  initialMode = 'shipment',
}) => {
  const [activeTab, setActiveTab] = useState<'shipment' | 'part'>(initialMode);

  // Inbound Shipment state
  const [shipmentNumber, setShipmentNumber] = useState(`SHP-03${22 + existingShipmentCount}`);
  const [supplier, setSupplier] = useState('');
  const [dateReceived, setDateReceived] = useState('09 Oct 2026');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiveImmediately, setReceiveImmediately] = useState(false);
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([
    {
      partCode: parts[0]?.code || 'PRT-001',
      partName: parts[0]?.name || 'Hex Bolt M8x30',
      quantity: 50,
    },
  ]);

  // Inline "New Part" modal/inline form within shipment
  const [showInlineNewPart, setShowInlineNewPart] = useState(false);
  const [newPartCode, setNewPartCode] = useState(`PRT-00${parts.length + 1}`);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState('Fasteners');
  const [newPartThreshold, setNewPartThreshold] = useState(50);
  const [newPartLocation, setNewPartLocation] = useState('A-02');
  const [newPartPrice, setNewPartPrice] = useState(2.5);

  // Direct Add Part standalone form state
  const [standaloneCode, setStandaloneCode] = useState(`PRT-00${parts.length + 1}`);
  const [standaloneName, setStandaloneName] = useState('');
  const [standaloneCategory, setStandaloneCategory] = useState('Fasteners');
  const [standaloneQty, setStandaloneQty] = useState(0);
  const [standaloneThreshold, setStandaloneThreshold] = useState(50);
  const [standaloneLocation, setStandaloneLocation] = useState('A-01');
  const [standalonePrice, setStandalonePrice] = useState(1.0);
  const [standaloneDesc, setStandaloneDesc] = useState('');

  if (!isOpen) return null;

  // Handle adding line item
  const handleAddLineItem = () => {
    const defaultPart = parts[0] || { code: 'PRT-001', name: 'Default Part' };
    setShipmentItems([
      ...shipmentItems,
      {
        partCode: defaultPart.code,
        partName: defaultPart.name,
        quantity: 25,
      },
    ]);
  };

  const handleRemoveLineItem = (idx: number) => {
    setShipmentItems(shipmentItems.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, partCode: string, qty: number) => {
    if (partCode === '__CREATE_NEW__') {
      setShowInlineNewPart(true);
      return;
    }
    const found = parts.find((p) => p.code === partCode);
    const updated = [...shipmentItems];
    updated[idx] = {
      partCode,
      partName: found ? found.name : partCode,
      quantity: Math.max(1, qty),
    };
    setShipmentItems(updated);
  };

  // Inline Part Creation
  const handleSaveInlinePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const created = onAddPart({
      code: newPartCode.trim().toUpperCase(),
      name: newPartName.trim(),
      category: newPartCategory,
      availableQty: 0,
      minStockThreshold: Number(newPartThreshold),
      location: newPartLocation.trim().toUpperCase(),
      unitPrice: Number(newPartPrice),
    });

    // Automatically append to shipment line items
    setShipmentItems([
      ...shipmentItems,
      {
        partCode: created.code,
        partName: created.name,
        quantity: 20,
      },
    ]);

    setShowInlineNewPart(false);
    setNewPartName('');
  };

  // Submit Shipment
  const handleSubmitShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || shipmentItems.length === 0) return;

    onAddShipment(
      {
        shipmentNumber: shipmentNumber.trim().toUpperCase(),
        supplier: supplier.trim(),
        dateReceived: dateReceived.trim(),
        status: receiveImmediately ? 'Received' : 'Pending',
        items: shipmentItems,
        trackingNumber: trackingNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      receiveImmediately
    );

    onClose();
  };

  // Submit Standalone Part
  const handleSubmitStandalonePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standaloneName.trim()) return;

    onAddPart({
      code: standaloneCode.trim().toUpperCase(),
      name: standaloneName.trim(),
      category: standaloneCategory,
      availableQty: Number(standaloneQty),
      minStockThreshold: Number(standaloneThreshold),
      location: standaloneLocation.trim().toUpperCase(),
      unitPrice: Number(standalonePrice),
      description: standaloneDesc.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Combined Mode Switcher */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              {activeTab === 'shipment' ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Inbound Receiving & Catalog Entry
              </h2>
              <p className="text-xs text-slate-500">
                Log inbound shipments, register new components, and update stock
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 bg-white shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('shipment')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipment'
                ? 'bg-blue-50 text-blue-800 border border-blue-200/80'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Inbound Shipment (PO Receiving)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('part')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'part'
                ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Add Part to Catalog Directly
          </button>
        </div>

        {/* TAB 1: INBOUND SHIPMENT WITH INLINE PART REGISTRATION */}
        {activeTab === 'shipment' && (
          <form onSubmit={handleSubmitShipment} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shipment / PO Number
                </label>
                <input
                  type="text"
                  required
                  value={shipmentNumber}
                  onChange={(e) => setShipmentNumber(e.target.value)}
                  placeholder="e.g. SHP-0322"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Metro Industrial Supply"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected / Dock Date
                </label>
                <input
                  type="text"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  placeholder="e.g. 09 Oct 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Waybill / Tracking #
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK-88210-EXP"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>
            </div>

            {/* Line Items with Inline New Part button */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Shipment Line Items
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Select existing parts or register brand-new parts right into this shipment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInlineNewPart(true)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    New Part SKU
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add Line
                  </button>
                </div>
              </div>

              {/* Inline Part Subform modal */}
              {showInlineNewPart && (
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-teal-700" />
                      Register New Part Directly to Shipment & Catalog
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInlineNewPart(false)}
                      className="text-teal-700 hover:text-teal-900 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Part Code</label>
                      <input
                        type="text"
                        value={newPartCode}
                        onChange={(e) => setNewPartCode(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-teal-300 rounded font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Part Name</label>
                      <input
                        type="text"
                        placeholder="e.g. EV Inverter Heat Sink"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-teal-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Category</label>
                      <select
                        value={newPartCategory}
                        onChange={(e) => setNewPartCategory(e.target.value)}
                        className="w-full px-1.5 py-1 text-xs bg-white border border-teal-300 rounded"
                      >
                        <option value="Fasteners">Fasteners</option>
                        <option value="Bearings">Bearings</option>
                        <option value="Belts">Belts</option>
                        <option value="Motors">Motors</option>
                        <option value="Seals">Seals</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Batteries">Batteries</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Location</label>
                      <input
                        type="text"
                        value={newPartLocation}
                        onChange={(e) => setNewPartLocation(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-teal-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Safety Buffer</label>
                      <input
                        type="number"
                        value={newPartThreshold}
                        onChange={(e) => setNewPartThreshold(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-white border border-teal-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-teal-800 mb-0.5">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPartPrice}
                        onChange={(e) => setNewPartPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-white border border-teal-300 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInlineNewPart(false)}
                      className="px-2.5 py-1 text-xs text-teal-800 hover:bg-teal-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInlinePart}
                      className="px-3 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded shadow-xs"
                    >
                      Save & Add to Shipment
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {shipmentItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <select
                      value={item.partCode}
                      onChange={(e) => handleLineItemChange(idx, e.target.value, item.quantity)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {parts.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name} (Stock: {p.availableQty})
                        </option>
                      ))}
                      <option value="__CREATE_NEW__">+ Register brand new part...</option>
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, item.partCode, Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono tabular-nums text-center"
                      />
                    </div>

                    {shipmentItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox: Immediately restock into inventory? */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-blue-900 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={receiveImmediately}
                    onChange={(e) => setReceiveImmediately(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Mark as Received & Restock Inventory Immediately
                </label>
                <p className="text-[11px] text-blue-600 ml-5">
                  If already docked, increases quantities in catalog now rather than keeping in pending queue.
                </p>
              </div>
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
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5 text-teal-400" />
                {receiveImmediately ? 'Confirm & Receive Inbound' : 'Save Inbound Shipment'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DIRECT CATALOG PART REGISTRATION */}
        {activeTab === 'part' && (
          <form onSubmit={handleSubmitStandalonePart} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Part Code / SKU</label>
                <input
                  type="text"
                  required
                  value={standaloneCode}
                  onChange={(e) => setStandaloneCode(e.target.value)}
                  placeholder="e.g. PRT-009"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={standaloneCategory}
                  onChange={(e) => setStandaloneCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                >
                  <option value="Fasteners">Fasteners</option>
                  <option value="Bearings">Bearings</option>
                  <option value="Belts">Belts</option>
                  <option value="Motors">Motors</option>
                  <option value="Seals">Seals</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Batteries">Batteries & Power</option>
                  <option value="Raw Materials">Raw Materials</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Part Name</label>
              <input
                type="text"
                required
                value={standaloneName}
                onChange={(e) => setStandaloneName(e.target.value)}
                placeholder="e.g. High Torque Electric Motor Hub"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Qty</label>
                <input
                  type="number"
                  min="0"
                  value={standaloneQty}
                  onChange={(e) => setStandaloneQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={standaloneThreshold}
                  onChange={(e) => setStandaloneThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bin Location</label>
                <input
                  type="text"
                  required
                  value={standaloneLocation}
                  onChange={(e) => setStandaloneLocation(e.target.value)}
                  placeholder="e.g. B-04"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={standalonePrice}
                  onChange={(e) => setStandalonePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specification Note</label>
                <input
                  type="text"
                  value={standaloneDesc}
                  onChange={(e) => setStandaloneDesc(e.target.value)}
                  placeholder="e.g. ISO 9001 certified OEM component"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
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
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Package className="w-3.5 h-3.5" />
                Add Part to Catalog
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
