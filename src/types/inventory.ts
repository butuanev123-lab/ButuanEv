export type PartStatus = 'Out of stock' | 'Low stock' | 'In stock';

export interface Part {
  id: string;
  code: string;
  name: string;
  category: string;
  availableQty: number;
  minStockThreshold: number;
  location: string;
  status: PartStatus;
  unitPrice: number;
  unitOfMeasure?: string;
  description?: string;
  lastUpdated: string;
}

export interface ShipmentItem {
  partCode: string;
  partName: string;
  quantity: number;
}

export type ShipmentStatus = 'Pending' | 'Received';

export interface Shipment {
  id: string;
  shipmentNumber: string;
  supplier: string;
  dateReceived: string; // or expected date
  status: ShipmentStatus;
  items: ShipmentItem[];
  trackingNumber?: string;
  notes?: string;
  receivedAt?: string;
}

export interface AssemblyBOMItem {
  partCode: string;
  partName: string;
  requiredQty: number;
}

export interface Assembly {
  id: string;
  code: string;
  name: string;
  bom: AssemblyBOMItem[];
  completedCount: number;
  status: 'Ready to Build' | 'Parts Shortage';
  targetQty: number;
}

export interface DamagedRecord {
  id: string;
  code: string;
  partCode: string;
  partName: string;
  quantity: number;
  reason: string;
  dateReported: string;
  reportedBy: string;
  disposition: 'Under Inspection' | 'Scrapped' | 'RMA Return';
}

export interface ReturnRecord {
  id: string;
  code: string;
  partCode: string;
  partName: string;
  quantity: number;
  type: 'Customer Return' | 'Vendor RMA';
  partner: string;
  date: string;
  status: 'Awaiting Inspection' | 'Restocked' | 'Credit Issued';
}

export interface StockOutRecord {
  id: string;
  transactionNumber: string;
  partCode: string;
  partName: string;
  category: string;
  quantity: number;
  reason: string;
  timestamp: string;
  issuedTo?: string;
  operator?: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'shipments'
  | 'stock-out'
  | 'assembly'
  | 'damaged'
  | 'returns'
  | 'reports';
