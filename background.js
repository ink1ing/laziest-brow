// 从查询语句中解析需要跳转的目标与搜索词
// 约定：
// - 以 `,` 或 `，` 开头：跳转 ChatGPT（去掉前缀）
// - 以 `今天什么新闻` 开头：跳转 ChatGPT（同原有规则）
// - 以 `。`（中文句号）或 `.` 开头：跳转 FuClaude Demo（去掉前缀）
// - 以 `/` 开头：跳转 Bing（去掉前缀）
function extractRedirect(raw) {
  if (!raw) return null;
  const query = raw.trim();

  // ChatGPT：英文/中文逗号前缀（不变）
  if (query.startsWith(',') || query.startsWith('，')) {
    const rest = query.slice(1).trim();
    return rest ? { to: 'chatgpt', term: rest } : null;
  }

  // ChatGPT：“今天什么新闻”前缀的多种形式
  const prefix = '今天什么新闻';
  if (query === prefix || query === `${prefix}/`) {
    return { to: 'chatgpt', term: prefix };
  }
  if (query.startsWith(prefix)) {
    const next = query.slice(prefix.length);
    if (!next) return { to: 'chatgpt', term: prefix };
    const separators = ['/', ',', '，'];
    let rest = next.trimStart();
    if (rest && separators.includes(rest[0])) {
      rest = rest.slice(1).trim();
    }
    return { to: 'chatgpt', term: rest || prefix };
  }

  // FuClaude Demo：句号前缀（全角或半角）
  if (query.startsWith('。') || query.startsWith('.')) {
    const rest = query.slice(1).trim();
    return rest ? { to: 'fuclaude', term: rest } : null;
  }

  // Bing：斜杠前缀
  if (query.startsWith('/')) {
    const rest = query.slice(1).trim();
    return rest ? { to: 'bing', term: rest } : null;
  }

  // GitHub 搜索：分号前缀（全角或半角）
  if (query.startsWith('；') || query.startsWith(';')) {
    const rest = query.slice(1).trim();
    return rest ? { to: 'github', term: rest } : null;
  }

  // 维基百科（中文）：单引号前缀（左单引号‘ 或 ASCII '）
  if (query.startsWith('‘') || query.startsWith("'")) {
    const rest = query.slice(1).trim();
    return rest ? { to: 'wiki', term: rest } : null;
  }

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
      let targetUrl = '';
      if (info.to === 'chatgpt') {
        targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(info.term)}&hints=search`;
      } else if (info.to === 'bing') {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(info.term)}`;
      } else if (info.to === 'fuclaude') {
        targetUrl = `https://demo.fuclaude.com/new?q=${encodeURIComponent(info.term)}`;
      } else if (info.to === 'github') {
        targetUrl = `https://github.com/search?q=${encodeURIComponent(info.term)}`;
      } else if (info.to === 'wiki') {
        targetUrl = `https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(info.term)}`;
      }

      if (targetUrl) {
        chrome.tabs.update(details.tabId, { url: targetUrl });
      }
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
        let targetUrl = '';
        if (info.to === 'chatgpt') {
          targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(info.term)}&hints=search`;
        } else if (info.to === 'bing') {
          targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(info.term)}`;
        } else if (info.to === 'fuclaude') {
          targetUrl = `https://demo.fuclaude.com/new?q=${encodeURIComponent(info.term)}`;
        } else if (info.to === 'github') {
          targetUrl = `https://github.com/search?q=${encodeURIComponent(info.term)}`;
        } else if (info.to === 'wiki') {
          targetUrl = `https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(info.term)}`;
        }

        if (targetUrl) {
          chrome.tabs.update(details.tabId, { url: targetUrl });
        }
      }
    } catch (e) {
      console.error('URL parsing error:', e);
    }
  }
});

  // 处理地址栏直接输入以“/关键词”导致的 file:/// 跳转
// 某些情况下，Chrome 会将以“/”开头的输入当作本地文件路径，出现 ERR_FILE_NOT_FOUND。
// 这里拦截 tab URL 变化，若是类似 file:///关键词 的无扩展名、单段路径，则重定向到 Bing。
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
          const bing = `https://www.bing.com/search?q=${encodeURIComponent(term)}`;
          chrome.tabs.update(tabId, { url: bing });
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }
});
