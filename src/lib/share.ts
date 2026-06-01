// Shareable Links — encode/decode tool state into URL fragments
// No server required — 100% client-side

export interface ShareState {
  toolSlug: string;
  input?: string;
  options?: Record<string, unknown>;
}

const MAX_SHARE_SIZE = 50000; // 50KB limit

export function encodeShare(state: ShareState): string {
  try {
    const json = JSON.stringify(state);
    if (json.length > MAX_SHARE_SIZE) {
      throw new Error('Input too large to share (max 50KB)');
    }
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to encode share link');
  }
}

export function decodeShare(encoded: string): ShareState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as ShareState;
  } catch {
    return null;
  }
}

export function buildShareUrl(state: ShareState): string {
  const encoded = encodeShare(state);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/tools/${state.toolSlug}#share=${encoded}`;
}

export function parseShareFromUrl(): ShareState | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  const match = hash.match(/[#&]share=([^&]+)/);
  if (!match) return null;
  return decodeShare(match[1]);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}
