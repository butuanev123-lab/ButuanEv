import React from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowDownRight,
  Wrench,
  Boxes,
  AlertTriangle,
  RotateCcw,
  BatteryCharging,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { NavigationTab } from '../types/inventory';
import { LogoPlaceholder } from './LogoPlaceholder';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lowStockCount: number;
  pendingShipmentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  lowStockCount,
  pendingShipmentsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      tooltip: 'System overview & urgent stock',
    },
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200/60',
      tooltip: 'All parts & stock on hand',
    },
    {
      id: 'shipments' as NavigationTab,
      label: 'Shipments',
      icon: Truck,
      badge: pendingShipmentsCount > 0 ? `${pendingShipmentsCount} due` : null,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200/60',
      tooltip: 'Inbound POs and receipts',
    },
    {
      id: 'stock-out' as NavigationTab,
      label: 'Stock Out',
      icon: ArrowDownRight,
      badge: null,
      tooltip: 'View all stock out items and dispatches',
    },
    {
      id: 'assembly' as NavigationTab,
      label: 'Assembly',
      icon: Wrench,
      badge: null,
      tooltip: 'Bill of Materials & work orders',
    },
    {
      id: 'units' as NavigationTab,
      label: 'Units',
      icon: Boxes,
      badge: null,
      tooltip: 'Completed units by vehicle category',
    },
    {
      id: 'damaged' as NavigationTab,
      label: 'Damaged',
      icon: AlertTriangle,
      badge: null,
      tooltip: 'Damaged items & quarantine',
    },
    {
      id: 'returns' as NavigationTab,
      label: 'Returns',
      icon: RotateCcw,
      badge: null,
      tooltip: 'Customer returns & vendor RMAs',
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Reports',
      icon: BarChart3,
      badge: null,
      tooltip: 'Valuation & audit logs',
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Brand / Logo Slot Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <LogoPlaceholder collapsed={collapsed} />
        
        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <div className={`px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Main Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : item.tooltip}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-linear-to-r from-teal-50/80 to-blue-50/40 text-teal-900 shadow-sm border border-teal-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-teal-500 to-blue-600 rounded-r" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-slate-400 group-hover:text-teal-600'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warehouse Status & Quick Info Footer */}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 ease-in-out shrink-0 select-none ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 z-30 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-10 transition-transform">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
