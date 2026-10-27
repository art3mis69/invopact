import { useState, useEffect } from 'react';
import { Edit3, Eye } from 'lucide-react';
import type {
  DocumentType,
  InvoiceData,
  ContractData,
  AnyDocument,
  PartyDetails,
} from './types';
import {
  getSavedBusinessProfile,
  saveBusinessProfile,
  getSavedDocuments,
  saveDocument,
  deleteDocument,
  exportBackupData,
  importBackupData,
  getSavedTheme,
  saveTheme,
  type Theme,
} from './utils/storage';
import {
  SAMPLE_INVOICE,
  SAMPLE_CONTRACT,
  createBlankInvoice,
  createBlankContract,
} from './utils/sampleData';
import { triggerPrint, downloadElementAsPdf } from './utils/pdfExport';
import { decodeDocumentFromHash, copyShareLink } from './utils/shareLink';
import { convertContractToInvoice, convertInvoiceToContract } from './utils/converter';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ContractForm } from './components/ContractForm';
import { ContractPreview } from './components/ContractPreview';
import { BusinessProfileModal } from './components/BusinessProfileModal';
import { SavedDocsModal } from './components/SavedDocsModal';

export function App() {
  const [activeType, setActiveType] = useState<DocumentType>('invoice');
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [isClientView, setIsClientView] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Initialize with clean blank canvas prefilled only with user's saved business profile (if any)
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    const blank = createBlankInvoice();
    const profile = getSavedBusinessProfile();
    if (profile.name || profile.company) blank.sender = { ...profile };
    return blank;
  });

  const [contract, setContract] = useState<ContractData>(() => {
    const blank = createBlankContract();
    const profile = getSavedBusinessProfile();
    if (profile.name || profile.company) blank.provider = { ...profile };
    return blank;
  });

  const [savedDocs, setSavedDocs] = useState<AnyDocument[]>([]);
  const [businessProfile, setBusinessProfile] = useState<PartyDetails>(getSavedBusinessProfile);

  // Track demo state and user draft backups per document type
  const [demoState, setDemoState] = useState<{ invoice: boolean; contract: boolean }>({
    invoice: false,
    contract: false,
  });
  const [userDraftBackup, setUserDraftBackup] = useState<{
    invoice: InvoiceData | null;
    contract: ContractData | null;
  }>({ invoice: null, contract: null });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavedDocsOpen, setIsSavedDocsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Sync theme with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for shared URL hash on mount
  useEffect(() => {
    const sharedDoc = decodeDocumentFromHash();
    if (sharedDoc) {
      if (sharedDoc.type === 'invoice') {
        setActiveType('invoice');
        setInvoice(sharedDoc);
      } else {
        setActiveType('contract');
        setContract(sharedDoc);
      }
      setIsClientView(true);
    }
  }, []);

  // Initialize storage
  useEffect(() => {
    setSavedDocs(getSavedDocuments());
    setBusinessProfile(getSavedBusinessProfile());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  // Handlers for switching and creating docs
  const handleSwitchType = (type: DocumentType) => {
    setActiveType(type);
  };

  const handleNewDoc = () => {
    setDemoState((prev) => ({ ...prev, [activeType]: false }));
    if (activeType === 'invoice') {
      const blank = createBlankInvoice();
      if (businessProfile.name || businessProfile.company) {
        blank.sender = { ...businessProfile };
      }
      setInvoice(blank);
    } else {
      const blank = createBlankContract();
      if (businessProfile.name || businessProfile.company) {
        blank.provider = { ...businessProfile };
      }
      setContract(blank);
    }
  };

  // Toggle demo data on and off
  const handleToggleDemo = () => {
    const isCurrentDemo = demoState[activeType];
    if (isCurrentDemo) {
      // Turn OFF demo: restore previous user draft or create blank
      if (activeType === 'invoice') {
        const restored = userDraftBackup.invoice || createBlankInvoice();
        if (!userDraftBackup.invoice && (businessProfile.name || businessProfile.company)) {
          restored.sender = { ...businessProfile };
        }
        setInvoice(restored);
      } else {
        const restored = userDraftBackup.contract || createBlankContract();
        if (!userDraftBackup.contract && (businessProfile.name || businessProfile.company)) {
          restored.provider = { ...businessProfile };
        }
        setContract(restored);
      }
      setDemoState((prev) => ({ ...prev, [activeType]: false }));
    } else {
      // Turn ON demo: save current user draft so we don't lose it, then load demo
      setUserDraftBackup((prev) => ({
        ...prev,
        [activeType]: activeType === 'invoice' ? { ...invoice } : { ...contract },
      }));
      if (activeType === 'invoice') {
        setInvoice({ ...SAMPLE_INVOICE, id: `inv-${Date.now()}` });
      } else {
        setContract({ ...SAMPLE_CONTRACT, id: `con-${Date.now()}` });
      }
      setDemoState((prev) => ({ ...prev, [activeType]: true }));
    }
  };

  const handleSaveCurrentDoc = () => {
    const currentDoc = activeType === 'invoice' ? invoice : contract;
    saveDocument(currentDoc);
    setSavedDocs(getSavedDocuments());
  };

  const handleSelectDocFromLibrary = (doc: AnyDocument) => {
    setDemoState((prev) => ({ ...prev, [doc.type]: false }));
    if (doc.type === 'invoice') {
      setActiveType('invoice');
      setInvoice(doc);
    } else {
      setActiveType('contract');
      setContract(doc);
    }
  };

  const handleDuplicateDoc = (doc: AnyDocument) => {
    const newId = `${doc.type === 'invoice' ? 'inv' : 'con'}-${Date.now()}`;
    const duplicated = {
      ...doc,
      id: newId,
      status: 'draft' as const,
      updatedAt: Date.now(),
    };
    saveDocument(duplicated);
    setSavedDocs(getSavedDocuments());
  };

  const handleDeleteDoc = (id: string) => {
    deleteDocument(id);
    setSavedDocs(getSavedDocuments());
  };

  const handleSaveBusinessProfile = (profile: PartyDetails) => {
    saveBusinessProfile(profile);
    setBusinessProfile(profile);
  };

  const handleUseMyProfileInCurrentDoc = () => {
    if (activeType === 'invoice') {
      setInvoice({ ...invoice, sender: { ...businessProfile } });
    } else {
      setContract({ ...contract, provider: { ...businessProfile } });
    }
  };

  // 1-Click Conversion between Document Types
  const handleConvertToContract = () => {
    const converted = convertInvoiceToContract(invoice);
    setContract(converted);
    setActiveType('contract');
    saveDocument(converted);
    setSavedDocs(getSavedDocuments());
  };

  const handleConvertToInvoice = () => {
    const converted = convertContractToInvoice(contract);
    setInvoice(converted);
    setActiveType('invoice');
    saveDocument(converted);
    setSavedDocs(getSavedDocuments());
  };

  // Export handlers
  const handlePrint = () => {
    triggerPrint();
  };

  const handleDownloadPdf = () => {
    const isInvoice = activeType === 'invoice';
    const elementId = isInvoice ? 'invoice-preview-sheet' : 'contract-preview-sheet';
    const filename = isInvoice
      ? `${invoice.invoiceNumber || 'Invoice'}_${invoice.client.name || 'Client'}.pdf`
      : `${contract.contractNumber || 'Contract'}_${contract.client.name || 'Agreement'}.pdf`;

    downloadElementAsPdf(elementId, filename, setIsGeneratingPdf);
  };

  const handleShareLink = () => {
    const currentDoc = activeType === 'invoice' ? invoice : contract;
    copyShareLink(currentDoc);
  };

  // Backup handlers
  const handleExportBackup = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invopact_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackupData(content)) {
        setSavedDocs(getSavedDocuments());
        setBusinessProfile(getSavedBusinessProfile());
        alert('Backup restored successfully!');
      } else {
        alert('Failed to restore backup. Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Single document JSON export & import handlers
  const handleExportSingleDocJson = () => {
    const currentDoc = activeType === 'invoice' ? invoice : contract;
    const json = JSON.stringify(currentDoc, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const docNum = activeType === 'invoice' ? invoice.invoiceNumber : contract.contractNumber;
    a.download = `${docNum || activeType}_${new Date().toISOString().split('T')[0]}.invopact.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSingleDocJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.type === 'invoice') {
          setActiveType('invoice');
          setInvoice(parsed);
          saveDocument(parsed);
          setSavedDocs(getSavedDocuments());
          alert('Invoice imported successfully!');
        } else if (parsed.type === 'contract') {
          setActiveType('contract');
          setContract(parsed);
          saveDocument(parsed);
          setSavedDocs(getSavedDocuments());
          alert('Agreement imported successfully!');
        } else {
          alert('Unrecognized InvoPact document file.');
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
      {/* Client View Notification Banner */}
      {isClientView && (
        <div className="no-print bg-indigo-600 text-white text-xs py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Client View:</span>
            <span>You are viewing a shared {activeType}.</span>
          </div>
          <button
            onClick={() => {
              window.location.hash = '';
              setIsClientView(false);
            }}
            className="underline font-semibold hover:text-indigo-100 cursor-pointer"
          >
            Switch to Editor Studio
          </button>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        documentType={activeType}
        onSwitchType={handleSwitchType}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSavedDocs={() => setIsSavedDocsOpen(true)}
        onToggleDemo={handleToggleDemo}
        isDemoActive={demoState[activeType]}
        onNewDoc={handleNewDoc}
        onSaveCurrentDoc={handleSaveCurrentDoc}
        onShareLink={handleShareLink}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onExportJson={handleExportSingleDocJson}
        onImportJson={handleImportSingleDocJson}
        savedCount={savedDocs.length}
        isGeneratingPdf={isGeneratingPdf}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 max-w-[1536px] w-full min-w-0 mx-auto p-2 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start pb-24 lg:pb-6 overflow-x-hidden">
        {/* Left Column: Form Controls (hidden on mobile if in preview tab, or if in shared client view) */}
        {!isClientView && (
          <section
            className={`no-print lg:col-span-5 2xl:col-span-5 w-full min-w-0 max-w-full ${
              mobileTab === 'editor' ? 'block' : 'hidden lg:block'
            } lg:h-[calc(100vh-5.5rem)] lg:sticky lg:top-18`}
          >
            {activeType === 'invoice' ? (
              <InvoiceForm
                data={invoice}
                onChange={setInvoice}
                onUseMyProfile={handleUseMyProfileInCurrentDoc}
                onSaveAsMyProfile={handleSaveBusinessProfile}
                onConvertToContract={handleConvertToContract}
              />
            ) : (
              <ContractForm
                data={contract}
                onChange={setContract}
                onUseMyProfile={handleUseMyProfileInCurrentDoc}
                onSaveAsMyProfile={handleSaveBusinessProfile}
                onConvertToInvoice={handleConvertToInvoice}
              />
            )}
          </section>
        )}

        {/* Right Column: Studio Drafting Desk Canvas */}
        <section
          className={`${
            isClientView ? 'lg:col-span-12' : 'lg:col-span-7 2xl:col-span-7'
          } ${
            !isClientView && mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          } w-full min-w-0 max-w-full bg-studio-desk rounded-2xl border border-slate-300/60 dark:border-slate-800/80 p-2 sm:p-5 lg:p-8 justify-center min-h-[calc(100vh-5.5rem)] transition-colors overflow-x-auto`}
        >
          {activeType === 'invoice' ? (
            <InvoicePreview data={invoice} />
          ) : (
            <ContractPreview data={contract} />
          )}
        </section>
      </main>

      {/* Mobile Floating View Selector (PWA-Optimized bottom bar) */}
      {!isClientView && (
        <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl text-white p-1 rounded-full shadow-2xl border border-white/15 flex items-center gap-1 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>A4 Document</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <BusinessProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={businessProfile}
        onSave={handleSaveBusinessProfile}
      />

      <SavedDocsModal
        isOpen={isSavedDocsOpen}
        onClose={() => setIsSavedDocsOpen(false)}
        documents={savedDocs}
        onSelectDoc={handleSelectDocFromLibrary}
        onDuplicateDoc={handleDuplicateDoc}
        onDeleteDoc={handleDeleteDoc}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />
    </div>
  );
}

export default App;
