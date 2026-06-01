// Smart History — localStorage based per-tool input history
// Stores last 20 entries per tool slug

export interface HistoryEntry {
  id: string;
  toolSlug: string;
  input: string;
  label?: string;
  timestamp: number;
}

const HISTORY_KEY = 'devtoolkit:history';
const MAX_PER_TOOL = 20;
const MAX_INPUT_PREVIEW = 120;

function loadAll(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function addToHistory(toolSlug: string, input: string, label?: string): void {
  if (!input.trim() || input.length < 3) return;
  const all = loadAll();
  const entry: HistoryEntry = {
    id: `${toolSlug}-${Date.now()}`,
    toolSlug,
    input,
    label: label || input.substring(0, MAX_INPUT_PREVIEW),
    timestamp: Date.now(),
  };
  // Remove duplicate inputs for same tool
  const filtered = all.filter(e => !(e.toolSlug === toolSlug && e.input === input));
  // Keep newest first, limit per tool
  const toolEntries = [entry, ...filtered.filter(e => e.toolSlug === toolSlug)].slice(0, MAX_PER_TOOL);
  const otherEntries = filtered.filter(e => e.toolSlug !== toolSlug);
  saveAll([...toolEntries, ...otherEntries]);
}

export function getToolHistory(toolSlug: string): HistoryEntry[] {
  return loadAll()
    .filter(e => e.toolSlug === toolSlug)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getAllHistory(): HistoryEntry[] {
  return loadAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function clearToolHistory(toolSlug: string): void {
  saveAll(loadAll().filter(e => e.toolSlug !== toolSlug));
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
