// 从查询语句中解析需要跳转的目标与搜索词
// 约定：
// - 以 `,` 或 `，` 开头：跳转 ChatGPT（去掉前缀）
// - 以 `今天什么新闻` 开头：跳转 ChatGPT（同原有规则）
// - 以 `。`（中文句号）或 `.` 开头：跳转 FuClaude Demo（去掉前缀）
// - 以 `/` 开头：跳转 Bing（去掉前缀）
// - 以 `、` 或 `\` 开头：跳转 Bilibili（去掉前缀）
// ===== Dynamic mappings support =====
const DEFAULT_MAPPINGS = [
  { prefix: ',', label: 'ChatGPT', urlTemplate: 'https://chatgpt.com/?q=%s&hints=search' },
  { prefix: '，', label: 'ChatGPT', urlTemplate: 'https://chatgpt.com/?q=%s&hints=search' },
  { prefix: '.', label: 'FuClaude', urlTemplate: 'https://demo.fuclaude.com/new?q=%s' },
  { prefix: '。', label: 'FuClaude', urlTemplate: 'https://demo.fuclaude.com/new?q=%s' },
  { prefix: '/', label: 'Bing', urlTemplate: 'https://www.bing.com/search?q=%s' },
  { prefix: ';', label: 'GitHub', urlTemplate: 'https://github.com/search?q=%s' },
  { prefix: '；', label: 'GitHub', urlTemplate: 'https://github.com/search?q=%s' },
  { prefix: "'", label: 'Wikipedia ZH', urlTemplate: 'https://zh.wikipedia.org/w/index.php?search=%s' },
  { prefix: '‘', label: 'Wikipedia ZH', urlTemplate: 'https://zh.wikipedia.org/w/index.php?search=%s' },
  { prefix: '、', label: 'Bilibili', urlTemplate: 'https://search.bilibili.com/all?keyword=%s' },
  { prefix: '\\', label: 'Bilibili', urlTemplate: 'https://search.bilibili.com/all?keyword=%s' },
];

let mappingCache = DEFAULT_MAPPINGS.slice();

// Load mappings from storage and keep in cache
function loadMappings() {
  try {
    chrome.storage.sync.get({ mappings: null }, (res) => {
      if (Array.isArray(res.mappings) && res.mappings.length > 0) {
        mappingCache = res.mappings;
      } else {
        mappingCache = DEFAULT_MAPPINGS.slice();
      }
    });
  } catch (_) {
    mappingCache = DEFAULT_MAPPINGS.slice();
  }
}

loadMappings();
try {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.mappings) {
      const { newValue } = changes.mappings;
      if (Array.isArray(newValue) && newValue.length > 0) {
        mappingCache = newValue;
      } else {
        mappingCache = DEFAULT_MAPPINGS.slice();
      }
    }
  });
} catch (_) {}

function buildUrl(urlTemplate, term) {
  const encoded = encodeURIComponent(term);
  if (urlTemplate.includes('%s')) return urlTemplate.replace(/%s/g, encoded);
  // fallback: append q param
  const hasQuery = urlTemplate.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${urlTemplate}${sep}q=${encoded}`;
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

  // Special phrase → ChatGPT
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

  // Dynamic prefixes
  const url = matchPrefixRoute(query);
  if (url) return url;

  return null;
}

// 监听页面导航事件
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // 只处理主框架的导航
  if (details.frameId !== 0) return;

  const url = new URL(details.url);

  // 检查是否为Google搜索
  if (url.hostname.includes('google.') && url.pathname === '/search') {
    const query = url.searchParams.get('q');

    const info = extractRedirect(query);
    if (info) {
      const targetUrl = info; // now info is already a URL string
      chrome.tabs.update(details.tabId, { url: targetUrl });
    }
  }
});

// 处理地址栏直接输入的情况
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = details.url;

  // 检查是否为搜索引擎结果页面
  if (url.includes('google.') && url.includes('/search?') && url.includes('q=')) {
    try {
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q');

      const info = extractRedirect(query);
      if (info) {
        const targetUrl = info;
        chrome.tabs.update(details.tabId, { url: targetUrl });
      }
    } catch (e) {
      console.error('URL parsing error:', e);
    }
  }
});

  // 处理地址栏直接输入以“/关键词”导致的 file:/// 跳转
// 某些情况下，Chrome 会将以“/”开头的输入当作本地文件路径，出现 ERR_FILE_NOT_FOUND。
// 这里拦截 tab URL 变化，若是类似 file:///关键词 的无扩展名、单段路径，则重定向到配置中 '/' 对应的搜索（若缺失则 Bing）。
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  try {
    const u = new URL(changeInfo.url);
    if (u.protocol === 'file:' && (!u.host || u.host === '')) {
      const rawPath = decodeURIComponent(u.pathname || '/'); // e.g. '/关键词'
      // 仅处理形如 '/term' 的单段路径，且不包含点号（避免误伤真实文件）
      if (rawPath.startsWith('/') && rawPath.length > 1 && !rawPath.slice(1).includes('/') && !rawPath.slice(1).includes('.')) {
        const term = rawPath.slice(1).trim();
        if (term) {
          // prefer user-configured '/' mapping
          const slashMap = mappingCache.find(m => m.prefix === '/');
          const target = slashMap ? buildUrl(slashMap.urlTemplate, term) : `https://www.bing.com/search?q=${encodeURIComponent(term)}`;
          chrome.tabs.update(tabId, { url: target });
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }
});
