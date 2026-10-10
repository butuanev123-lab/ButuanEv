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
  /** Original quantity expected on this shipment line. */
  quantity: number;
  /** Cumulative quantity physically received across all receipt confirmations. */
  actualReceived?: number;
  /** Cumulative quantity received damaged across all receipt confirmations. */
  damaged?: number;
  /** Cumulative received quantity minus the original expected quantity. */
  difference?: number;
  note?: string;
  receiptHistory?: ShipmentReceiptLine[];
}

export interface ShipmentReceiptLine {
  expected: number;
  actualReceived: number;
  damaged: number;
  difference: number;
  note?: string;
  confirmedAt: string;
  confirmedBy: string;
}

export type ShipmentStatus =
  | 'Pending'
  | 'Received Complete'
  | 'Received Partial'
  | 'Closed with Shortage'
  /** Legacy value retained for older imported records. */
  | 'Received';

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
  confirmedBy?: string;
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
  category: string;
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

export interface BatteryRecord {
  id: string;
  code: string;
  brand: string;
  chargeLevel: number;
  chargeDate: string;
  lastChargedAt: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'shipments'
  | 'stock-out'
  | 'assembly'
  | 'units'
  | 'damaged'
  | 'returns'
  | 'batteries'
  | 'reports';
