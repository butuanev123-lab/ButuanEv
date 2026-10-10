import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  X,
} from "lucide-react";
import {
  Part,
  Shipment,
  ShipmentReceiptLine,
  ShipmentStatus,
} from "../../types/inventory";

interface ReceiptDraft {
  actualReceived: number;
  damaged: number;
  note: string;
}
interface ReceiveShipmentModalProps {
  shipment: Shipment | null;
  parts: Part[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (
    shipmentId: string,
    confirmation: {
      status: ShipmentStatus;
      lines: Array<Omit<ShipmentReceiptLine, "confirmedAt" | "confirmedBy">>;
    },
  ) => void;
}

const numberValue = (value: string) =>
  Math.max(0, Number.parseInt(value, 10) || 0);

export const ReceiveShipmentModal: React.FC<ReceiveShipmentModalProps> = ({
  shipment,
  parts,
  isOpen,
  onClose,
  onConfirmReceipt,
}) => {
  const [lines, setLines] = useState<ReceiptDraft[]>([]);
  const [shortageDecision, setShortageDecision] = useState<
    "Received Partial" | "Closed with Shortage" | ""
  >("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shipment || !isOpen) return;
    setLines(
      shipment.items.map((item) => ({
        actualReceived: Math.max(0, item.quantity - (item.actualReceived || 0)),
        damaged: 0,
        note: "",
      })),
    );
    setShortageDecision("");
    closeButtonRef.current?.focus();
  }, [shipment, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  const expectedForLine = (index: number) => {
    const item = shipment?.items[index];
    return item ? Math.max(0, item.quantity - (item.actualReceived || 0)) : 0;
  };
  const lineStates = useMemo(
    () =>
      (shipment?.items || []).map((_, index) => {
        const line = lines[index] || {
          actualReceived: expectedForLine(index),
          damaged: 0,
          note: "",
        };
        const expected = expectedForLine(index);
        const difference = line.actualReceived - expected;
        const flagged = difference !== 0 || line.damaged > 0;
        return {
          expected,
          difference,
          flagged,
        };
      }),
    [lines, shipment],
  );
  const hasShortage = lineStates.some((line) => line.difference < 0);
  const hasDiscrepancy = lineStates.some((line) => line.flagged);
  const matchedLines = lineStates.filter((line) => !line.flagged).length;
  const canConfirm =
    lines.length > 0 &&
    (!hasShortage || Boolean(shortageDecision));

  const stockPreviews = useMemo(() => {
    const result = new Map<
      string,
      { before: number; after: number; lineCount: number }
    >();
    shipment?.items.forEach((item, index) => {
      const partQty =
        parts.find((part) => part.code === item.partCode)?.availableQty || 0;
      const preview = result.get(item.partCode) || {
        before: partQty,
        after: partQty,
        lineCount: 0,
      };
      const draft = lines[index] || {
        actualReceived: Math.max(0, item.quantity - (item.actualReceived || 0)),
        damaged: 0,
        note: "",
      };
      preview.after += Math.max(
        0,
        (draft?.actualReceived || 0) - (draft?.damaged || 0),
      );
      preview.lineCount += 1;
      result.set(item.partCode, preview);
    });
    return result;
  }, [lines, parts, shipment]);
  const groupedLineIndexes = useMemo(() => {
    const groups = new Map<string, number[]>();
    shipment?.items.forEach((item, index) =>
      groups.set(item.partCode, [...(groups.get(item.partCode) || []), index]),
    );
    return [...groups.values()];
  }, [shipment]);

  if (!isOpen || !shipment) return null;
  const updateLine = (index: number, updates: Partial<ReceiptDraft>) =>
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) return line;
        const next = { ...line, ...updates };
        if (updates.actualReceived !== undefined)
          next.damaged = Math.min(next.damaged, updates.actualReceived);
        if (updates.damaged !== undefined)
          next.damaged = Math.min(updates.damaged, next.actualReceived);
        return next;
      }),
    );
  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirmReceipt(shipment.id, {
      status: hasShortage
        ? (shortageDecision as "Received Partial" | "Closed with Shortage")
        : "Received Complete",
      lines: lines.map((line, index) => ({
        expected: lineStates[index].expected,
        actualReceived: line.actualReceived,
        damaged: line.damaged,
        difference: lineStates[index].difference,
        note: line.note.trim() || undefined,
      })),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-shipment-title"
        className="w-full max-w-7xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-emerald-100 bg-emerald-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="receive-shipment-title"
                className="text-sm font-bold text-slate-900"
              >
                Confirm Shipment Receipt
              </h2>
              <p className="text-xs text-slate-500 font-mono truncate">
                {shipment.shipmentNumber} · {shipment.supplier}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close receipt confirmation"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-600">
            Check the quantities that actually arrived. Only received quantities
            will be added to Parts Inventory.
          </p>
          <div className="rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full min-w-270 text-xs">
              <caption className="sr-only">
                Shipment receipt line items and stock preview
              </caption>
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-left">
                    Item
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Expected
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left">
                    Actual Received
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left">
                    Damaged
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left">
                    Difference
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left">
                    Stock Preview
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center">
                    Note
                  </th>
                </tr>
              </thead>
              {groupedLineIndexes.map((indexes) => (
                <tbody
                  key={`group-${indexes[0]}`}
                  className="border-b border-slate-100 last:border-0"
                >
                  {indexes.map((index, position) => {
                    const item = shipment.items[index];
                    const draft = lines[index] || {
                      actualReceived: expectedForLine(index),
                      damaged: 0,
                      note: "",
                    };
                    const state = lineStates[index];
                    const preview = stockPreviews.get(item.partCode)!;
                    const inputId = `receipt-${shipment.id}-${index}`;
                    return (
                      <tr key={index} className="align-top bg-white">
                        <td className="px-3 py-3 min-w-48">
                          <div className="font-semibold text-slate-800">
                            {item.partName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.partCode}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-slate-700 tabular-nums">
                          {state.expected}
                        </td>
                        <td className="px-3 py-2 min-w-32">
                          <label
                            htmlFor={`${inputId}-actual`}
                            className="sr-only"
                          >
                            Actual received for {item.partName}
                          </label>
                          <input
                            id={`${inputId}-actual`}
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={draft?.actualReceived ?? 0}
                            onChange={(event) =>
                              updateLine(index, {
                                actualReceived: numberValue(event.target.value),
                              })
                            }
                            className="w-24 px-2 py-1.5 font-mono tabular-nums border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-2 min-w-28">
                          <label
                            htmlFor={`${inputId}-damaged`}
                            className="sr-only"
                          >
                            Damaged quantity for {item.partName}
                          </label>
                          <input
                            id={`${inputId}-damaged`}
                            type="number"
                            min="0"
                            max={draft?.actualReceived ?? 0}
                            inputMode="numeric"
                            value={draft?.damaged ?? 0}
                            onChange={(event) =>
                              updateLine(index, {
                                damaged: numberValue(event.target.value),
                              })
                            }
                            className="w-20 px-2 py-1.5 font-mono tabular-nums border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${state.difference === 0 ? "bg-emerald-50 text-emerald-700" : state.difference < 0 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}
                          >
                            {state.difference === 0
                              ? "Match"
                              : state.difference < 0
                                ? `Short ${state.difference}`
                                : `Extra +${state.difference}`}
                          </span>
                        </td>
                        {position === 0 && (
                          <td
                            rowSpan={indexes.length}
                            className="px-3 py-3 align-middle whitespace-nowrap bg-emerald-50/30"
                          >
                            <div className="flex items-center gap-1.5 font-mono tabular-nums">
                              <span className="text-slate-500">
                                {preview.before}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-bold text-emerald-700">
                                {preview.after}
                              </span>
                            </div>
                            {preview.lineCount > 1 && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                Grouped by code
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2 min-w-64">
                          {state.flagged ? (
                            <div>
                              <label
                                htmlFor={`${inputId}-note`}
                                className="sr-only"
                              >
                                Optional discrepancy note for {item.partName}
                              </label>
                              <input
                                id={`${inputId}-note`}
                                type="text"
                                maxLength={120}
                                value={draft?.note ?? ""}
                                onChange={(event) =>
                                  updateLine(index, {
                                    note: event.target.value,
                                  })
                                }
                                placeholder="Note"
                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              No note needed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
          {hasShortage && (
            <fieldset className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <legend className="px-1 text-xs font-semibold text-amber-900">
                Shortage disposition{" "}
                <span className="text-rose-600">required</span>
              </legend>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="shortage-status"
                    checked={shortageDecision === "Received Partial"}
                    onChange={() => setShortageDecision("Received Partial")}
                  />{" "}
                  Keep open for remaining items
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="shortage-status"
                    checked={shortageDecision === "Closed with Shortage"}
                    onChange={() => setShortageDecision("Closed with Shortage")}
                  />{" "}
                  Close with shortage
                </label>
              </div>
            </fieldset>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
            <div className="flex gap-4 text-slate-600">
              <span>
                <strong className="text-slate-900">
                  {shipment.items.length}
                </strong>{" "}
                total lines
              </span>
              <span>
                <strong className="text-emerald-700">{matchedLines}</strong>{" "}
                matched
              </span>
              <span>
                <strong
                  className={
                    hasDiscrepancy ? "text-amber-700" : "text-slate-900"
                  }
                >
                  {shipment.items.length - matchedLines}
                </strong>{" "}
                with discrepancies
              </span>
            </div>
            {hasDiscrepancy && (
              <div className="sm:ml-auto flex items-start gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Items cannot be returned to the supplier. Shortages and damage
                  will be recorded as losses.
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <p className="text-[11px] text-slate-500">
            Received Complete and Closed shipments become view-only. Received
            Partial shipments stay open for the remaining items.
          </p>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {hasDiscrepancy
                ? "Confirm with Discrepancies"
                : "Confirm & Stock In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
