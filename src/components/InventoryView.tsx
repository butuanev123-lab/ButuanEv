import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Package,
  Layers,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { Part, PartStatus } from "../types/inventory";

interface InventoryViewProps {
  parts: Part[];
  onOpenCombinedInbound: (mode?: "shipment" | "part") => void;
  onOpenRequisitionModal: (part?: Part) => void;
  onViewPart: (part: Part) => void;
  onEditPart: (part: Part) => void;
  onStockInPart: (part: Part) => void;
  onStockOutPart: (part: Part) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  parts,
  onOpenCombinedInbound,
  onOpenRequisitionModal,
  onViewPart,
  onEditPart,
  onStockInPart,
  onStockOutPart,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(parts.map((p) => p.category)));
    return ["All", ...cats];
  }, [parts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.code.toLowerCase().includes(search.toLowerCase()) ||
        part.location.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || part.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" || part.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [parts, search, selectedCategory, selectedStatus]);

  // Overall Inventory stats
  const totalUnits = parts.reduce((acc, p) => acc + p.availableQty, 0);
  const totalValuation = parts.reduce(
    (acc, p) => acc + p.availableQty * p.unitPrice,
    0,
  );

  const exportCSV = () => {
    const headers = [
      "Part Code",
      "Part Name",
      "Category",
      "Available Qty",
      "Min Threshold",
      "Location",
      "Status",
      "Unit Price ($)",
    ];
    const rows = filteredParts.map((p) => [
      p.code,
      `"${p.name}"`,
      p.category,
      p.availableQty,
      p.minStockThreshold,
      p.location,
      p.status,
      p.unitPrice.toFixed(2),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventory_catalog_${new Date().toISOString().split("T")[0]}.csv`,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Parts Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete registry of all stored components, current quantities, and
            warehouse locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenRequisitionModal()}
            className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Create a Purchase Requisition"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Purchase Requisition
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => onOpenCombinedInbound("part")}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-teal-400" />
            Log Inbound / Part
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Total Catalog
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {parts.length}{" "}
            <span className="text-xs font-normal text-slate-400">SKUs</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Total On-Hand
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {totalUnits.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">units</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Estimated Valuation
          </span>
          <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-0.5">
            $
            {totalValuation.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Attention Required
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-0.5">
            {parts.filter((p) => p.status !== "In stock").length}{" "}
            <span className="text-xs font-normal text-slate-400">items</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part code, name, or bin location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="All">All statuses</option>
              <option value="In stock">In stock</option>
              <option value="Low stock">Low stock</option>
              <option value="Out of stock">Out of stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] lg:text-nowrap tracking-wide">
                <th className="py-3 px-4">Part Code</th>
                <th className="py-3 px-4">Part Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Qty</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No parts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => (
                  <tr
                    key={part.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {part.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{part.name}</div>
                      {part.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs font-normal">
                          {part.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {part.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      {part.availableQty}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      {part.minStockThreshold}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {part.location}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      ${part.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium text-nowrap ${
                          part.status === "Out of stock"
                            ? "text-rose-700"
                            : part.status === "Low stock"
                              ? "text-amber-700"
                              : "text-emerald-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full  ${
                            part.status === "Out of stock"
                              ? "bg-rose-500"
                              : part.status === "Low stock"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        />
                        {part.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <button
                          onClick={() => onViewPart(part)}
                          className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                        >
                          View
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => onOpenRequisitionModal(part)}
                          className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
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
                        <span className="text-slate-300">·</span>
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
                        <span className="text-slate-300">·</span>
                        <button className="text-red-500 hover:text-shadow-amber-600 hover:underline cursor-pointer">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
