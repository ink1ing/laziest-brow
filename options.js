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
      currentMappings: 'Current Mappings',
      addNew: 'Add New Mapping',
      prefix: 'Prefix',
      target: 'Target URL template',
      add: 'Add',
      delete: 'Delete',
      repo: 'GitHub Repo',
      thanks: 'Thanks: @ink @codex',
      switchLang: '中文',
      alerts: {
        prefixRequired: 'Prefix required',
        urlRequired: 'URL template required',
        urlNoPlaceholder: 'URL template does not contain %s. Append ?q=%s automatically?',
        exists: 'Prefix already exists',
        restoreConfirm: 'Restore default mappings? This will overwrite current mappings.'
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
      currentMappings: '当前映射',
      addNew: '新增映射',
      prefix: '前缀',
      target: '目标 URL 模板',
      add: '添加',
      delete: '删除',
      repo: 'GitHub 仓库',
      thanks: '鸣谢：@ink @codex',
      switchLang: 'English',
      alerts: {
        prefixRequired: '请填写前缀',
        urlRequired: '请填写 URL 模板',
        urlNoPlaceholder: 'URL 模板缺少 %s。是否自动追加 ?q=%s？',
        exists: '该前缀已存在',
        restoreConfirm: '确认恢复默认映射？当前设置将被覆盖。'
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
      node.querySelector('[data-action="delete"]').textContent = t('delete');
      list.appendChild(node);
    });
  }

  function save(mappings) {
    chrome.storage.sync.set({ mappings });
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
    const btn = e.target.closest('button[data-action="delete"]');
    if (!btn) return;
    const li = btn.closest('.item');
    const idx = Number(li.dataset.index);
    chrome.storage.sync.get({ mappings: null }, (res) => {
      const mappings = Array.isArray(res.mappings) && res.mappings.length > 0 ? res.mappings : DEFAULT_MAPPINGS.slice();
      mappings.splice(idx, 1);
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

  langToggle.addEventListener('click', () => {
    const next = LANG === 'en' ? 'zh' : 'en';
    chrome.storage.sync.set({ lang: next }, () => {
      applyLang(next);
    });
  });

  load();
})();
