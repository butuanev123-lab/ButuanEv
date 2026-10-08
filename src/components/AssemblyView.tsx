import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Boxes,
  Plus
} from 'lucide-react';
import { Assembly, Part } from '../types/inventory';

interface AssemblyViewProps {
  assemblies: Assembly[];
  parts: Part[];
  onBuildAssembly: (assemblyId: string) => void;
}

export const AssemblyView: React.FC<AssemblyViewProps> = ({
  assemblies,
  parts,
  onBuildAssembly,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getPartStock = (partCode: string) => {
    const found = parts.find((p) => p.code === partCode);
    return found ? found.availableQty : 0;
  };

  const canBuildAssembly = (assembly: Assembly) => {
    return assembly.bom.every((item) => {
      const stock = getPartStock(item.partCode);
      return stock >= item.requiredQty;
    });
  };

  const handleBuild = (assembly: Assembly) => {
    if (!canBuildAssembly(assembly)) return;
    onBuildAssembly(assembly.id);
    setSuccessMsg(`1 unit of ${assembly.name} built successfully. BOM parts deducted.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Assembly & Bill of Materials
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Produce composite sub-assemblies by consuming stocked raw parts and components.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Assemblies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assemblies.map((assembly) => {
          const isBuildable = canBuildAssembly(assembly);

          return (
            <div
              key={assembly.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {assembly.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {assembly.name}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      isBuildable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {isBuildable ? 'Ready to Build' : 'Parts Shortage'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-4 flex items-center gap-3">
                  <span>
                    Produced: <strong className="text-slate-800 font-mono">{assembly.completedCount}</strong> / {assembly.targetQty}
                  </span>
                  <span>·</span>
                  <span>BOM Requirements: {assembly.bom.length} items</span>
                </div>

                {/* BOM Parts Table */}
                <div className="rounded-lg border border-slate-100 overflow-hidden mb-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-2 px-3">Component</th>
                        <th className="py-2 px-3 text-right">Required</th>
                        <th className="py-2 px-3 text-right">On Hand</th>
                        <th className="py-2 px-3 text-right">Stock State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assembly.bom.map((bomItem, idx) => {
                        const onHand = getPartStock(bomItem.partCode);
                        const hasEnough = onHand >= bomItem.requiredQty;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {bomItem.partName}{' '}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({bomItem.partCode})
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                              {bomItem.requiredQty}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                              {onHand}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {hasEnough ? (
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  Available
                                </span>
                              ) : (
                                <span className="text-[11px] text-rose-600 font-medium">
                                  Shortage
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Building deducts required raw items from Parts Inventory
                </span>
                <button
                  disabled={!isBuildable}
                  onClick={() => handleBuild(assembly)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    isBuildable
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Build 1 Unit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
