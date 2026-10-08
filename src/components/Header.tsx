import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { NavigationTab, Part, Shipment } from '../types/inventory';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileNav: () => void;
  onOpenAddPart: () => void;
  onOpenAddShipment: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  parts: Part[];
  shipments: Shipment[];
  onSelectPart: (part: Part) => void;
  onSelectShipment: (shipment: Shipment) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileNav,
  onOpenAddPart,
  onOpenAddShipment,
  searchQuery,
  onSearchChange,
  parts,
  shipments,
  onSelectPart,
  onSelectShipment,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const lowStockParts = parts.filter((p) => p.status === 'Low stock' || p.status === 'Out of stock');
  const pendingShipments = shipments.filter((s) => s.status === 'Pending');

  const filteredParts = searchQuery.trim()
    ? parts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredShipments = searchQuery.trim()
    ? shipments.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const breadcrumbTitle = {
    dashboard: 'Dashboard',
    inventory: 'Inventory & Parts',
    shipments: 'Inbound Shipments',
    'stock-out': 'Stock Out Records',
    assembly: 'Assembly & BOM',
    damaged: 'Damaged Goods',
    returns: 'Returns & RMA',
    reports: 'Valuation & Reports',
  }[currentTab];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="hidden sm:inline hover:text-slate-700 font-semibold text-teal-800">ButuanEV</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            {breadcrumbTitle}
          </span>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parts, SKUs, suppliers, shipments..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Quick Results Dropdown */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30 max-h-80 overflow-y-auto">
            <div className="p-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Search Results</span>
              <span>
                {filteredParts.length + filteredShipments.length} found
              </span>
            </div>

            {filteredParts.length > 0 && (
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Parts
                </div>
                {filteredParts.map((part) => (
                  <div
                    key={part.id}
                    onClick={() => {
                      onSelectPart(part);
                      setShowSearchDropdown(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-teal-50/60 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-teal-600" />
                      <div>
                        <span className="font-semibold text-slate-800">{part.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">{part.code}</span>
                      </div>
                    </div>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {part.availableQty} units
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredShipments.length > 0 && (
              <div className="p-1 border-t border-slate-100">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Shipments
                </div>
                {filteredShipments.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectShipment(s);
                      setShowSearchDropdown(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50/60 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-slate-800">{s.shipmentNumber}</span>
                        <span className="text-slate-400 ml-1.5">{s.supplier}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        s.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {filteredParts.length === 0 && filteredShipments.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No items match "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Buttons */}
        <button
          onClick={onOpenAddPart}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          Add Part
        </button>

        <button
          onClick={onOpenAddShipment}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-lg transition-all shadow-xs hover:shadow active:scale-95 whitespace-nowrap"
        >
          <Truck className="w-3.5 h-3.5" />
          Add Shipment
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockParts.length + pendingShipments.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {lowStockParts.length + pendingShipments.length} alerts
                </span>
              </div>
              <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                {lowStockParts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPart(p);
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg bg-amber-50/50 hover:bg-amber-50 border border-amber-100/60 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>{p.name} ({p.code})</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {p.availableQty === 0
                        ? 'Part is currently Out of Stock!'
                        : `Stock level low: ${p.availableQty} units left (threshold ${p.minStockThreshold})`}
                    </p>
                  </div>
                ))}

                {pendingShipments.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectShipment(s);
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 border border-blue-100/60 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-blue-800 font-semibold">
                      <Truck className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                      <span>{s.shipmentNumber} - Awaiting Receipt</span>
                    </div>
                    <p className="text-[11px] text-blue-600 mt-0.5">
                      From {s.supplier} · {s.items.length} items
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 text-white font-semibold flex items-center justify-center text-[11px] shadow-xs">
            JM
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 leading-tight">J. Miller</span>
            <span className="text-[10px] text-slate-400">Inventory Mgr</span>
          </div>
        </div>
      </div>
    </header>
  );
};
