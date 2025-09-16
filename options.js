(() => {
  const PRESET_SETS = {
    ai: {
      id: 'ai',
      mappings: [
        { prefix: '，', label: 'ChatGPT', urlTemplate: 'https://chatgpt.com/?q=%s&hints=search' },
        { prefix: ',', label: 'ChatGPT', urlTemplate: 'https://chatgpt.com/?q=%s&hints=search' },
        { prefix: '。', label: 'FuClaude', urlTemplate: 'https://demo.fuclaude.com/new?q=%s' },
        { prefix: '.', label: 'FuClaude', urlTemplate: 'https://demo.fuclaude.com/new?q=%s' }
      ]
    },
    browser: {
      id: 'browser',
      mappings: [
        { prefix: '//', label: 'Bing', urlTemplate: 'https://www.bing.com/search?q=%s' },
        { prefix: 'gh', label: 'GitHub', urlTemplate: 'https://github.com/search?q=%s' },
        { prefix: 'wk', label: 'Wikipedia ZH', urlTemplate: 'https://zh.wikipedia.org/w/index.php?search=%s' },
        { prefix: 'bl', label: 'Bilibili', urlTemplate: 'https://search.bilibili.com/all?keyword=%s' },
        { prefix: 'x', label: 'X', urlTemplate: 'https://x.com/search?q=%s' },
        { prefix: 'zl', label: 'Z-Library', urlTemplate: 'https://z-library.ec/s/?q=%s' },
        { prefix: 'ddg', label: 'DuckDuckGo', urlTemplate: 'https://duckduckgo.com/?q=%s' }
      ]
    },
    web3: {
      id: 'web3',
      mappings: [
        { prefix: 'bn', label: 'Binance Spot', urlTemplate: 'https://www.binance.com/zh-CN/trade/%s_USDT' },
        { prefix: 'bf', label: 'Binance Futures', urlTemplate: 'https://www.binance.com/zh-CN/futures/%s_USDT' },
        { prefix: 'bm', label: 'Binance Web3', urlTemplate: 'https://web3.binance.com/zh-CN/token/bsc/%s' },
        { prefix: 'cg', label: 'Coinglass', urlTemplate: 'https://www.coinglass.com/zh/coin/%s' }
      ]
    }
  };
  const I18N = {
    en: {
      title: 'Prefix Router',
      subtitle: 'Configure mappings from a typed prefix to a target URL template.\nUse %s as placeholder for the query.',
      restore: 'Reset (Empty)',
      export: 'Export',
      copyJson: 'Copy JSON',
      copyLink: 'Copy Link',
      importFile: 'Import (File)',
      importPaste: 'Import (Paste)',
      currentMappings: 'Current Mappings',
      emptyHint: 'No shortcuts yet. Import a preset or add your own.',
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
      presets: {
        label: 'Quick Presets',
        ai: 'Import AI Preset',
        browser: 'Import Browser Preset',
        web3: 'Import Web3 / Crypto Preset'
      },
      alerts: {
        prefixRequired: 'Prefix required',
        urlRequired: 'URL template required',
        urlNoPlaceholder: 'URL template does not contain %s. Append ?q=%s automatically?',
        exists: 'Prefix already exists',
        restoreConfirm: 'Reset to an empty list? This will remove all shortcuts.',
        invalidJson: 'Invalid JSON',
        invalidConfig: 'Invalid config format',
        importConfirmReplace: 'Import %d mappings. OK = Replace All, Cancel = Merge (overwrite same prefix).',
        importConfirmFixMissing: '%d URL(s) missing %s placeholder. Append automatically? OK = Yes, Cancel = No',
        importedN: 'Imported %d mapping(s).',
        jsonCopied: 'JSON copied to clipboard.',
        linkCopied: 'Link copied to clipboard.',
        presetConfirm: 'Apply %s (%d shortcuts)? OK = Replace All, Cancel = Merge (overwrite same prefix).'
      },
      placeholders: {
        prefix: ',',
        url: 'https://example.com/search?q=%s'
      }
    },
    zh: {
      title: '前缀路由',
      subtitle: '配置前缀到目标 URL 模板的映射。\n使用 %s 作为查询占位符。',
      restore: '清空（默认空白）',
      export: '导出',
      copyJson: '复制 JSON',
      copyLink: '复制链接',
      importFile: '文件导入',
      importPaste: '粘贴导入',
      currentMappings: '当前映射',
      emptyHint: '暂无快捷指令，先导入预设或手动添加。',
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
      presets: {
        label: '快捷预设',
        ai: '导入 AI 预设',
        browser: '导入 Browser 预设',
        web3: '导入 Web3 / Crypto 预设'
      },
      alerts: {
        prefixRequired: '请填写前缀',
        urlRequired: '请填写 URL 模板',
        urlNoPlaceholder: 'URL 模板缺少 %s。是否自动追加 ?q=%s？',
        exists: '该前缀已存在',
        restoreConfirm: '确认清空所有快捷指令？此操作不可撤销。',
        invalidJson: 'JSON 格式无效',
        invalidConfig: '配置格式无效',
        importConfirmReplace: '将导入 %d 条映射。确定=全部替换，取消=合并（同前缀覆盖）。',
        importConfirmFixMissing: '有 %d 条 URL 模板缺少 %s 占位符，是否自动追加？确定=是，取消=否',
        importedN: '已导入 %d 条映射。',
        jsonCopied: 'JSON 已复制到剪贴板。',
        linkCopied: '链接已复制到剪贴板。',
        presetConfirm: '应用 %s（共 %d 条）？确定=全部替换，取消=合并（同前缀覆盖）。'
      },
      placeholders: {
        prefix: '，',
        url: 'https://example.com/search?q=%s'
      }
    }
  };

  const state = {
    lang: 'en',
    mappings: []
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
  const presetLabelEl = $('#preset-label');
  const emptyHintEl = $('#empty-hint');
  const presetButtons = Array.from(document.querySelectorAll('[data-preset]'));

  function t(keyPath, lang = state.lang) {
    return keyPath.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), I18N[lang]);
  }

  function applyLang(lang) {
    state.lang = lang;
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
    presetLabelEl.textContent = t('presets.label');
    emptyHintEl.textContent = t('emptyHint');
    prefixInput.placeholder = t('placeholders.prefix');
    urlInput.placeholder = t('placeholders.url');
    presetButtons.forEach((btn) => {
      const key = btn.dataset.preset;
      btn.textContent = t(`presets.${key}`);
    });
  }

  function render(mappings) {
    list.innerHTML = '';
    if (!Array.isArray(mappings) || mappings.length === 0) {
      emptyHintEl.hidden = false;
      return;
    }
    emptyHintEl.hidden = true;
    mappings.forEach((m, idx) => {
      const frag = tpl.content.cloneNode(true);
      const li = frag.querySelector('.item');
      const pill = frag.querySelector('.pill.prefix');
      const urlEl = frag.querySelector('.url');
      const delBtn = frag.querySelector('[data-action="delete"]');
      const editBtn = frag.querySelector('[data-action="edit"]');

      li.dataset.index = String(idx);
      li.dataset.prefix = m.prefix;
      pill.textContent = m.prefix;
      pill.title = t('prefix');
      pill.classList.add('drag-handle');
      pill.setAttribute('draggable', 'true');
      urlEl.textContent = m.urlTemplate;
      urlEl.title = t('target');
      delBtn.textContent = t('delete');
      editBtn.textContent = t('edit');
      editBtn.title = t('edit');
      list.appendChild(frag);
    });
  }

  function save() {
    chrome.storage.sync.set({ mappings: state.mappings });
  }

  function setMappings(next, { persist = true } = {}) {
    const copy = [];
    for (const m of next) {
      if (!m || typeof m.prefix !== 'string' || typeof m.urlTemplate !== 'string') continue;
      const prefix = m.prefix.trim();
      const urlTemplate = m.urlTemplate.trim();
      if (!prefix || !urlTemplate) continue;
      copy.push({ prefix, urlTemplate, label: m.label || '' });
    }
    state.mappings = copy;
    if (persist) save();
    render(state.mappings);
  }

  function toConfig(mappings = state.mappings) {
    return {
      version: 1,
      mappings: mappings.map((m) => ({ prefix: m.prefix, urlTemplate: m.urlTemplate, label: m.label || '' })),
      meta: { createdAt: new Date().toISOString() }
    };
  }

  function validateAndNormalize(items, interactive = true) {
    const out = [];
    let missingCount = 0;
    for (const it of items) {
      if (!it || typeof it.prefix !== 'string' || typeof it.urlTemplate !== 'string') continue;
      const prefix = it.prefix.trim();
      let url = it.urlTemplate.trim();
      if (!prefix || prefix.length > 16 || !url) continue;
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
            it.urlTemplate = `${it.urlTemplate}${sep}q=%s`;
          }
        }
        return { items: out, missingHandled: true };
      }
    }
    return { items: out, missingHandled: missingCount === 0 };
  }

  function importConfig(config, strategy = 'merge', { silent = false } = {}) {
    if (!config || typeof config !== 'object' || !Array.isArray(config.mappings)) {
      alert(t('alerts.invalidConfig'));
      return;
    }
    const { items } = validateAndNormalize(config.mappings, true);
    if (items.length === 0) {
      alert(t('alerts.invalidConfig'));
      return;
    }

    if (strategy === 'replace') {
      setMappings(items);
    } else {
      const base = state.mappings.slice();
      const order = base.map((m) => m.prefix);
      const map = new Map(base.map((m) => [m.prefix, { ...m }]));
      for (const it of items) {
        map.set(it.prefix, { ...map.get(it.prefix), ...it });
      }
      const merged = [];
      for (const prefix of order) {
        const entry = map.get(prefix);
        if (entry) {
          merged.push(entry);
          map.delete(prefix);
        }
      }
      for (const it of items) {
        if (map.has(it.prefix)) {
          merged.push(map.get(it.prefix));
          map.delete(it.prefix);
        }
      }
      // Append any remaining items (unlikely) respecting map insertion order
      for (const value of map.values()) merged.push(value);
      setMappings(merged);
    }

    if (!silent) {
      alert(t('alerts.importedN').replace('%d', String(items.length)));
    }
  }

  function load() {
    chrome.storage.sync.get({ mappings: null, lang: 'en' }, (res) => {
      const lang = res.lang || 'en';
      applyLang(lang);
      const stored = Array.isArray(res.mappings) ? res.mappings : [];
      setMappings(stored, { persist: false });
    });
  }

  list.addEventListener('click', (e) => {
    const li = e.target.closest('.item');
    if (!li) return;
    const idx = Number(li.dataset.index);
    if (Number.isNaN(idx)) return;
    const mapping = state.mappings[idx];
    if (!mapping) return;

    const delBtn = e.target.closest('button[data-action="delete"]');
    const editBtn = e.target.closest('button[data-action="edit"], button[data-action="save"]');

    if (delBtn) {
      const next = state.mappings.slice();
      next.splice(idx, 1);
      setMappings(next);
      return;
    }

    if (!editBtn) return;

    const isSaving = editBtn.getAttribute('data-action') === 'save';
    const prefixCell = li.querySelector('.pill.prefix');
    const urlCell = li.querySelector('.url');

    if (!isSaving) {
      const prefixWrapper = document.createElement('div');
      prefixWrapper.className = 'pill prefix editing';
      prefixWrapper.title = t('prefix');
      const pInput = document.createElement('input');
      pInput.className = 'edit-input';
      pInput.maxLength = 16;
      pInput.value = mapping.prefix;
      pInput.placeholder = t('placeholders.prefix');
      prefixWrapper.appendChild(pInput);
      prefixCell.replaceWith(prefixWrapper);

      const uInput = document.createElement('input');
      uInput.className = 'edit-input';
      uInput.value = mapping.urlTemplate;
      uInput.placeholder = t('placeholders.url');
      uInput.title = t('target');
      urlCell.innerHTML = '';
      urlCell.appendChild(uInput);

      editBtn.textContent = t('save');
      editBtn.title = t('saveTitle');
      editBtn.setAttribute('data-action', 'save');
      pInput.focus();
      return;
    }

    const newPrefix = li.querySelector('.pill.prefix input')?.value.trim() || '';
    let newUrl = li.querySelector('.url input')?.value.trim() || '';
    if (!newPrefix) {
      alert(t('alerts.prefixRequired'));
      return;
    }
    if (!newUrl) {
      alert(t('alerts.urlRequired'));
      return;
    }
    if (!newUrl.includes('%s')) {
      const ok = confirm(t('alerts.urlNoPlaceholder'));
      if (ok) {
        const sep = newUrl.includes('?') ? '&' : '?';
        newUrl = `${newUrl}${sep}q=%s`;
      } else {
        return;
      }
    }
    if (state.mappings.some((m, i) => i !== idx && m.prefix === newPrefix)) {
      alert(t('alerts.exists'));
      return;
    }
    const next = state.mappings.slice();
    next[idx] = { ...next[idx], prefix: newPrefix, urlTemplate: newUrl };
    setMappings(next);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prefix = prefixInput.value.trim();
    let url = urlInput.value.trim();
    if (!prefix) {
      alert(t('alerts.prefixRequired'));
      return;
    }
    if (!url) {
      alert(t('alerts.urlRequired'));
      return;
    }
    if (!url.includes('%s')) {
      const ok = confirm(t('alerts.urlNoPlaceholder'));
      if (ok) {
        const sep = url.includes('?') ? '&' : '?';
        url = `${url}${sep}q=%s`;
      } else {
        return;
      }
    }
    if (state.mappings.some((m) => m.prefix === prefix)) {
      alert(t('alerts.exists'));
      return;
    }
    const next = state.mappings.concat([{ prefix, label: '', urlTemplate: url }]);
    setMappings(next);
    form.reset();
    prefixInput.focus();
  });

  restoreBtn.addEventListener('click', () => {
    if (!confirm(t('alerts.restoreConfirm'))) return;
    setMappings([]);
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.preset;
      const preset = PRESET_SETS[id];
      if (!preset) return;
      const label = t(`presets.${id}`);
      const count = preset.mappings.length;
      const replace = confirm(
        t('alerts.presetConfirm')
          .replace('%s', label)
          .replace('%d', String(count))
      );
      importConfig({ version: 1, mappings: preset.mappings }, replace ? 'replace' : 'merge');
    });
  });

  exportBtn.addEventListener('click', () => {
    const cfg = toConfig();
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

  copyJsonBtn.addEventListener('click', async () => {
    const cfg = toConfig();
    try {
      await navigator.clipboard.writeText(JSON.stringify(cfg));
      alert(t('alerts.jsonCopied'));
    } catch (e) {
      console.error(e);
    }
  });

  copyLinkBtn.addEventListener('click', async () => {
    const cfg = toConfig();
    const token = base64urlEncode(JSON.stringify(cfg));
    const full = chrome.runtime.getURL(`options.html#cfg=${token}`);
    try {
      await navigator.clipboard.writeText(full);
      alert(t('alerts.linkCopied'));
    } catch (e) {
      console.error(e);
    }
  });

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
    const next = state.lang === 'en' ? 'zh' : 'en';
    chrome.storage.sync.set({ lang: next }, () => {
      applyLang(next);
      render(state.mappings);
    });
  });

  function base64urlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

  load();

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
      history.replaceState({}, document.title, location.pathname);
    } catch (e) {
      console.error('Deep import error', e);
    }
  })();

  list.addEventListener('dragstart', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (!handle) {
      e.preventDefault();
      return;
    }
    const li = handle.closest('.item');
    if (!li) return;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', li.dataset.index || '0');
    } catch (err) {
      // ignore
    }
    li.classList.add('dragging');
  });

  list.addEventListener('dragover', (e) => {
    const dragging = list.querySelector('.item.dragging');
    if (!dragging) return;
    e.preventDefault();
    const target = e.target.closest('.item');
    if (!target) {
      if (list.lastElementChild && list.lastElementChild !== dragging) {
        list.appendChild(dragging);
      }
      return;
    }
    if (target === dragging) return;
    const rect = target.getBoundingClientRect();
    const shouldAfter = (e.clientY - rect.top) > rect.height / 2;
    if (shouldAfter) {
      if (target.nextSibling !== dragging) {
        list.insertBefore(dragging, target.nextSibling);
      }
    } else if (target !== dragging) {
      list.insertBefore(dragging, target);
    }
  });

  list.addEventListener('drop', (e) => {
    const dragging = list.querySelector('.item.dragging');
    if (!dragging) return;
    e.preventDefault();
    dragging.classList.remove('dragging');
    const ordered = Array.from(list.querySelectorAll('.item')).map((node) => {
      const index = Number(node.dataset.index);
      return state.mappings[index];
    }).filter(Boolean);
    if (ordered.length === state.mappings.length) {
      setMappings(ordered);
    } else {
      render(state.mappings);
    }
  });

  list.addEventListener('dragend', () => {
    const dragging = list.querySelector('.item.dragging');
    if (dragging) dragging.classList.remove('dragging');
    render(state.mappings);
  });
})();
