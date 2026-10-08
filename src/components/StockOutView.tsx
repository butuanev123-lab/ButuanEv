import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  Package,
  Plus,
  Clock,
  Printer,
  FileText,
  User,
  Tag
} from 'lucide-react';
import { StockOutRecord, Part } from '../types/inventory';

interface StockOutViewProps {
  stockOutList: StockOutRecord[];
  parts: Part[];
  onOpenStockOutModal: (part?: Part) => void;
}

export const StockOutView: React.FC<StockOutViewProps> = ({
  stockOutList,
  parts,
  onOpenStockOutModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<StockOutRecord | null>(null);

  // Available categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(stockOutList.map((item) => item.category)));
    return ['All', ...cats];
  }, [stockOutList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return stockOutList.filter((item) => {
      const query = search.toLowerCase();
      const matchesSearch =
        item.partCode.toLowerCase().includes(query) ||
        item.partName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        item.transactionNumber.toLowerCase().includes(query) ||
        (item.issuedTo && item.issuedTo.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stockOutList, search, selectedCategory]);

  // Metric stats
  const totalUnitsDispatched = stockOutList.reduce((acc, item) => acc + item.quantity, 0);
  const totalTransactions = stockOutList.length;

  const exportCSV = () => {
    const headers = [
      'Transaction Ref',
      'Part Code',
      'Part Name',
      'Category',
      'Quantity Dispatched',
      'Reason',
      'Timestamp',
      'Issued To',
      'Operator',
    ];
    const rows = filteredList.map((item) => [
      item.transactionNumber,
      item.partCode,
      `"${item.partName}"`,
      item.category,
      item.quantity,
      `"${item.reason}"`,
      item.timestamp,
      `"${item.issuedTo || 'General Ops'}"`,
      item.operator || 'J. Miller',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `stock_out_registry_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-100 text-blue-700">
              <ArrowDownRight className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Stock Out Records
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Audit log of all issued components, production floor distributions, and dispatch reasons.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => onOpenStockOutModal()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Stock Out
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Total Dispatches
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {totalTransactions} <span className="text-xs font-normal text-slate-400">events</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Units Issued
          </div>
          <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-0.5">
            {totalUnitsDispatched.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">parts</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Active Categories
          </div>
          <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-0.5">
            {categories.length - 1}{' '}
            <span className="text-xs font-normal text-slate-400">types</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Primary Recipient
          </div>
          <div className="text-base font-bold text-slate-800 truncate mt-1">
            EV Powertrain
          </div>
          <div className="text-[11px] text-slate-400">Assembly Line 1</div>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part code, part name, category, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stock Out Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Part Code</th>
                <th className="py-3 px-4">Part Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Issued To</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ArrowDownRight className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No stock out records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                      {item.transactionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.partCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.partName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-50 text-blue-800 border border-blue-200/60 tabular-nums">
                        -{item.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs font-normal">
                      <div className="truncate" title={item.reason}>
                        {item.reason}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.issuedTo || 'General Ops'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="text-slate-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Stock Out Record Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Ref: {selectedRecord.transactionNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-semibold">Part Code</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {selectedRecord.partCode}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-semibold">Quantity Deducted</span>
                  <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                    -{selectedRecord.quantity} units
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-500 font-semibold">Part Name:</span>
                  <div className="text-slate-800 font-medium text-sm mt-0.5">
                    {selectedRecord.partName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Category:</span>
                  <div className="text-slate-700 mt-0.5">{selectedRecord.category}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Reason for Issue:</span>
                  <div className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                    {selectedRecord.reason}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 font-semibold">Destination / Line:</span>
                    <div className="text-slate-700 mt-0.5">
                      {selectedRecord.issuedTo || 'General Operations'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Logged By:</span>
                    <div className="text-slate-700 mt-0.5">
                      {selectedRecord.operator || 'J. Miller'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold">Timestamp:</span>
                  <div className="text-slate-600 font-mono mt-0.5">
                    {selectedRecord.timestamp}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
