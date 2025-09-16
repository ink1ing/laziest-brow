// 从查询语句中解析需要跳转的目标与搜索词
// ===== Dynamic mappings support =====
function sanitizeMappings(list) {
  if (!Array.isArray(list)) return [];
  const dedup = new Map();
  for (const item of list) {
    if (!item || typeof item.prefix !== 'string' || typeof item.urlTemplate !== 'string') continue;
    const prefix = item.prefix.trim();
    let urlTemplate = item.urlTemplate.trim();
    if (!prefix || !urlTemplate) continue;
    const lower = urlTemplate.toLowerCase();
    if (!(lower.startsWith('http://') || lower.startsWith('https://'))) continue;
    if (!urlTemplate.includes('%s')) {
      const sep = urlTemplate.includes('?') ? '&' : '?';
      urlTemplate = `${urlTemplate}${sep}q=%s`;
    }
    dedup.set(prefix, { prefix, urlTemplate, label: item.label || '' });
  }
  return Array.from(dedup.values());
}

let mappingCache = [];

function loadMappings() {
  try {
    chrome.storage.sync.get({ mappings: null }, (res) => {
      mappingCache = sanitizeMappings(res.mappings);
    });
  } catch (_) {
    mappingCache = [];
  }
}

loadMappings();
try {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.mappings) {
      mappingCache = sanitizeMappings(changes.mappings.newValue);
    }
  });
} catch (_) {}

function buildUrl(urlTemplate, term) {
  const encoded = encodeURIComponent(term);
  return urlTemplate.replace(/%s/g, encoded);
}

function matchPrefixRoute(query) {
  for (const m of mappingCache) {
    if (query.startsWith(m.prefix)) {
      const rest = query.slice(m.prefix.length).trim();
      if (!rest) return null;
      return buildUrl(m.urlTemplate, rest);
    }
  }
  return null;
}

function extractRedirect(raw) {
  if (!raw) return null;
  const query = raw.trim();

  const phrase = '今天什么新闻';
  if (query === phrase || query === `${phrase}/`) {
    return buildUrl('https://chatgpt.com/?q=%s&hints=search', phrase);
  }
  if (query.startsWith(phrase)) {
    const next = query.slice(phrase.length);
    const seps = ['/', ',', '，'];
    let rest = next.trimStart();
    if (rest && seps.includes(rest[0])) rest = rest.slice(1).trim();
    return buildUrl('https://chatgpt.com/?q=%s&hints=search', rest || phrase);
  }

  const url = matchPrefixRoute(query);
  if (url) return url;

  return null;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = new URL(details.url);

  if (url.hostname.includes('google.') && url.pathname === '/search') {
    const query = url.searchParams.get('q');

    const targetUrl = extractRedirect(query);
    if (targetUrl) {
      chrome.tabs.update(details.tabId, { url: targetUrl });
    }
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = details.url;

  if (url.includes('google.') && url.includes('/search?') && url.includes('q=')) {
    try {
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q');

      const targetUrl = extractRedirect(query);
      if (targetUrl) {
        chrome.tabs.update(details.tabId, { url: targetUrl });
      }
    } catch (e) {
      console.error('URL parsing error:', e);
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  try {
    const u = new URL(changeInfo.url);
    if (u.protocol === 'file:' && (!u.host || u.host === '')) {
      const rawPath = decodeURIComponent(u.pathname || '/');
      if (rawPath.startsWith('/') && rawPath.length > 1 && !rawPath.slice(1).includes('/') && !rawPath.slice(1).includes('.')) {
        const term = rawPath.slice(1).trim();
        if (term) {
          const slashMap = mappingCache.find((m) => m.prefix === '/') || mappingCache.find((m) => m.prefix === '//');
          const target = slashMap ? buildUrl(slashMap.urlTemplate, term) : `https://www.bing.com/search?q=${encodeURIComponent(term)}`;
          chrome.tabs.update(tabId, { url: target });
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }
});
