import LZString from 'lz-string';
import type { AnyDocument } from '../types';

export function encodeDocumentToShareUrl(doc: AnyDocument): string {
  try {
    const json = JSON.stringify(doc);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const url = new URL(window.location.href);
    url.hash = `share=${compressed}`;
    return url.toString();
  } catch (error) {
    console.error('Failed to encode document to share link', error);
    return window.location.href;
  }
}

export function decodeDocumentFromHash(): AnyDocument | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('share=')) return null;

    const parts = hash.split('share=');
    if (parts.length < 2) return null;

    const compressed = parts[1];
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;

    const doc = JSON.parse(decompressed);
    if (doc && (doc.type === 'invoice' || doc.type === 'contract')) {
      return doc as AnyDocument;
    }
  } catch (error) {
    console.error('Failed to decode document from share link', error);
  }
  return null;
}

export async function copyShareLink(doc: AnyDocument): Promise<boolean> {
  try {
    const url = encodeDocumentToShareUrl(doc);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard', error);
    return false;
  }
}
