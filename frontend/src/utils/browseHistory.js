const KEY = 'cloudmart_browse_v1';

export function getBrowseHistory() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushBrowseProduct(productId) {
  if (!productId) return;
  const id = String(productId);
  const next = [id, ...getBrowseHistory().filter((x) => x !== id)].slice(0, 40);
  sessionStorage.setItem(KEY, JSON.stringify(next));
}
