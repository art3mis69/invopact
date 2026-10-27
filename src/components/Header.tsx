import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Scroll,
  Printer,
  Download,
  FolderOpen,
  Building2,
  Sparkles,
  Plus,
  Save,
  Check,
  ChevronDown,
  Sun,
  Moon,
  Share2,
  Smartphone,
  FileJson,
  Upload,
  MoreVertical,
} from 'lucide-react';
import type { DocumentType } from '../types';
import type { Theme } from '../utils/storage';

interface HeaderProps {
  documentType: DocumentType;
  onSwitchType: (type: DocumentType) => void;
  onOpenProfile: () => void;
  onOpenSavedDocs: () => void;
  onToggleDemo: () => void;
  isDemoActive: boolean;
  onNewDoc: () => void;
  onSaveCurrentDoc: () => void;
  onShareLink: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onExportJson?: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  savedCount: number;
  isGeneratingPdf: boolean;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  documentType,
  onSwitchType,
  onOpenProfile,
  onOpenSavedDocs,
  onToggleDemo,
  isDemoActive,
  onNewDoc,
  onSaveCurrentDoc,
  onShareLink,
  onPrint,
  onDownloadPdf,
  onExportJson,
  onImportJson,
  savedCount,
  isGeneratingPdf,
  theme,
  onToggleTheme,
}) => {
  const [saveNotice, setSaveNotice] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSaveClick = () => {
    onSaveCurrentDoc();
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  const handleShareClick = () => {
    onShareLink();
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2500);
  };

  return (
    <header className="no-print bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Brand & Type Switcher */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 ring-black/5 dark:ring-white/10">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight leading-none block">
                  InvoPact
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-1 rounded">
                  Studio
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switch Tabs - Segmented Pill Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => onSwitchType('invoice')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
                documentType === 'invoice'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
            <button
              onClick={() => onSwitchType('contract')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
                documentType === 'contract'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agreement / SOW</span>
              <span className="sm:hidden">SOW</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Desktop Document Tools (New, Demo, Profile, Library) */}
          <div className="hidden md:flex items-center gap-0.5 sm:gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-0.5 sm:p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={onNewDoc}
              title="Create a new blank document"
              className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>New</span>
            </button>

            <button
              onClick={onToggleDemo}
              title={isDemoActive ? 'Clear demo data and reset' : 'Fill sample demo data'}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                isDemoActive
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles
                className={`w-3.5 h-3.5 shrink-0 ${
                  isDemoActive ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : 'text-amber-500'
                }`}
              />
              <span>{isDemoActive ? 'Clear Demo' : 'Demo'}</span>
            </button>

            <button
              onClick={onOpenProfile}
              title="Edit your business profile and default payment info"
              className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Profile</span>
            </button>

            <button
              onClick={onOpenSavedDocs}
              title="Open saved documents library"
              className="relative flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
              <span>Library</span>
              {savedCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Quick Actions: Save & Share */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={handleSaveClick}
              title="Save document locally in browser"
              className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {saveNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareClick}
              title="Copy instant client web view link (zero backend)"
              className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {shareNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile-Only Action Group: Library Pill + More Dropdown */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={onOpenSavedDocs}
              title="Open saved library"
              className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
            >
              <FolderOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMobileMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <button
                    onClick={onNewDoc}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <span>New Blank Document</span>
                  </button>

                  <button
                    onClick={onToggleDemo}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isDemoActive ? 'Clear Demo Data' : 'Load Demo Data'}</span>
                  </button>

                  <button
                    onClick={handleSaveClick}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <Save className="w-4 h-4 text-emerald-500" />
                    <span>Save Current Draft</span>
                  </button>

                  <button
                    onClick={handleShareClick}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-indigo-500" />
                    <span>Copy Client Share Link</span>
                  </button>

                  <button
                    onClick={onOpenProfile}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Business Profile</span>
                  </button>

                  {deferredPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full px-3.5 py-2 text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 font-semibold cursor-pointer border-t border-slate-100 dark:border-slate-800"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Install App on Device</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PWA Offline App Install Button (Desktop) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              title="Install InvoPact as a standalone mobile/desktop app"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Hidden JSON File Import Input */}
          <input
            type="file"
            ref={jsonInputRef}
            onChange={onImportJson}
            accept=".json"
            className="hidden"
          />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs shrink-0"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Primary Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={onPrint}
                  className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <div>
                    <span className="block font-semibold">Print / Save as PDF</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Vector print with native page dialog</span>
                  </div>
                </button>

                <button
                  onClick={onDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-800"
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="block font-semibold">
                      {isGeneratingPdf ? 'Generating...' : 'Direct PDF Download'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Immediate client-side .pdf export</span>
                  </div>
                </button>

                {onExportJson && (
                  <button
                    onClick={onExportJson}
                    className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="block font-semibold">Export JSON Draft</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Save active file as portable JSON</span>
                    </div>
                  </button>
                )}

                {onImportJson && (
                  <button
                    onClick={() => jsonInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-800"
                  >
                    <Upload className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <div>
                      <span className="block font-semibold">Import JSON File</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Restore or load an existing .json</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
