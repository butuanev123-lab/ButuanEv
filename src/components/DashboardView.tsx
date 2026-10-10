import React from 'react';
import {
  Plus,
  Truck,
  ArrowRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Layers,
  ShoppingCart
} from 'lucide-react';
import { Part, Shipment, NavigationTab } from '../types/inventory';

interface DashboardViewProps {
  parts: Part[];
  shipments: Shipment[];
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenCombinedInbound: (mode?: 'shipment' | 'part') => void;
  onOpenRequisitionModal: (part?: Part) => void;
  onViewPart: (part: Part) => void;
  onEditPart: (part: Part) => void;
  onStockInPart: (part: Part) => void;
  onStockOutPart: (part: Part) => void;
  onViewShipment: (shipment: Shipment) => void;
  onEditShipment: (shipment: Shipment) => void;
  onReceiveShipment: (shipment: Shipment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  parts,
  shipments,
  onNavigateTab,
  onOpenCombinedInbound,
  onOpenRequisitionModal,
  onViewPart,
  onEditPart,
  onStockInPart,
  onStockOutPart,
  onViewShipment,
  onEditShipment,
  onReceiveShipment,
}) => {
  // Compute counts
  const totalParts = parts.length;
  const lowStockParts = parts.filter((p) => p.status === 'Low stock');
  const outOfStockParts = parts.filter((p) => p.status === 'Out of stock');
  const stockNeedingAttention = parts.filter(
    (p) => p.status === 'Out of stock' || p.status === 'Low stock'
  );
  const pendingShipments = shipments.filter((s) => s.status === 'Pending' || s.status === 'Received Partial');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header with wireframe title & combined action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Check stock levels, request replenishment, and manage inbound receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Purchase Requisition (Request Restock) */}
          <button
            onClick={() => onOpenRequisitionModal()}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Create a Purchase Requisition for depleted or low stock parts"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Purchase Requisition
          </button>

          {/* Combined Inbound / Add Part */}
          <button
            onClick={() => onOpenCombinedInbound('shipment')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-all shadow-xs hover:shadow active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            Log Inbound / Add Part
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row matching wireframe layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-b border-slate-200/80 pb-8">
        {/* Total parts */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/80 hover:border-teal-300 transition-all shadow-xs hover:shadow-sm"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total parts
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono tabular-nums mt-1 group-hover:text-teal-700 transition-colors">
            {totalParts}
          </div>
          <div className="text-[11px] text-teal-600 mt-2 font-medium flex items-center gap-1">
            <span>In catalog</span>
            <span aria-hidden="true">·</span>
            <span>All categories</span>
          </div>
        </div>

        {/* Low stock */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 transition-all shadow-xs hover:shadow-sm"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Low stock
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono tabular-nums mt-1 group-hover:text-amber-600 transition-colors">
            {lowStockParts.length}
          </div>
          <div className="text-[11px] text-amber-600 mt-2 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>&lt; 50 units remaining</span>
          </div>
        </div>

        {/* Out of stock */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/80 hover:border-rose-300 transition-all shadow-xs hover:shadow-sm"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Out of stock
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono tabular-nums mt-1 group-hover:text-rose-600 transition-colors">
            {outOfStockParts.length}
          </div>
          <div className="text-[11px] text-rose-600 mt-2 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Requires urgent restock</span>
          </div>
        </div>

        {/* Pending shipments */}
        <div
          onClick={() => onNavigateTab('shipments')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all shadow-xs hover:shadow-sm"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending shipments
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono tabular-nums mt-1 group-hover:text-blue-600 transition-colors">
            {pendingShipments.length}
          </div>
          <div className="text-[11px] text-blue-600 mt-2 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting dock receipt</span>
          </div>
        </div>
      </div>

      {/* 3. Pending receiving section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Pending receiving
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingShipments.length} shipment{pendingShipments.length === 1 ? '' : 's'} awaiting receipt
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('shipments')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all shipments</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Shipment/OR Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Date Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingShipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No pending shipments awaiting receipt.
                    </td>
                  </tr>
                ) : (
                  pendingShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {shipment.shipmentNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {shipment.supplier}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {shipment.dateReceived}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {shipment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 text-xs">
                          <button
                            onClick={() => onViewShipment(shipment)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onEditShipment(shipment)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onReceiveShipment(shipment)}
                            className="font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                          >
                            Receive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Confirm receipt to add quantities to Parts Inventory once. Received shipments are view-only.
        </p>
      </div>

      {/* 4. Stock needing attention section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Stock needing attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {stockNeedingAttention.length} parts: {outOfStockParts.length} out of stock, {lowStockParts.length} low stock
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View inventory</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Part Code</th>
                  <th className="py-3 px-4">Part Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockNeedingAttention.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      All inventory stock levels are nominal!
                    </td>
                  </tr>
                ) : (
                  stockNeedingAttention.map((part) => (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {part.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {part.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {part.category}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                        {part.availableQty}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {part.location}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            part.status === 'Out of stock'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              part.status === 'Out of stock'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {part.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2.5 text-xs">
                          <button
                            onClick={() => onViewPart(part)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onOpenRequisitionModal(part)}
                            className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-0.5"
                            title="Create restock purchase requisition"
                          >
                            Requisition
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onStockInPart(part)}
                            className="font-medium text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                          >
                            Stock In
                          </button>
                         
                          {/* <button
                            onClick={() => onStockOutPart(part)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            Stock Out
                          </button> */}
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onEditPart(part)}
                            className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Low stock: fewer than 50 units
        </p>
      </div>
    </div>
  );
};
