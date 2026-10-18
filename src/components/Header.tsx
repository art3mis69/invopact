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
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Type Switcher */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none block">
                InvoPact
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Invoice & Contract Studio
              </span>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => onSwitchType('invoice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                documentType === 'invoice'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Invoice
            </button>
            <button
              onClick={() => onSwitchType('contract')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                documentType === 'contract'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              Agreement / SOW
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile switcher dropdown */}
          <div className="md:hidden">
            <select
              value={documentType}
              onChange={(e) => onSwitchType(e.target.value as DocumentType)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200"
            >
              <option value="invoice">Invoice</option>
              <option value="contract">Agreement</option>
            </select>
          </div>

          {/* Group 1: Document Tools (New, Demo, Profile, Library) */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={onNewDoc}
              title="Create a new blank document"
              className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="hidden sm:inline">New</span>
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
              <span className="hidden sm:inline">{isDemoActive ? 'Clear Demo' : 'Demo'}</span>
            </button>

            <button
              onClick={onOpenProfile}
              title="Edit your business profile and default payment info"
              className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
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
              <span className="hidden sm:inline">Library</span>
              {savedCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          {/* Group 2: Document State (Save, Share) */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveClick}
              title="Save document locally"
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
                  <span className="hidden sm:inline">Save</span>
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
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>

          {/* PWA Offline App Install Button */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              title="Install InvoPact as an offline desktop/mobile app"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
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

          {/* Subtle vertical divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Export / Print Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={onPrint}
                  className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <div>
                    <span className="block font-semibold">Print / Save as PDF</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">High-res vector print dialog</span>
                  </div>
                </button>

                <button
                  onClick={onDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-700"
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="block font-semibold">
                      {isGeneratingPdf ? 'Generating...' : 'Direct PDF Download'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">Immediate .pdf file download</span>
                  </div>
                </button>

                {onExportJson && (
                  <button
                    onClick={onExportJson}
                    className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-700"
                  >
                    <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="block font-semibold">Export Document (.json)</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400">Save active file as JSON draft</span>
                    </div>
                  </button>
                )}

                {onImportJson && (
                  <button
                    onClick={() => jsonInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100 dark:border-slate-700"
                  >
                    <Upload className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <div>
                      <span className="block font-semibold">Import Document (.json)</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400">Open a saved .json file</span>
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
