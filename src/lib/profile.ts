// Dev Profile — localStorage based user profile
// Favorites, recent tools, snippets — no login required

export interface Snippet {
  id: string;
  name: string;
  content: string;
  language: string;
  toolSlug?: string;
  createdAt: number;
}

interface Profile {
  favorites: string[];       // tool slugs
  recentTools: string[];     // tool slugs, max 10
  snippets: Snippet[];
  theme: 'dark' | 'light';
  expertMode: boolean;       // false = beginner mode
}

const PROFILE_KEY = 'devtoolkit:profile';

const defaultProfile: Profile = {
  favorites: [],
  recentTools: [],
  snippets: [],
  theme: 'dark',
  expertMode: true,
};

function load(): Profile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') };
  } catch {
    return defaultProfile;
  }
}

function save(profile: Profile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): Profile { return load(); }

export function toggleFavorite(toolSlug: string): boolean {
  const p = load();
  const idx = p.favorites.indexOf(toolSlug);
  if (idx >= 0) p.favorites.splice(idx, 1);
  else p.favorites.unshift(toolSlug);
  save(p);
  return idx < 0;
}

export function isFavorite(toolSlug: string): boolean {
  return load().favorites.includes(toolSlug);
}

export function addRecentTool(toolSlug: string): void {
  const p = load();
  p.recentTools = [toolSlug, ...p.recentTools.filter(s => s !== toolSlug)].slice(0, 10);
  save(p);
}

export function getRecentTools(): string[] {
  return load().recentTools;
}

export function addSnippet(snippet: Omit<Snippet, 'id' | 'createdAt'>): Snippet {
  const p = load();
  const s: Snippet = { ...snippet, id: `snip-${Date.now()}`, createdAt: Date.now() };
  p.snippets.unshift(s);
  save(p);
  return s;
}

export function deleteSnippet(id: string): void {
  const p = load();
  p.snippets = p.snippets.filter(s => s.id !== id);
  save(p);
}

export function getSnippets(): Snippet[] {
  return load().snippets;
}

export function setExpertMode(expert: boolean): void {
  const p = load();
  p.expertMode = expert;
  save(p);
}

export function isExpertMode(): boolean {
  return load().expertMode;
}
