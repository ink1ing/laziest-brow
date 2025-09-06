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

  const $ = (sel) => document.querySelector(sel);
  const list = $('#list');
  const tpl = $('#item-template');
  const form = $('#add-form');
  const prefixInput = $('#prefix');
  const urlInput = $('#url');
  const restoreBtn = $('#restore');

  function render(mappings) {
    list.innerHTML = '';
    mappings.forEach((m, idx) => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('.prefix').textContent = m.prefix;
      node.querySelector('.url').textContent = m.urlTemplate;
      const li = node.querySelector('.item');
      li.dataset.index = String(idx);
      list.appendChild(node);
    });
  }

  function save(mappings) {
    chrome.storage.sync.set({ mappings });
  }

  function load() {
    chrome.storage.sync.get({ mappings: null }, (res) => {
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
    if (!prefix) return alert('Prefix required');
    if (!url) return alert('URL template required');
    if (!url.includes('%s')) {
      const ok = confirm('URL template does not contain %s. Append ?q=%s automatically?');
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
        return alert('Prefix already exists');
      }
      mappings.push({ prefix, label: '', urlTemplate: urlInput.value.trim() });
      save(mappings);
      render(mappings);
      form.reset();
      prefixInput.focus();
    });
  });

  restoreBtn.addEventListener('click', () => {
    if (!confirm('Restore default mappings? This will overwrite current mappings.')) return;
    save(DEFAULT_MAPPINGS);
    render(DEFAULT_MAPPINGS);
  });

  load();
})();

