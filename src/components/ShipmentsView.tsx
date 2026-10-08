import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  Layers,
  ArrowRight,
  ShoppingCart,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Shipment, ShipmentStatus, PurchaseRequisition } from '../types/inventory';

interface ShipmentsViewProps {
  shipments: Shipment[];
  requisitions: PurchaseRequisition[];
  onOpenCombinedInbound: (mode?: 'shipment' | 'part') => void;
  onOpenRequisitionModal: () => void;
  onViewShipment: (shipment: Shipment) => void;
  onEditShipment: (shipment: Shipment) => void;
  onReceiveShipment: (shipment: Shipment) => void;
  onConvertRequisitionToShipment: (requisition: PurchaseRequisition) => void;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments = [],
  requisitions = [],
  onOpenCombinedInbound,
  onOpenRequisitionModal,
  onViewShipment,
  onEditShipment,
  onReceiveShipment,
  onConvertRequisitionToShipment,
}) => {
  const [mainViewMode, setMainViewMode] = useState<'shipments' | 'requisitions'>('shipments');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchesSearch =
      s.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier.toLowerCase().includes(search.toLowerCase()) ||
      (s.trackingNumber && s.trackingNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredRequisitions = requisitions.filter((r) => {
    return (
      r.requisitionNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.partName.toLowerCase().includes(search.toLowerCase()) ||
      r.partCode.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase())
    );
  });

  const pendingShipmentsCount = shipments.filter((s) => s.status === 'Pending').length;
  const receivedShipmentsCount = shipments.filter((s) => s.status === 'Received').length;
  const pendingRequisitionsCount = requisitions.filter((r) => r.status === 'Pending Approval').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Inbound & Procurement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage purchase requisitions (restock requests), track PO deliveries, and confirm dock receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRequisitionModal}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Submit a restock purchase requisition"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Purchase Requisition
          </button>
          <button
            onClick={() => onOpenCombinedInbound('shipment')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            Log Inbound / Add Part
          </button>
        </div>
      </div>

      {/* Primary Section Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setMainViewMode('shipments')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            mainViewMode === 'shipments'
              ? 'text-teal-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Inbound Shipments ({shipments.length})</span>
          {mainViewMode === 'shipments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setMainViewMode('requisitions')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            mainViewMode === 'requisitions'
              ? 'text-teal-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Requisitions / Restock ({requisitions.length})</span>
          {pendingRequisitionsCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
              {pendingRequisitionsCount} pending
            </span>
          )}
          {mainViewMode === 'requisitions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>
      </div>

      {/* VIEW 1: INBOUND SHIPMENTS */}
      {mainViewMode === 'shipments' && (
        <>
          {/* Status metric tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setFilterStatus('All')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterStatus === 'All'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Total Shipments
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums mt-1">
                {shipments.length}
              </div>
            </div>

            <div
              onClick={() => setFilterStatus('Pending')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterStatus === 'Pending'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-blue-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Pending Dock Receipt
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums mt-1">
                {pendingShipmentsCount}
              </div>
            </div>

            <div
              onClick={() => setFilterStatus('Received')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterStatus === 'Received'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-teal-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Received & Restocked
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums mt-1">
                {receivedShipmentsCount}
              </div>
            </div>
          </div>

          {/* Filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by shipment #, supplier, or tracking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter:</span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                {['All', 'Pending', 'Received'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      filterStatus === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Shipment/OR Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Expected / Received</th>
                    <th className="py-3 px-4">Items Contained</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No shipments match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((s) => {
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                            {s.shipmentNumber}
                            {s.trackingNumber && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                {s.trackingNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {s.supplier}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {s.dateReceived}
                            {s.receivedAt && (
                              <div className="text-[10px] text-emerald-600 font-sans">
                                Docked: {s.receivedAt}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {s.items.map((item, idx) => (
                                <div key={idx} className="text-slate-600">
                                  <span className="font-semibold text-slate-800 font-mono">
                                    +{item.quantity}
                                  </span>{' '}
                                  {item.partName}{' '}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({item.partCode})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                s.status === 'Pending'
                                  ? 'text-blue-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full  ${
                                  s.status === 'Pending'
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2.5 text-xs">
                              <button
                                onClick={() => onViewShipment(s)}
                                className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                              >
                                View
                              </button>
                              {s.status === 'Pending' ? (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <button
                                    onClick={() => onEditShipment(s)}
                                    className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-slate-300">·</span>
                                  <button
                                    onClick={() => onReceiveShipment(s)}
                                    className="font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                                  >
                                    Receive
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-400 italic">Received</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: PURCHASE REQUISITIONS (RESTOCK REQUESTS) */}
      {mainViewMode === 'requisitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search requisitions by PR #, part name, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <button
              onClick={onOpenRequisitionModal}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Purchase Requisition
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Requisition #</th>
                    <th className="py-3 px-4">Part / Component</th>
                    <th className="py-3 px-4">Requested Qty</th>
                    <th className="py-3 px-4">Est. Cost</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No purchase requisitions found. Click "Purchase Requisition" to request restock.
                      </td>
                    </tr>
                  ) : (
                    filteredRequisitions.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {req.requisitionNumber}
                          <div className="text-[10px] text-slate-400">
                            By {req.requestedBy} · {req.dateRequested}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {req.partName}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {req.partCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                          {req.quantity} units
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                          ${req.estimatedCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {req.supplier}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              req.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                : req.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-slate-700">
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {req.status !== 'Received' ? (
                            <button
                              onClick={() => onConvertRequisitionToShipment(req)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors flex items-center gap-1 inline-flex cursor-pointer"
                              title="Approve and convert to pending inbound delivery"
                            >
                              <Send className="w-3 h-3" />
                              Convert to Shipment
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Fulfilled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Helper Protocol Banner */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold">Procurement & Dock Protocol:</strong> Use <strong>Purchase Requisition</strong> to formally request restock for low/out-of-stock components. Once approved, convert the requisition to an <strong>Inbound Shipment</strong>. When docked, confirm receipt to increase available stock in the inventory catalog.
        </p>
      </div>
    </div>
  );
};
