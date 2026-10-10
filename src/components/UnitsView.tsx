import React, { useMemo, useState } from "react";
import { Boxes, CheckCircle2, PackagePlus, Plus, X } from "lucide-react";
import { Assembly } from "../types/inventory";

interface UnitsViewProps {
  assemblies: Assembly[];
  categories: string[];
  onAddCategory: (category: string) => void;
}

export const UnitsView: React.FC<UnitsViewProps> = ({
  assemblies,
  categories,
  onAddCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const assembledTotal = assemblies.reduce(
    (total, assembly) => total + assembly.completedCount,
    0,
  );
  const visibleAssemblies = useMemo(
    () =>
      assemblies.filter(
        (assembly) =>
          activeCategory === "All" || assembly.category === activeCategory,
      ),
    [assemblies, activeCategory],
  );

  const categoryCount = (category: string) =>
    assemblies.filter((assembly) => assembly.category === category).length;

  const handleAddCategory = (event: React.FormEvent) => {
    event.preventDefault();
    const name = categoryName.trim();

    if (!name) {
      setError("Enter a category name.");
      return;
    }

    if (
      categories.some(
        (category) => category.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setError("This category already exists.");
      return;
    }

    onAddCategory(name);
    setCategoryName("");
    setError("");
    setIsAddingCategory(false);
    setActiveCategory(name);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Units
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track completed assemblies and organize them by vehicle category.
          </p>
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Unit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Assembled units
            </span>
            <Boxes className="w-4 h-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {assembledTotal}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across all assembly records
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Vehicle categories
            </span>
            <PackagePlus className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {categories.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            E-bike, E-bus, E-cargo, and more
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Shown now
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {visibleAssemblies.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Assembly records in the selected category
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeCategory === "All"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All <span className="ml-1 opacity-75">{assemblies.length}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === category
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {category}{" "}
            <span className="ml-1 opacity-75">{categoryCount(category)}</span>
          </button>
        ))}
      </div>

      {visibleAssemblies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleAssemblies.map((assembly) => (
            <article
              key={assembly.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                    {assembly.code}
                  </span>
                  <h2 className="mt-3 text-base font-bold text-slate-900">
                    {assembly.name}
                  </h2>
                </div>
                <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {assembly.category}
                </span>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                    {assembly.completedCount}
                  </p>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  Target
                  <br />
                  <span className="font-semibold text-slate-700">
                    {assembly.targetQty} units
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center bg-white border border-dashed border-slate-300 rounded-xl">
          <Boxes className="w-8 h-8 mx-auto text-slate-300" />
          <h2 className="mt-3 text-sm font-semibold text-slate-800">
            No assembled units in {activeCategory}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            New assemblies assigned to this category will appear here.
          </p>
        </div>
      )}

      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Close add category dialog"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setIsAddingCategory(false);
              setError("");
            }}
          />
          <form
            onSubmit={handleAddCategory}
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add unit Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create a unit.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsAddingCategory(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label
              className="block mt-5 text-xs font-semibold text-slate-700"
              htmlFor="unit-category-name"
            >
              Unit name
            </label>
            <input
              id="unit-category-name"
              autoFocus
              value={categoryName}
              onChange={(event) => {
                setCategoryName(event.target.value);
                setError("");
              }}
              placeholder="e.g. E-tricycle"
              className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                Create New Unit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
