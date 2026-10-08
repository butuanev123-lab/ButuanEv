import React, { useState } from 'react';
import { Package, Sparkles, Image as ImageIcon, Check, X, Upload } from 'lucide-react';
import { ButuanEvLogo } from './ButuanEvLogo';

interface LogoPlaceholderProps {
  collapsed?: boolean;
  className?: string;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ collapsed = false, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [brandName, setBrandName] = useState('ButuanEV');
  const [brandSubtitle, setBrandSubtitle] = useState('Inventory System');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomLogoUrl(url);
    }
  };

  return (
    <>
      <div
        className={`group relative flex items-center gap-3 select-none transition-all ${className}`}
        title="Click logo to customize brand mark"
      >
        {/* Logo Mark Container */}
        <div
          onClick={() => setIsEditing(true)}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-[1.5px] shadow-sm hover:shadow cursor-pointer transition-transform duration-150 active:scale-95 group-hover:scale-105"
        >
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="Brand Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ButuanEvLogo size={36} />
            )}
          </div>
          {/* Subtle edit hint on hover */}
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]">
            +
          </div>
        </div>

        {/* Brand Text (Hidden when sidebar is collapsed) */}
        {!collapsed && (
          <div className="flex flex-col min-w-0 cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-[15px] truncate hover:text-teal-700 transition-colors">
                {brandName}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-1 py-0.2 rounded font-mono">
                EV Ops
              </span>
            </div>
            <span className="text-xs text-slate-500 truncate font-medium">
              {brandSubtitle}
            </span>
          </div>
        )}
      </div>

      {/* Modal for replacing logo & brand name */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Customize Brand & Logo</h3>
                  <p className="text-xs text-slate-500">Update company title or upload your company logo</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / System Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="e.g. ButuanEV"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={brandSubtitle}
                  onChange={(e) => setBrandSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="e.g. Inventory System"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Alternate Logo Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-lg p-4 cursor-pointer transition-colors bg-slate-50 hover:bg-teal-50/30">
                    <Upload className="w-5 h-5 text-teal-600 mb-1" />
                    <span className="text-xs font-medium text-slate-700">Choose custom logo file</span>
                    <span className="text-[10px] text-slate-400">Replaces current ButuanEV emblem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomLogoUrl(null)}
                      className="text-xs text-rose-600 hover:underline px-2 py-1"
                    >
                      Reset default
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
