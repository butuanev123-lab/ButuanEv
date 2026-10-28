import React, { useState } from 'react';
import {
  NavigationTab,
  Part,
  Shipment,
  Assembly,
  DamagedRecord,
  RepairRecord,
  StockOutRecord,
  BatteryRecord,
} from './types/inventory';
import {
  INITIAL_PARTS,
  INITIAL_SHIPMENTS,
  INITIAL_ASSEMBLIES,
  INITIAL_DAMAGED,
  INITIAL_REPAIRS,
  INITIAL_STOCK_OUT,
  INITIAL_BATTERIES,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { ShipmentsView } from './components/ShipmentsView';
import { StockOutView } from './components/StockOutView';
import { AssemblyView } from './components/AssemblyView';
import { UnitsView } from './components/UnitsView';
import { DamagedView } from './components/DamagedView';
import { RepairView } from './components/RepairView';
import { ReportsView } from './components/ReportsView';
import { AddPartModal } from './components/modals/AddPartModal';
import { AddShipmentModal } from './components/modals/AddShipmentModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { PartDetailModal } from './components/modals/PartDetailModal';
import { ShipmentDetailModal } from './components/modals/ShipmentDetailModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  Menu,
} from 'lucide-react';

export default function App() {
  // Primary inventory collections
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [assemblies, setAssemblies] = useState<Assembly[]>(INITIAL_ASSEMBLIES);
  const [unitCategories, setUnitCategories] = useState<string[]>(['E-bike', 'E-bus', 'E-cargo']);
  const [damagedList, setDamagedList] = useState<DamagedRecord[]>(INITIAL_DAMAGED);
  const onDeletePart = (part: Part) => {
    setParts(prev => prev.filter(p => p.id !== part.id));
  };
  const [repairsList, setRepairsList] = useState<RepairRecord[]>(INITIAL_REPAIRS);
  const [stockOutList, setStockOutList] = useState<StockOutRecord[]>(INITIAL_STOCK_OUT);
  const [batteries, setBatteries] = useState<BatteryRecord[]>(INITIAL_BATTERIES);

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [adjustingStock, setAdjustingStock] = useState<{
    part: Part;
    mode: 'in' | 'out';
  } | null>(null);
  const [viewingPart, setViewingPart] = useState<{
    part: Part;
    editMode: boolean;
  } | null>(null);
  const [viewingShipment, setViewingShipment] = useState<{
    shipment: Shipment;
    editMode: boolean;
  } | null>(null);

  // Notifications / Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to re-evaluate part status
  const calculatePartStatus = (qty: number, threshold: number): Part['status'] => {
    if (qty <= 0) return 'Out of stock';
    if (qty <= threshold) return 'Low stock';
    return 'In stock';
  };

  // Add Part handler
  const handleAddPart = (newPartData: Omit<Part, 'id' | 'status' | 'lastUpdated'>) => {
    const status = calculatePartStatus(newPartData.availableQty, newPartData.minStockThreshold);
    const newPart: Part = {
      ...newPartData,
      id: `p-${Date.now()}`,
      status,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setParts((prev) => [newPart, ...prev]);
    addToast('success', `Part ${newPart.code} Created`, `${newPart.name} added to catalog.`);
  };

  // Save / Update Part handler
  const handleSavePart = (updated: Part) => {
    const status = calculatePartStatus(updated.availableQty, updated.minStockThreshold);
    const updatedPart = { ...updated, status };
    setParts((prev) => prev.map((p) => (p.id === updated.id ? updatedPart : p)));
    addToast('success', `Part ${updated.code} Updated`, 'Changes saved successfully.');
  };

  // Quick Stock adjustment handler (Stock In / Stock Out)
  const handleAdjustStock = (
    partId: string,
    delta: number,
    reason: string,
    issuedTo?: string
  ) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id === partId) {
          const newQty = Math.max(0, p.availableQty + delta);
          const newStatus = calculatePartStatus(newQty, p.minStockThreshold);
          return {
            ...p,
            availableQty: newQty,
            status: newStatus,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          };
        }
        return p;
      })
    );

    const target = parts.find((p) => p.id === partId);
    if (target) {
      if (delta < 0) {
        // Automatically append to Stock Out records
        const newRecord: StockOutRecord = {
          id: `so-${Date.now()}`,
          transactionNumber: `SO-0${85 + stockOutList.length}`,
          partCode: target.code,
          partName: target.name,
          category: target.category,
          quantity: Math.abs(delta),
          reason: reason || 'Production and maintenance usage',
          timestamp:
            new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) +
            ' ' +
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          issuedTo: issuedTo || 'General Operations',
          operator: 'J. Miller',
        };
        setStockOutList((prev) => [newRecord, ...prev]);
      }

      const verb = delta > 0 ? 'Stocked in' : 'Stocked out';
      addToast(
        'success',
        `${verb}: ${Math.abs(delta)} units of ${target.code}`,
        `Reason: ${reason}`
      );
    }
  };

  // Add Shipment handler
  const handleAddShipment = (newShipmentData: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = {
      ...newShipmentData,
      id: `s-${Date.now()}`,
    };
    setShipments((prev) => [newShipment, ...prev]);
    addToast(
      'info',
      `Shipment ${newShipment.shipmentNumber} Registered`,
      `Awaiting delivery from ${newShipment.supplier}`
    );
  };

  // Save / Update Shipment
  const handleSaveShipment = (updated: Shipment) => {
    setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('success', `Shipment ${updated.shipmentNumber} Updated`);
  };

  // Direct Receive Shipment (no confirmation modal) — receives full expected quantities
  const handleReceiveShipment = (shipment: Shipment) => {
    const targetShipment = shipments.find((s) => s.id === shipment.id);
    if (!targetShipment || !['Pending', 'Received Partial'].includes(targetShipment.status)) return;

    const confirmedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const confirmedBy = 'Inventory Officer';

    const addedGoodStockByCode = targetShipment.items.reduce<Record<string, number>>((totals, item) => {
      totals[item.partCode] = (totals[item.partCode] || 0) + item.quantity;
      return totals;
    }, {});

    setParts((prevParts) =>
      prevParts.map((part) => {
        const stockIn = addedGoodStockByCode[part.code] || 0;
        if (stockIn) {
          const updatedQty = part.availableQty + stockIn;
          return {
            ...part,
            availableQty: updatedQty,
            status: calculatePartStatus(updatedQty, part.minStockThreshold),
            lastUpdated: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
        }
        return part;
      })
    );

    setShipments((prev) =>
      prev.map((s) =>
        s.id !== shipment.id ? s : {
          ...s,
          status: 'Received Complete',
          receivedAt: confirmedAt,
          confirmedBy,
          items: s.items.map((item) => ({
            ...item,
            actualReceived: item.quantity,
            damaged: 0,
            difference: 0,
            receiptHistory: [{ expected: item.quantity, actualReceived: item.quantity, damaged: 0, difference: 0, confirmedAt, confirmedBy }],
          })),
        }
      )
    );

    addToast(
      'success',
      `Received ${targetShipment.shipmentNumber}`,
      `Full quantities added to Parts Inventory.`
    );
  };

  // Assembly Build handler
  const handleBuildAssembly = (assemblyId: string) => {
    const assembly = assemblies.find((a) => a.id === assemblyId);
    if (!assembly) return;

    // Deduct parts
    setParts((prev) =>
      prev.map((part) => {
        const bomReq = assembly.bom.find((b) => b.partCode === part.code);
        if (bomReq) {
          const newQty = Math.max(0, part.availableQty - bomReq.requiredQty);
          return {
            ...part,
            availableQty: newQty,
            status: calculatePartStatus(newQty, part.minStockThreshold),
          };
        }
        return part;
      })
    );

    // Increment assembly build count
    setAssemblies((prev) =>
      prev.map((a) =>
        a.id === assemblyId ? { ...a, completedCount: a.completedCount + 1 } : a
      )
    );

    addToast('success', `Built 1 Unit: ${assembly.name}`, 'Raw components deducted from inventory.');
  };

  const handleAddUnitCategory = (category: string) => {
    const normalizedCategory = category.trim();
    if (!normalizedCategory) return;

    if (unitCategories.some((existing) => existing.toLowerCase() === normalizedCategory.toLowerCase())) {
      addToast('warning', 'Category Already Exists', `${normalizedCategory} is already available in Units.`);
      return;
    }

    setUnitCategories((previous) => [...previous, normalizedCategory]);
    addToast('success', 'Unit Category Added', `${normalizedCategory} is ready for future assembled units.`);
  };

  // Damaged Log handler
  const handleAddDamaged = (record: Omit<DamagedRecord, 'id' | 'code'>) => {
    const newRecord: DamagedRecord = {
      ...record,
      id: `dmg-${Date.now()}`,
      code: `DMG-0${45 + damagedList.length}`,
    };

    setDamagedList((prev) => [newRecord, ...prev]);

    // Automatically deduct damaged quantity from available inventory
    setParts((prev) =>
      prev.map((part) => {
        if (part.code === record.partCode) {
          const newQty = Math.max(0, part.availableQty - record.quantity);
          return {
            ...part,
            availableQty: newQty,
            status: calculatePartStatus(newQty, part.minStockThreshold),
          };
        }
        return part;
      })
    );

    addToast('warning', `Damaged Logged: ${newRecord.code}`, `${record.quantity}x ${record.partName} moved to quarantine.`);
  };

  const handleUpdateDisposition = (id: string, disposition: DamagedRecord['disposition']) => {
    setDamagedList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, disposition } : d))
    );
    addToast('info', 'Disposition Updated', `Marked as ${disposition}`);
  };

  // Returns Log handler
  const handleAddRepair = (record: Omit<RepairRecord, 'id' | 'code'>) => {
    const newRecord: RepairRecord = {
      ...record,
      id: `rep-${Date.now()}`,
      code: `REP-${100 + repairsList.length}`,
    };

    setRepairsList((prev) => [newRecord, ...prev]);

    addToast('warning', `Repair Job Created: ${newRecord.code}`, `${record.quantity}x ${record.partName} sent for repair.`);
  };

  const handleUpdateRepairStatus = (id: string, status: RepairRecord['status']) => {
    setRepairsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    addToast('info', 'Repair Status Updated', `Marked as ${status}`);
  };

  const handleAddBattery = (battery: Omit<BatteryRecord, 'id' | 'lastChargedAt'>) => {
    const newBattery: BatteryRecord = {
      ...battery,
      id: `bat-${Date.now()}`,
      lastChargedAt: `${battery.chargeDate} 00:00`,
    };
    setBatteries((previous) => [newBattery, ...previous]);
    addToast('success', `Battery ${newBattery.code} Added`, `${newBattery.brand} battery is now being tracked.`);
  };

  const handleRecordBatteryCharge = (id: string, chargeLevel: number) => {
    const battery = batteries.find((item) => item.id === id);
    if (!battery) return;

    const chargeDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setBatteries((previous) =>
      previous.map((battery) => {
        if (battery.id !== id) return battery;
        return { ...battery, chargeLevel, chargeDate, lastChargedAt: timestamp };
      })
    );
    addToast('success', `Charge Updated: ${battery.code}`, `Battery level is now ${chargeLevel}%.`);
  };

  const lowStockCount = parts.filter(
    (p) => p.status === 'Low stock' || p.status === 'Out of stock'
  ).length;
  const pendingShipmentsCount = shipments.filter(
    (s) => s.status === 'Pending' || s.status === 'Received Partial'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Intuitive and Fully Responsive Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        lowStockCount={lowStockCount}
        pendingShipmentsCount={pendingShipmentsCount}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header with Search & Quick Actions */}
        <Header
          currentTab={currentTab}
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenAddPart={() => setIsAddPartOpen(true)}
          onOpenAddShipment={() => setIsAddShipmentOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          parts={parts}
          shipments={shipments}
          onSelectPart={(p) => setViewingPart({ part: p, editMode: false })}
          onSelectShipment={(s) => setViewingShipment({ shipment: s, editMode: false })}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              parts={parts}
              shipments={shipments}
              onNavigateTab={setCurrentTab}
              onOpenAddPart={() => setIsAddPartOpen(true)}
              onOpenAddShipment={() => setIsAddShipmentOpen(true)}
              onViewPart={(p) => setViewingPart({ part: p, editMode: false })}
              onEditPart={(p) => setViewingPart({ part: p, editMode: true })}
              onStockInPart={(p) => setAdjustingStock({ part: p, mode: 'in' })}
              onStockOutPart={(p) => setAdjustingStock({ part: p, mode: 'out' })}
              onViewShipment={(s) => setViewingShipment({ shipment: s, editMode: false })}
              onEditShipment={(s) => setViewingShipment({ shipment: s, editMode: true })}
              onReceiveShipment={handleReceiveShipment}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              parts={parts}
              onOpenAddPart={() => setIsAddPartOpen(true)}
              onViewPart={(p) => setViewingPart({ part: p, editMode: false })}
              onEditPart={(p) => setViewingPart({ part: p, editMode: true })}
              onStockInPart={(p) => setAdjustingStock({ part: p, mode: 'in' })}
              onStockOutPart={(p) => setAdjustingStock({ part: p, mode: 'out' })}
              onDeletePart={onDeletePart}
            />
          )}

          {currentTab === 'shipments' && (
            <ShipmentsView
              shipments={shipments}
              onOpenAddShipment={() => setIsAddShipmentOpen(true)}
              onViewShipment={(s) => setViewingShipment({ shipment: s, editMode: false })}
              onEditShipment={(s) => setViewingShipment({ shipment: s, editMode: true })}
              onReceiveShipment={handleReceiveShipment}
            />
          )}

          {currentTab === 'stock-out' && (
            <StockOutView
              stockOutList={stockOutList}
              parts={parts}
              onOpenStockOutModal={(p) =>
                setAdjustingStock({ part: p || parts[0], mode: 'out' })
              }
            />
          )}

          {currentTab === 'assembly' && (
            <AssemblyView
              assemblies={assemblies}
              parts={parts}
              onBuildAssembly={handleBuildAssembly}
            />
          )}

          {currentTab === 'units' && (
            <UnitsView
              assemblies={assemblies}
              categories={unitCategories}
              onAddCategory={handleAddUnitCategory}
            />
          )}

          {currentTab === 'damaged' && (
            <DamagedView
              damagedList={damagedList}
              parts={parts}
              onAddDamaged={handleAddDamaged}
              onUpdateDisposition={handleUpdateDisposition}
            />
          )}

          {currentTab === 'repair' && (
            <RepairView
              repairsList={repairsList}
              parts={parts}
              onAddRepair={handleAddRepair}
              onUpdateRepairStatus={handleUpdateRepairStatus}
            />
          )}

          {currentTab === 'batteries' && (
            <BatteriesView
              batteries={batteries}
              onAddBattery={handleAddBattery}
              onRecordCharge={handleRecordBatteryCharge}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView parts={parts} shipments={shipments} />
          )}
        </main>

        {/* Mobile Quick Bottom Navigation Bar for easy one-handed navigation */}
        <div className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors ${
              currentTab === 'dashboard'
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('inventory')}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors ${
              currentTab === 'inventory'
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            Inventory
          </button>
          <button
            onClick={() => setCurrentTab('shipments')}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-semibold transition-colors ${
              currentTab === 'shipments'
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 mb-0.5" />
            Shipments
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center py-1 px-3 text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            Menu
          </button>
        </div>
      </div>

      {/* Global Modals */}
      <AddPartModal
        isOpen={isAddPartOpen}
        onClose={() => setIsAddPartOpen(false)}
        onAddPart={handleAddPart}
        existingCodes={parts.map((p) => p.code)}
      />

      <AddShipmentModal
        isOpen={isAddShipmentOpen}
        onClose={() => setIsAddShipmentOpen(false)}
        onAddShipment={handleAddShipment}
        parts={parts}
        existingShipmentCount={shipments.length}
      />

      <StockAdjustModal
        isOpen={Boolean(adjustingStock)}
        part={adjustingStock?.part || null}
        parts={parts}
        mode={adjustingStock?.mode || 'in'}
        onClose={() => setAdjustingStock(null)}
        onAdjust={handleAdjustStock}
      />

      <PartDetailModal
        isOpen={Boolean(viewingPart)}
        part={viewingPart?.part || null}
        initialEditMode={viewingPart?.editMode || false}
        onClose={() => setViewingPart(null)}
        onSavePart={handleSavePart}
      />

      <ShipmentDetailModal
        isOpen={Boolean(viewingShipment)}
        shipment={viewingShipment?.shipment || null}
        initialEditMode={viewingShipment?.editMode || false}
        parts={parts}
        onClose={() => setViewingShipment(null)}
        onSaveShipment={handleSaveShipment}
      />

      {/* Non-intrusive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
