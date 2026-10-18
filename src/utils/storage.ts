import type { AnyDocument, ClientProfile, PartyDetails } from '../types';

export type Theme = 'light' | 'dark';

const STORAGE_KEYS = {
  PROFILE: 'docudraft_business_profile',
  CLIENTS: 'docudraft_saved_clients',
  DOCUMENTS: 'docudraft_documents',
  THEME: 'docudraft_theme',
};

export const BLANK_PROFILE: PartyDetails = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
};

// --- Theme Preference ---
export function getSavedTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.error('Failed to read theme from storage', e);
  }
  return 'dark';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme to storage', e);
  }
}

// --- Business Profile ---
export function getSavedBusinessProfile(): PartyDetails {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read business profile from storage', e);
  }
  return BLANK_PROFILE;
}

export function saveBusinessProfile(profile: PartyDetails): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save business profile to storage', e);
  }
}

// --- Clients List ---
export function getSavedClients(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read clients from storage', e);
  }
  return [];
}

export function saveClient(client: Omit<ClientProfile, 'id'> & { id?: string }): ClientProfile {
  const clients = getSavedClients();
  const id = client.id || `client-${Date.now()}`;
  const updatedClient: ClientProfile = { ...client, id };

  const existingIdx = clients.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    clients[existingIdx] = updatedClient;
  } else {
    clients.push(updatedClient);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save client to storage', e);
  }
  return updatedClient;
}

// --- Documents History ---
export function getSavedDocuments(): AnyDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read saved documents', e);
  }
  return [];
}

export function saveDocument(doc: AnyDocument): void {
  const docs = getSavedDocuments();
  const existingIdx = docs.findIndex((d) => d.id === doc.id);
  const updatedDoc = { ...doc, updatedAt: Date.now() };

  if (existingIdx >= 0) {
    docs[existingIdx] = updatedDoc;
  } else {
    docs.unshift(updatedDoc);
  }

  saveAllDocuments(docs);
}

export function deleteDocument(id: string): void {
  const docs = getSavedDocuments().filter((d) => d.id !== id);
  saveAllDocuments(docs);
}

function saveAllDocuments(docs: AnyDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to storage', e);
  }
}

// --- Backup & Restore ---
export function exportBackupData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: getSavedBusinessProfile(),
    clients: getSavedClients(),
    documents: getSavedDocuments(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
    if (Array.isArray(parsed.clients)) localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(parsed.clients));
    if (Array.isArray(parsed.documents)) localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(parsed.documents));
    return true;
  } catch (e) {
    console.error('Failed to import backup data', e);
    return false;
  }
}
