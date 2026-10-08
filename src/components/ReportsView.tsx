import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingDown,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Part, Shipment } from '../types/inventory';

interface ReportsViewProps {
  parts: Part[];
  shipments: Shipment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ parts, shipments }) => {
  const totalStockUnits = parts.reduce((acc, p) => acc + p.availableQty, 0);
  const totalValuation = parts.reduce((acc, p) => acc + p.availableQty * p.unitPrice, 0);

  const categories = Array.from(new Set(parts.map((p) => p.category)));
  const categoryStats = categories.map((cat) => {
    const catParts = parts.filter((p) => p.category === cat);
    const units = catParts.reduce((acc, p) => acc + p.availableQty, 0);
    const value = catParts.reduce((acc, p) => acc + p.availableQty * p.unitPrice, 0);
    return {
      category: cat,
      partCount: catParts.length,
      units,
      value,
    };
  });

  const lowStockItems = parts.filter((p) => p.availableQty <= p.minStockThreshold);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Inventory Analytics & Valuation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Financial asset assessment, category stock distribution, and automated reorder replenishment forecast.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Inventory Book Value
          </div>
          <div className="text-3xl font-bold text-teal-800 font-mono tabular-nums mt-1">
            ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Weighted across {totalStockUnits.toLocaleString()} units on hand
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Replenishment Capital Needed
          </div>
          <div className="text-3xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            ${lowStockItems
              .reduce((acc, p) => acc + (p.minStockThreshold * 2 - p.availableQty) * p.unitPrice, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            To bring {lowStockItems.length} low-stock items back to safe buffer
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Stock Turnover
          </div>
          <div className="text-3xl font-bold text-blue-700 font-mono tabular-nums mt-1">
            4.8x <span className="text-xs font-normal text-slate-400">/ yr</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Standard velocity for precision engineering parts
          </p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Category Distribution & Capital Allocation
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Catalog SKUs</th>
                <th className="py-3 px-4">Units on Hand</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4 text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryStats.map((item) => {
                const sharePercent = totalValuation > 0 ? (item.value / totalValuation) * 100 : 0;

                return (
                  <tr key={item.category} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.partCount}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {item.units.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-teal-800 tabular-nums">
                      ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {sharePercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder Recommendation Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Automated Reorder Plan (Critical Items)
          </h3>
          <span className="text-xs text-amber-700 font-medium">
            {lowStockItems.length} items needing purchase orders
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Part Name</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Safety Threshold</th>
                <th className="py-3 px-4">Recommended Reorder Qty</th>
                <th className="py-3 px-4 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockItems.map((p) => {
                const targetOrder = Math.max(10, p.minStockThreshold * 2 - p.availableQty);
                const estCost = targetOrder * p.unitPrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {p.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 tabular-nums">
                      {p.availableQty}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                      {p.minStockThreshold}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-teal-700 tabular-nums">
                      +{targetOrder} units
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ${estCost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
