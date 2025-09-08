(() => {
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

  const I18N = {
    en: {
      title: 'Prefix Router',
      subtitle: 'Configure mappings from a typed prefix to a target URL template.\nUse %s as placeholder for the query.',
      restore: 'Restore Defaults',
      export: 'Export',
      copyJson: 'Copy JSON',
      copyLink: 'Copy Link',
      importFile: 'Import (File)',
      importPaste: 'Import (Paste)',
      currentMappings: 'Current Mappings',
      addNew: 'Add New Mapping',
      prefix: 'Prefix',
      target: 'Target URL template',
      add: 'Add',
      edit: 'Edit',
      save: '✅',
      saveTitle: 'Save',
      delete: 'Delete',
      repo: 'GitHub Repo',
      thanks: 'Thanks: @ink @codex',
      switchLang: '中文',
      alerts: {
        prefixRequired: 'Prefix required',
        urlRequired: 'URL template required',
        urlNoPlaceholder: 'URL template does not contain %s. Append ?q=%s automatically?',
        exists: 'Prefix already exists',
        restoreConfirm: 'Restore default mappings? This will overwrite current mappings.',
        invalidJson: 'Invalid JSON',
        invalidConfig: 'Invalid config format',
        importConfirmReplace: 'Import %d mappings. OK = Replace All, Cancel = Merge (overwrite same prefix).',
        importConfirmFixMissing: '%d URL(s) missing %s placeholder. Append automatically? OK = Yes, Cancel = No',
        importedN: 'Imported %d mapping(s).',
        jsonCopied: 'JSON copied to clipboard.',
        linkCopied: 'Link copied to clipboard.'
      },
      placeholders: {
        prefix: ',',
        url: 'https://example.com/search?q=%s'
      }
    },
    zh: {
      title: '前缀路由',
      subtitle: '配置前缀到目标 URL 模板的映射。\n使用 %s 作为查询占位符。',
      restore: '恢复默认',
      export: '导出',
      copyJson: '复制 JSON',
      copyLink: '复制链接',
      importFile: '文件导入',
      importPaste: '粘贴导入',
      currentMappings: '当前映射',
      addNew: '新增映射',
      prefix: '前缀',
      target: '目标 URL 模板',
      add: '添加',
      edit: '编辑',
      save: '✅',
      saveTitle: '保存',
      delete: '删除',
      repo: 'GitHub 仓库',
      thanks: '鸣谢：@ink @codex',
      switchLang: 'English',
      alerts: {
        prefixRequired: '请填写前缀',
        urlRequired: '请填写 URL 模板',
        urlNoPlaceholder: 'URL 模板缺少 %s。是否自动追加 ?q=%s？',
        exists: '该前缀已存在',
        restoreConfirm: '确认恢复默认映射？当前设置将被覆盖。',
        invalidJson: 'JSON 格式无效',
        invalidConfig: '配置格式无效',
        importConfirmReplace: '将导入 %d 条映射。确定=全部替换，取消=合并（同前缀覆盖）。',
        importConfirmFixMissing: '有 %d 条 URL 模板缺少 %s 占位符，是否自动追加？确定=是，取消=否',
        importedN: '已导入 %d 条映射。',
        jsonCopied: 'JSON 已复制到剪贴板。',
        linkCopied: '链接已复制到剪贴板。'
      },
      placeholders: {
        prefix: '，',
        url: 'https://example.com/search?q=%s'
      }
    }
  };

  const $ = (sel) => document.querySelector(sel);
  const list = $('#list');
  const tpl = $('#item-template');
  const form = $('#add-form');
  const prefixInput = $('#prefix');
  const urlInput = $('#url');
  const restoreBtn = $('#restore');
  const exportBtn = $('#export-json');
  const copyJsonBtn = $('#copy-json');
  const copyLinkBtn = $('#copy-link');
  const importFileBtn = $('#import-file-btn');
  const importFileInput = $('#import-file');
  const importPasteBtn = $('#import-paste');
  const addBtn = $('#add-btn');
  const titleEl = $('#title');
  const subtitleEl = $('#subtitle');
  const currentTitleEl = $('#current-title');
  const addTitleEl = $('#add-title');
  const prefixLabelEl = $('#prefix-label');
  const urlLabelEl = $('#url-label');
  const repoLink = $('#repo-link');
  const thanksEl = $('#thanks');
  const langToggle = $('#lang-toggle');

  let LANG = 'en';

  function t(keyPath, lang = LANG) {
    return keyPath.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), I18N[lang]);
  }

  function applyLang(lang) {
    LANG = lang;
    titleEl.textContent = t('title');
    subtitleEl.innerHTML = t('subtitle').replace(/\n/g, '<br/>');
    restoreBtn.textContent = t('restore');
    exportBtn.textContent = t('export');
    copyJsonBtn.textContent = t('copyJson');
    copyLinkBtn.textContent = t('copyLink');
    importFileBtn.textContent = t('importFile');
    importPasteBtn.textContent = t('importPaste');
    currentTitleEl.textContent = t('currentMappings');
    addTitleEl.textContent = t('addNew');
    prefixLabelEl.textContent = t('prefix');
    urlLabelEl.textContent = t('target');
    addBtn.textContent = t('add');
    repoLink.textContent = t('repo');
    thanksEl.textContent = t('thanks');
    langToggle.textContent = t('switchLang');
    // placeholders
    prefixInput.placeholder = t('placeholders.prefix');
    urlInput.placeholder = t('placeholders.url');
    // update list button labels and titles
    for (const item of list.querySelectorAll('.item')) {
      const delBtn = item.querySelector('[data-action="delete"]');
      if (delBtn) delBtn.textContent = t('delete');
      const pill = item.querySelector('.pill.prefix');
      if (pill) pill.title = t('prefix');
      const url = item.querySelector('.url');
      if (url) url.title = t('target');
    }
  }

  function render(mappings) {
    list.innerHTML = '';
    mappings.forEach((m, idx) => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('.prefix').textContent = m.prefix;
      node.querySelector('.url').textContent = m.urlTemplate;
      const li = node.querySelector('.item');
      li.dataset.index = String(idx);
      // i18n for row specifics
      node.querySelector('.pill.prefix').title = t('prefix');
      node.querySelector('.url').title = t('target');
      const delBtn = node.querySelector('[data-action="delete"]');
      delBtn.textContent = t('delete');
      const editBtn = node.querySelector('[data-action="edit"]');
      editBtn.textContent = t('edit');
      editBtn.title = t('edit');
      list.appendChild(node);
    });
  }

  function save(mappings) {
    chrome.storage.sync.set({ mappings });
  }

  // ===== Sharing / Import helpers =====
  function base64urlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
  }
  function base64urlDecode(token) {
    token = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = token.length % 4 === 2 ? '==': token.length % 4 === 3 ? '=' : '';
    try {
      return decodeURIComponent(escape(atob(token + pad)));
    } catch (e) {
      return null;
    }
  }

  function toConfig(mappings) {
    return {
      version: 1,
      mappings: mappings.map(m => ({ prefix: m.prefix, urlTemplate: m.urlTemplate, label: m.label || '' })),
      meta: { createdAt: new Date().toISOString() }
    };
  }

  function validateAndNormalize(items, interactive = true) {
    // remove invalid, normalize urlTemplate; ensure http(s); ensure prefix length ≤ 5
    const out = [];
    let missingCount = 0;
    for (const it of items) {
      if (!it || typeof it.prefix !== 'string' || typeof it.urlTemplate !== 'string') continue;
      const prefix = it.prefix.trim();
      let url = it.urlTemplate.trim();
      if (!prefix || prefix.length > 5 || !url) continue;
      const lower = url.toLowerCase();
      if (!(lower.startsWith('http://') || lower.startsWith('https://'))) continue;
      if (!url.includes('%s')) missingCount++;
      out.push({ prefix, urlTemplate: url, label: it.label || '' });
    }
    if (out.length === 0) return { items: [], missingHandled: true };
    if (missingCount > 0 && interactive) {
      const ok = confirm(t('alerts.importConfirmFixMissing').replace('%d', String(missingCount)));
      if (ok) {
        for (const it of out) {
          if (!it.urlTemplate.includes('%s')) {
            const sep = it.urlTemplate.includes('?') ? '&' : '?';
            it.urlTemplate = it.urlTemplate + sep + 'q=%s';
          }
        }
        return { items: out, missingHandled: true };
      }
    }
    return { items: out, missingHandled: missingCount === 0 };
  }

  function importConfig(config, strategy = 'merge') {
    if (!config || typeof config !== 'object' || !Array.isArray(config.mappings)) {
      alert(t('alerts.invalidConfig'));
      return;
    }
    const { items } = validateAndNormalize(config.mappings, true);
    if (items.length === 0) {
      alert(t('alerts.invalidConfig'));
      return;
    }
    chrome.storage.sync.get({ mappings: null }, (res) => {
      let base = strategy === 'replace'
        ? []
        : (Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS.slice());
      // index by prefix
      const map = new Map(base.map(m => [m.prefix, m]));
      for (const it of items) map.set(it.prefix, { ...map.get(it.prefix), ...it });
      const merged = Array.from(map.values()).sort((a,b) => a.prefix.localeCompare(b.prefix));
      save(merged);
      render(merged);
      alert(t('alerts.importedN').replace('%d', String(items.length)));
    });
  }

  function load() {
    chrome.storage.sync.get({ mappings: null, lang: 'en' }, (res) => {
      LANG = res.lang || 'en';
      applyLang(LANG);
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS;
      render(mappings);
    });
  }

  list.addEventListener('click', (e) => {
    const del = e.target.closest('button[data-action="delete"]');
    const edit = e.target.closest('button[data-action="edit"], button[data-action="save"]');
    if (!del && !edit) return;

    const li = e.target.closest('.item');
    const idx = Number(li.dataset.index);

    if (del) {
      chrome.storage.sync.get({ mappings: null }, (res) => {
        const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS.slice();
        mappings.splice(idx, 1);
        save(mappings);
        render(mappings);
      });
      return;
    }

    // Edit / Save toggle
    chrome.storage.sync.get({ mappings: null }, (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS.slice();
      const m = mappings[idx];
      const prefixCell = li.querySelector('.pill.prefix');
      const urlCell = li.querySelector('.url');
      const editBtn = li.querySelector('button[data-action="edit"], button[data-action="save"]');
      const isEditing = editBtn.getAttribute('data-action') === 'save';

      if (!isEditing) {
        // Enter edit mode: replace text with inputs
        prefixCell.innerHTML = '';
        const pInput = document.createElement('input');
        pInput.className = 'edit-input';
        pInput.maxLength = 5;
        pInput.value = m.prefix;
        pInput.placeholder = t('placeholders.prefix');
        prefixCell.replaceWith((() => {
          const wrapper = document.createElement('div');
          wrapper.className = 'pill prefix';
          wrapper.title = t('prefix');
          wrapper.appendChild(pInput);
          return wrapper;
        })());

        urlCell.innerHTML = '';
        const uInput = document.createElement('input');
        uInput.className = 'edit-input';
        uInput.value = m.urlTemplate;
        uInput.placeholder = t('placeholders.url');
        uInput.title = t('target');
        urlCell.appendChild(uInput);

        editBtn.textContent = t('save');
        editBtn.title = t('saveTitle');
        editBtn.setAttribute('data-action', 'save');
        pInput.focus();
        return;
      }

      // Save mode: validate and persist
      const newPrefix = li.querySelector('.pill.prefix input')?.value.trim() || '';
      let newUrl = li.querySelector('.url input')?.value.trim() || '';
      if (!newPrefix) return alert(t('alerts.prefixRequired'));
      if (!newUrl) return alert(t('alerts.urlRequired'));
      if (!newUrl.includes('%s')) {
        const ok = confirm(t('alerts.urlNoPlaceholder'));
        if (ok) {
          const sep = newUrl.includes('?') ? '&' : '?';
          newUrl = newUrl + sep + 'q=%s';
        } else {
          return;
        }
      }
      if (mappings.some((x, i) => i !== idx && x.prefix === newPrefix)) {
        return alert(t('alerts.exists'));
      }

      mappings[idx] = { ...m, prefix: newPrefix, urlTemplate: newUrl };
      save(mappings);
      render(mappings);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prefix = prefixInput.value.trim();
    const url = urlInput.value.trim();
    if (!prefix) return alert(t('alerts.prefixRequired'));
    if (!url) return alert(t('alerts.urlRequired'));
    if (!url.includes('%s')) {
      const ok = confirm(t('alerts.urlNoPlaceholder'));
      if (ok) {
        const sep = url.includes('?') ? '&' : '?';
        urlInput.value = url + sep + 'q=%s';
      } else {
        return;
      }
    }
    chrome.storage.sync.get({ mappings: null }, (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS.slice();
      if (mappings.some(m => m.prefix === prefix)) {
        return alert(t('alerts.exists'));
      }
      mappings.push({ prefix, label: '', urlTemplate: urlInput.value.trim() });
      save(mappings);
      render(mappings);
      form.reset();
      prefixInput.focus();
    });
  });

  restoreBtn.addEventListener('click', () => {
    if (!confirm(t('alerts.restoreConfirm'))) return;
    save(DEFAULT_MAPPINGS);
    render(DEFAULT_MAPPINGS);
  });

  // Export (download JSON)
  exportBtn.addEventListener('click', () => {
    chrome.storage.sync.get({ mappings: null }, (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS;
      const cfg = toConfig(mappings);
      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laziest-mappings-v${cfg.version}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });

  // Copy JSON
  copyJsonBtn.addEventListener('click', async () => {
    chrome.storage.sync.get({ mappings: null }, async (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS;
      const cfg = toConfig(mappings);
      try {
        await navigator.clipboard.writeText(JSON.stringify(cfg));
        alert(t('alerts.jsonCopied'));
      } catch (e) {
        console.error(e);
      }
    });
  });

  // Copy Link (deep import link)
  copyLinkBtn.addEventListener('click', () => {
    chrome.storage.sync.get({ mappings: null }, async (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS;
      const cfg = toConfig(mappings);
      const token = base64urlEncode(JSON.stringify(cfg));
      const full = chrome.runtime.getURL(`options.html#cfg=${token}`);
      try {
        await navigator.clipboard.writeText(full);
        alert(t('alerts.linkCopied'));
      } catch (e) { console.error(e); }
    });
  });

  // Import (file)
  importFileBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', async () => {
    const f = importFileInput.files && importFileInput.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const cfg = JSON.parse(text);
      const count = Array.isArray(cfg.mappings) ? cfg.mappings.length : 0;
      const replace = confirm(t('alerts.importConfirmReplace').replace('%d', String(count)));
      importConfig(cfg, replace ? 'replace' : 'merge');
    } catch (e) {
      alert(t('alerts.invalidJson'));
    } finally {
      importFileInput.value = '';
    }
  });

  // Import (paste)
  importPasteBtn.addEventListener('click', () => {
    const text = prompt('Paste JSON here');
    if (!text) return;
    try {
      const cfg = JSON.parse(text);
      const count = Array.isArray(cfg.mappings) ? cfg.mappings.length : 0;
      const replace = confirm(t('alerts.importConfirmReplace').replace('%d', String(count)));
      importConfig(cfg, replace ? 'replace' : 'merge');
    } catch (e) {
      alert(t('alerts.invalidJson'));
    }
  });

  langToggle.addEventListener('click', () => {
    const next = LANG === 'en' ? 'zh' : 'en';
    chrome.storage.sync.set({ lang: next }, () => {
      applyLang(next);
    });
  });

  load();

  // One-click deep import via hash token
  (function tryDeepImport() {
    const hash = location.hash || '';
    const m = hash.match(/[#&]cfg=([^&]+)/);
    if (!m) return;
    const json = base64urlDecode(m[1]);
    if (!json) return;
    try {
      const cfg = JSON.parse(json);
      const count = Array.isArray(cfg.mappings) ? cfg.mappings.length : 0;
      const replace = confirm(t('alerts.importConfirmReplace').replace('%d', String(count)));
      importConfig(cfg, replace ? 'replace' : 'merge');
      // 清理 hash，避免重复提示
      history.replaceState({}, document.title, location.pathname);
    } catch (e) {
      console.error('Deep import error', e);
    }
  })();
})();
