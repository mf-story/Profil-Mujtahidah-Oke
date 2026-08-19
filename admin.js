/* Schema-driven CMS for Portofolio Dosen. */
(function () {
  'use strict';

  var ICON_OPTS = ['mail', 'scholar', 'sinta', 'scopus', 'linkedin', 'globe'];

  // Each panel maps to a top-level key in content.json.
  var SCHEMA = [
    { key: '__insights', label: 'Insight', hint: 'Statistik pengunjung & ringkasan konten.', insights: true },
    { key: 'profile', label: 'Profil', hint: 'Nama, jabatan, dan foto profil di sidebar.', fields: [
      { k: 'name', t: 'text', label: 'Nama & Gelar' },
      { k: 'role', t: 'text', label: 'Peran / Jabatan' },
      { k: 'affiliation', t: 'text', label: 'Afiliasi / Program Studi' },
      { k: 'location', t: 'text', label: 'Lokasi' },
      { k: 'avatar', t: 'photo', label: 'Foto Profil (sidebar)' }
    ]},
    { key: 'hero', label: 'Beranda', hint: 'Bagian pembuka (hero) di halaman utama.', fields: [
      { k: 'greeting', t: 'text', label: 'Sapaan' },
      { k: 'headline', t: 'textarea', label: 'Judul Utama' },
      { k: 'tagline', t: 'textarea', label: 'Deskripsi Singkat' },
      { k: 'ctaText', t: 'text', label: 'Tombol Utama — Teks' },
      { k: 'ctaHref', t: 'text', label: 'Tombol Utama — Tautan (mis. #portofolio)' },
      { k: 'ctaGhostText', t: 'text', label: 'Tombol Kedua — Teks' },
      { k: 'ctaGhostHref', t: 'text', label: 'Tombol Kedua — Tautan (mis. #kontak)' },
      { k: 'portrait', t: 'photo', label: 'Foto Besar (hero / background)' },
      { k: 'bgPosition', t: 'position', label: 'Posisi Foto Hero' },
      { k: 'stats', t: 'list', label: 'Statistik', titleFrom: 'label', item: [
        { k: 'value', t: 'text', label: 'Angka' },
        { k: 'suffix', t: 'text', label: 'Akhiran (mis. +)' },
        { k: 'label', t: 'text', label: 'Keterangan' }
      ]}
    ]},
    { key: 'about', label: 'Tentang', hint: 'Ringkasan biografi.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'paragraphs', t: 'list-text', label: 'Paragraf' }
    ]},
    { key: 'expertise', label: 'Keahlian', hint: 'Bidang keahlian dalam bentuk kartu.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Daftar Keahlian', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'desc', t: 'textarea', label: 'Deskripsi' }
      ]}
    ]},
    { key: 'education', label: 'Pendidikan', hint: 'Riwayat pendidikan (timeline).', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Riwayat', titleFrom: 'degree', item: [
        { k: 'period', t: 'text', label: 'Periode' },
        { k: 'degree', t: 'text', label: 'Jenjang / Gelar' },
        { k: 'institution', t: 'text', label: 'Institusi' },
        { k: 'detail', t: 'textarea', label: 'Keterangan' }
      ]}
    ]},
    { key: 'experience', label: 'Pengalaman', hint: 'Riwayat karier (timeline).', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Riwayat', titleFrom: 'role', item: [
        { k: 'period', t: 'text', label: 'Periode' },
        { k: 'role', t: 'text', label: 'Jabatan / Peran' },
        { k: 'org', t: 'text', label: 'Institusi' },
        { k: 'detail', t: 'textarea', label: 'Keterangan' }
      ]}
    ]},
    { key: 'portfolio', label: 'Portofolio', hint: 'Karya terpilih dengan gambar.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Karya', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'category', t: 'text', label: 'Kategori' },
        { k: 'year', t: 'text', label: 'Tahun' },
        { k: 'desc', t: 'textarea', label: 'Deskripsi' },
        { k: 'image', t: 'photo', label: 'Gambar' },
        { k: 'link', t: 'text', label: 'Tautan Detail' }
      ]}
    ]},
    { key: 'publications', label: 'Publikasi', hint: 'Publikasi ilmiah (bisa sinkron dari Google Scholar).', syncScholar: true, fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'trackTitle', t: 'text', label: 'Judul Kartu Rekam Jejak' },
      { k: 'stats', t: 'list', label: 'Statistik (Publikasi / Sitasi / h-index)', titleFrom: 'label', item: [
        { k: 'value', t: 'text', label: 'Angka' },
        { k: 'label', t: 'text', label: 'Keterangan' }
      ]},
      { k: 'scholarUrl', t: 'text', label: 'Tautan Google Scholar' },
      { k: 'sintaUrl', t: 'text', label: 'Tautan SINTA' },
      { k: 'scopusUrl', t: 'text', label: 'Tautan Scopus' },
      { k: 'items', t: 'list', label: 'Publikasi', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'venue', t: 'text', label: 'Jurnal / Penerbit' },
        { k: 'year', t: 'text', label: 'Tahun' },
        { k: 'link', t: 'text', label: 'Tautan' }
      ]}
    ]},
    { key: 'penelitian', label: 'Penelitian', hint: 'Daftar penelitian/riset.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Penelitian', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'venue', t: 'text', label: 'Publikasi / Sumber' },
        { k: 'year', t: 'text', label: 'Tahun' },
        { k: 'link', t: 'text', label: 'Tautan' }
      ]}
    ]},
    { key: 'pengabdian', label: 'Pengabdian', hint: 'Pengabdian kepada masyarakat.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'Pengabdian', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'venue', t: 'text', label: 'Publikasi / Sumber' },
        { k: 'year', t: 'text', label: 'Tahun' },
        { k: 'link', t: 'text', label: 'Tautan' }
      ]}
    ]},
    { key: 'hki', label: 'HKI', hint: 'Hak Kekayaan Intelektual & karya.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'items', t: 'list', label: 'HKI / Karya', titleFrom: 'title', item: [
        { k: 'title', t: 'text', label: 'Judul' },
        { k: 'venue', t: 'text', label: 'Jenis / Nomor / Penerbit' },
        { k: 'year', t: 'text', label: 'Tahun' },
        { k: 'link', t: 'text', label: 'Tautan' }
      ]}
    ]},
    { key: 'contact', label: 'Kontak', hint: 'Informasi kontak di bagian bawah.', fields: [
      { k: 'kicker', t: 'text', label: 'Label Kecil' },
      { k: 'title', t: 'text', label: 'Judul Bagian' },
      { k: 'subtitle', t: 'textarea', label: 'Subjudul' },
      { k: 'email', t: 'text', label: 'Email' },
      { k: 'phone', t: 'text', label: 'Telepon / WhatsApp' },
      { k: 'address', t: 'text', label: 'Alamat' }
    ]},
    { key: 'socials', label: 'Tautan Sosial', hint: 'Ikon tautan di sidebar.', list: {
      titleFrom: 'label', item: [
        { k: 'label', t: 'text', label: 'Nama' },
        { k: 'url', t: 'text', label: 'URL' },
        { k: 'icon', t: 'select', label: 'Ikon', options: ICON_OPTS }
      ]}
    },
    { key: 'meta', label: 'Pengaturan', hint: 'Judul situs & warna aksen.', fields: [
      { k: 'siteTitle', t: 'text', label: 'Judul Situs (tab browser)' },
      { k: 'accent', t: 'color', label: 'Warna Aksen' }
    ]},
    { key: '__articles', label: 'Tulisan', hint: 'Tulis & kelola artikel/blog.', articles: true },
    { key: '__security', label: 'Keamanan', hint: 'Ubah kata sandi admin.', security: true }
  ];

  var state = { token: null, data: null, activeKey: '__insights', dirty: false };

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg, isErr) {
    var t = $('toast');
    t.textContent = msg; t.className = 'toast' + (isErr ? ' err' : ''); t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    if (state.token) opts.headers['Authorization'] = 'Bearer ' + state.token;
    if (opts.body && typeof opts.body !== 'string') {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && state.token) { handleSessionExpired(); }
        if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  function handleSessionExpired() {
    state.token = null;
    sessionStorage.removeItem('pd_token');
    $('app').hidden = true;
    $('login').hidden = false;
    $('loginError').textContent = 'Sesi berakhir. Silakan masuk lagi untuk menyimpan.';
    $('loginError').hidden = false;
  }

  function markDirty() {
    state.dirty = true;
    var s = $('saveState'); s.textContent = 'Belum disimpan'; s.classList.add('dirty');
  }
  function markClean() {
    state.dirty = false;
    var s = $('saveState'); s.textContent = 'Tersimpan'; s.classList.remove('dirty');
  }

  // ---- Login ----
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = $('password').value;
    var btn = $('loginBtn'); btn.disabled = true; btn.textContent = 'Memproses...';
    $('loginError').hidden = true;
    api('/api/login', { method: 'POST', body: { password: pw } })
      .then(function (res) {
        state.token = res.token;
        sessionStorage.setItem('pd_token', res.token);
        return loadContent();
      })
      .then(function () { showApp(); })
      .catch(function (err) {
        $('loginError').textContent = err.message || 'Gagal masuk';
        $('loginError').hidden = false;
      })
      .finally(function () { btn.disabled = false; btn.textContent = 'Masuk'; });
  });

  function loadContent() {
    return api('/api/content').then(function (d) { state.data = d; });
  }

  function showApp() {
    $('login').hidden = true; $('app').hidden = false;
    buildNav(); selectPanel(state.activeKey); markClean();
  }

  function buildNav() {
    $('adminNav').innerHTML = SCHEMA.map(function (p) {
      return '<button data-panel="' + p.key + '">' + esc(p.label) + '</button>';
    }).join('');
    Array.prototype.forEach.call($('adminNav').children, function (b) {
      b.addEventListener('click', function () { selectPanel(b.getAttribute('data-panel')); });
    });
  }

  function selectPanel(key) {
    state.activeKey = key;
    Array.prototype.forEach.call($('adminNav').children, function (b) {
      b.classList.toggle('active', b.getAttribute('data-panel') === key);
    });
    var panel = SCHEMA.filter(function (p) { return p.key === key; })[0];
    $('panelTitle').textContent = panel.label;
    $('panelHint').textContent = panel.hint || '';
    renderPanel(panel);
  }

  // ---- Panel rendering ----
  function renderPanel(panel) {
    var body = $('panelBody');
    body.innerHTML = '';

    if (panel.security) { renderSecurity(body); return; }

    if (panel.insights) { renderInsightsPanel(body); return; }

    if (panel.articles) { renderArticlesPanel(body); return; }

    ensurePath(panel.key);
    var container = state.data[panel.key];

    if (panel.list) {
      // whole panel is a top-level array (e.g. socials)
      if (!Array.isArray(state.data[panel.key])) state.data[panel.key] = [];
      body.appendChild(buildList(state.data[panel.key], panel.list));
      return;
    }

    panel.fields.forEach(function (f) {
      body.appendChild(buildField(container, f));
    });
    if (panel.syncScholar) body.insertBefore(buildScholarSync(), body.firstChild);
  }

  function buildScholarSync() {
    var card = document.createElement('div');
    card.className = 'card-panel'; card.style.marginBottom = '24px'; card.style.maxWidth = 'none';
    card.innerHTML = '<h3>Sinkron Google Scholar</h3><p>Perbarui daftar publikasi & statistik (Publikasi/Sitasi/h-index) langsung dari Google Scholar. Pastikan <b>Tautan Google Scholar</b> di bawah sudah benar.</p>';
    var btn = document.createElement('button'); btn.className = 'btn-primary'; btn.textContent = 'Sinkron Sekarang';
    var status = document.createElement('div'); status.className = 'section-note'; status.style.marginTop = '12px';
    btn.addEventListener('click', function () {
      btn.disabled = true; btn.textContent = 'Menyinkron...';
      status.textContent = 'Mengambil data dari Google Scholar (bisa 10–30 detik)...';
      api('/api/scholar')
        .then(function (res) {
          status.textContent = 'Berhasil: ' + res.count + ' publikasi, ' + res.citations + ' sitasi, h-index ' + res.hindex + '.';
          toast('Data Scholar tersinkron');
          return loadContent();
        })
        .then(function () { markClean(); selectPanel('publications'); })
        .catch(function (e) { status.textContent = 'Gagal: ' + e.message; toast(e.message, true); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Sinkron Sekarang'; });
    });
    card.appendChild(btn); card.appendChild(status);
    return card;
  }

  function ensurePath(key) {
    if (state.data[key] == null) state.data[key] = {};
  }

  function buildField(obj, f) {
    if (obj[f.k] == null) obj[f.k] = f.t === 'list' || f.t === 'list-text' ? [] : '';
    var wrap = document.createElement('div');
    wrap.className = 'field';

    if (f.t === 'list') {
      wrap.innerHTML = '<label>' + esc(f.label) + '</label>';
      wrap.appendChild(buildList(obj[f.k], f));
      return wrap;
    }
    if (f.t === 'list-text') {
      wrap.innerHTML = '<label>' + esc(f.label) + '</label>';
      wrap.appendChild(buildSimpleList(obj, f.k));
      return wrap;
    }
    if (f.t === 'photo') {
      wrap.appendChild(buildPhoto(obj, f));
      return wrap;
    }
    if (f.t === 'position') {
      wrap.appendChild(buildPosition(obj, f));
      return wrap;
    }

    var label = document.createElement('label');
    label.textContent = f.label;
    wrap.appendChild(label);

    var input;
    if (f.t === 'textarea') {
      input = document.createElement('textarea');
    } else if (f.t === 'select') {
      input = document.createElement('select');
      (f.options || []).forEach(function (o) {
        var op = document.createElement('option');
        op.value = o; op.textContent = o; input.appendChild(op);
      });
    } else if (f.t === 'color') {
      input = document.createElement('input');
      input.type = 'text'; input.placeholder = '#ff4d2e';
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.value = obj[f.k];
    input.addEventListener('input', function () { obj[f.k] = input.value; markDirty(); });
    wrap.appendChild(input);
    return wrap;
  }

  function buildPhoto(obj, f) {
    var wrap = document.createElement('div');
    var label = document.createElement('label');
    label.textContent = f.label;
    wrap.appendChild(label);

    var row = document.createElement('div');
    row.className = 'photo-field';
    var img = document.createElement('img');
    img.className = 'photo-preview';
    img.src = obj[f.k] || '';
    img.alt = '';

    var controls = document.createElement('div');
    controls.className = 'photo-controls';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'upload-btn'; btn.textContent = 'Unggah Gambar';
    var pathEl = document.createElement('div');
    pathEl.className = 'photo-path'; pathEl.textContent = obj[f.k] || 'Belum ada gambar';
    var file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.hidden = true;

    btn.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var fl = file.files[0]; if (!fl) return;
      if (fl.size > 10 * 1024 * 1024) { toast('Ukuran maksimal 10MB', true); return; }
      btn.textContent = 'Mengunggah...'; btn.disabled = true;
      var reader = new FileReader();
      reader.onload = function () {
        api('/api/upload', { method: 'POST', body: { dataUrl: reader.result } })
          .then(function (res) {
            obj[f.k] = res.path; img.src = res.path; pathEl.textContent = res.path;
            // Keep the hero position preview in sync when the hero photo changes.
            if (f.k === 'portrait') {
              var pv = document.querySelector('.pos-preview');
              if (pv) { pv.style.backgroundImage = "url('" + String(res.path).replace(/'/g, '%27') + "')"; pv.textContent = ''; }
            }
            markDirty(); toast('Gambar terunggah');
          })
          .catch(function (err) { toast(err.message || 'Gagal unggah', true); })
          .finally(function () { btn.textContent = 'Unggah Gambar'; btn.disabled = false; });
      };
      reader.readAsDataURL(fl);
    });

    controls.appendChild(btn);
    controls.appendChild(pathEl);
    controls.appendChild(file);
    row.appendChild(img);
    row.appendChild(controls);
    wrap.appendChild(row);
    return wrap;
  }

  // Hero background position: two sliders (X% Y%) with live preview
  function buildPosition(obj, f) {
    if (!obj[f.k] || !/%/.test(obj[f.k])) obj[f.k] = '100% 50%';
    var parts = String(obj[f.k]).split(/\s+/);
    var x = clampPct(parts[0]);
    var y = clampPct(parts[1]);

    var wrap = document.createElement('div');
    var label = document.createElement('label');
    label.innerHTML = f.label + ' <span class="hint">geser untuk mengatur bagian foto yang terlihat</span>';
    wrap.appendChild(label);

    var preview = document.createElement('div');
    preview.className = 'pos-preview';
    preview.style.backgroundImage = obj.portrait ? "url('" + String(obj.portrait).replace(/'/g, "%27") + "')" : '';
    if (!obj.portrait) preview.textContent = 'Unggah Foto Besar (hero) dulu untuk melihat pratinjau';

    var sliders = document.createElement('div');
    sliders.className = 'pos-sliders';

    function apply() {
      obj[f.k] = x + '% ' + y + '%';
      preview.style.backgroundPosition = obj[f.k];
    }
    apply();

    sliders.appendChild(sliderRow('Horizontal (kiri → kanan)', x, function (v) { x = v; apply(); markDirty(); }));
    sliders.appendChild(sliderRow('Vertikal (atas → bawah)', y, function (v) { y = v; apply(); markDirty(); }));

    var reset = document.createElement('button');
    reset.type = 'button'; reset.className = 'upload-btn'; reset.textContent = 'Pusatkan';
    reset.style.marginTop = '4px';
    reset.addEventListener('click', function () {
      x = 50; y = 50; apply(); markDirty();
      sliders.querySelectorAll('input[type=range]').forEach(function (r, i) {
        r.value = 50; r.nextElementSibling.textContent = '50%';
      });
    });

    wrap.appendChild(preview);
    wrap.appendChild(sliders);
    wrap.appendChild(reset);
    return wrap;
  }

  function clampPct(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) n = 50;
    return Math.max(0, Math.min(100, n));
  }

  function sliderRow(labelText, value, onChange) {
    var row = document.createElement('div');
    row.className = 'pos-row';
    var lab = document.createElement('span');
    lab.className = 'pos-label'; lab.textContent = labelText;
    var range = document.createElement('input');
    range.type = 'range'; range.min = '0'; range.max = '100'; range.value = value;
    var out = document.createElement('span');
    out.className = 'pos-val'; out.textContent = value + '%';
    range.addEventListener('input', function () {
      out.textContent = range.value + '%';
      onChange(parseInt(range.value, 10));
    });
    row.appendChild(lab);
    row.appendChild(range);
    row.appendChild(out);
    return row;
  }

  // list of strings
  function buildSimpleList(obj, key) {
    var list = document.createElement('div');
    list.className = 'list';
    var arr = obj[key];

    function draw() {
      list.innerHTML = '';
      arr.forEach(function (val, i) {
        var row = document.createElement('div');
        row.className = 'simple-list-row';
        var ta = document.createElement('textarea');
        ta.value = val;
        ta.addEventListener('input', function () { arr[i] = ta.value; markDirty(); });
        var del = document.createElement('button');
        del.type = 'button'; del.className = 'upload-btn'; del.textContent = '✕';
        del.addEventListener('click', function () { arr.splice(i, 1); markDirty(); draw(); });
        row.appendChild(ta); row.appendChild(del);
        list.appendChild(row);
      });
      var add = document.createElement('button');
      add.type = 'button'; add.className = 'add-btn'; add.textContent = '+ Tambah';
      add.addEventListener('click', function () { arr.push(''); markDirty(); draw(); });
      list.appendChild(add);
    }
    draw();
    return list;
  }

  // list of objects
  function buildList(arr, cfg) {
    var list = document.createElement('div');
    list.className = 'list';

    function draw() {
      list.innerHTML = '';
      arr.forEach(function (item, i) {
        var box = document.createElement('div');
        box.className = 'list-item';

        var head = document.createElement('div');
        head.className = 'list-item-head';
        var title = document.createElement('span');
        title.className = 'li-title';
        title.textContent = (cfg.titleFrom && item[cfg.titleFrom]) || ('Item ' + (i + 1));
        var tools = document.createElement('div');
        tools.className = 'li-tools';
        tools.appendChild(toolBtn('↑', function () { if (i > 0) { swap(arr, i, i - 1); markDirty(); draw(); } }));
        tools.appendChild(toolBtn('↓', function () { if (i < arr.length - 1) { swap(arr, i, i + 1); markDirty(); draw(); } }));
        var del = toolBtn('✕', function () { arr.splice(i, 1); markDirty(); draw(); });
        del.className = 'del';
        tools.appendChild(del);
        head.appendChild(title); head.appendChild(tools);
        box.appendChild(head);

        cfg.item.forEach(function (f) {
          var field = buildField(item, f);
          // live-update the item title
          if (f.k === cfg.titleFrom) {
            var inp = field.querySelector('input, textarea');
            if (inp) inp.addEventListener('input', function () { title.textContent = inp.value || ('Item ' + (i + 1)); });
          }
          box.appendChild(field);
        });
        list.appendChild(box);
      });
      var add = document.createElement('button');
      add.type = 'button'; add.className = 'add-btn'; add.textContent = '+ Tambah Item';
      add.addEventListener('click', function () {
        var blank = {};
        cfg.item.forEach(function (f) { blank[f.k] = f.options ? f.options[0] : ''; });
        arr.push(blank); markDirty(); draw();
      });
      list.appendChild(add);
    }
    draw();
    return list;
  }

  function toolBtn(txt, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = txt; b.addEventListener('click', fn);
    return b;
  }
  function swap(a, i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; }

  // ---- Insights ----
  function renderInsightsPanel(body) {
    body.innerHTML = '<p class="section-note">Memuat data insight...</p>';
    api('/api/insights').then(function (d) {
      drawInsights(body, d);
    }).catch(function (e) {
      body.innerHTML = '<p class="section-note">Gagal memuat: ' + esc(e.message) + '</p>';
    });
  }

  function drawInsights(body, d) {
    var MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    function shortDate(s) { var dt = new Date(s); return isNaN(dt) ? s : dt.getDate() + ' ' + MONTHS[dt.getMonth()]; }
    function statCard(value, label, sub) {
      return '<div class="ins-card"><div class="ins-num">' + esc(value) + '</div>' +
        '<div class="ins-label">' + esc(label) + '</div>' +
        (sub ? '<div class="ins-sub">' + esc(sub) + '</div>' : '') + '</div>';
    }

    var cards =
      statCard(d.totalViews, 'Total Kunjungan', 'sejak awal') +
      statCard(d.last30Uniques, 'Pengunjung Unik', '30 hari terakhir') +
      statCard(d.today.views, 'Kunjungan Hari Ini', d.today.uniques + ' pengunjung unik') +
      statCard(d.last30Views, 'Kunjungan 30 Hari', 'total tayangan');

    // Bar chart (last 7 days)
    var max = Math.max(1, Math.max.apply(null, d.last7.map(function (x) { return x.views; })));
    var bars = d.last7.map(function (x) {
      var h = Math.round((x.views / max) * 100);
      return '<div class="ins-bar-col" title="' + esc(x.date) + ': ' + x.views + ' kunjungan, ' + x.uniques + ' unik">' +
        '<div class="ins-bar-val">' + x.views + '</div>' +
        '<div class="ins-bar" style="height:' + Math.max(h, 3) + '%"></div>' +
        '<div class="ins-bar-lbl">' + esc(shortDate(x.date)) + '</div>' +
      '</div>';
    }).join('');

    function listBlock(title, rows, emptyMsg) {
      var items = rows.length
        ? rows.map(function (r) { return '<div class="ins-row"><span class="ins-row-name">' + esc(r.name) + '</span><span class="ins-row-count">' + esc(r.count) + '</span></div>'; }).join('')
        : '<p class="section-note" style="margin:0">' + esc(emptyMsg) + '</p>';
      return '<div class="ins-block"><h3>' + esc(title) + '</h3>' + items + '</div>';
    }

    var topPages = (d.topPages || []).map(function (p) { return { name: p.path, count: p.count }; });
    var topArticles = (d.topArticles || []).map(function (a) { return { name: a.title, count: a.count }; });
    var c = d.content || {};
    var contentRows = [
      { name: 'Publikasi', count: c.publikasi || 0 },
      { name: 'Penelitian', count: c.penelitian || 0 },
      { name: 'Pengabdian', count: c.pengabdian || 0 },
      { name: 'HKI & Karya', count: c.hki || 0 },
      { name: 'Tulisan / Artikel', count: d.articlesCount || 0 }
    ];

    body.innerHTML =
      '<div class="ins-cards">' + cards + '</div>' +
      '<div class="ins-chart"><h3>Kunjungan 7 Hari Terakhir</h3><div class="ins-bars">' + bars + '</div></div>' +
      '<div class="ins-grid">' +
        listBlock('Halaman Terpopuler', topPages, 'Belum ada data.') +
        listBlock('Tulisan Terpopuler', topArticles, 'Belum ada kunjungan tulisan.') +
        listBlock('Ringkasan Konten', contentRows, '') +
      '</div>' +
      '<p class="section-note">Privasi: alamat IP pengunjung tidak disimpan — hanya di-hash untuk menghitung pengunjung unik per hari.</p>';
  }

  // ---- Articles manager ----
  function buildRichTools(editor) {
    var cmd = function (c, v) { return function (e) { e.preventDefault(); editor.focus(); document.execCommand(c, false, v || null); }; };
    var mk = function (html, title, handler) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = title; b.innerHTML = html; b.className = 'rt-btn';
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', handler);
      return b;
    };
    var bar = document.createElement('div'); bar.className = 'rich-tools';
    bar.appendChild(mk('<b>B</b>', 'Tebal', cmd('bold')));
    bar.appendChild(mk('<i>I</i>', 'Miring', cmd('italic')));
    bar.appendChild(mk('H2', 'Sub-judul', cmd('formatBlock', 'H2')));
    bar.appendChild(mk('H3', 'Sub-sub-judul', cmd('formatBlock', 'H3')));
    bar.appendChild(mk('&para;', 'Paragraf', cmd('formatBlock', 'P')));
    bar.appendChild(mk('&ldquo;', 'Kutipan', cmd('formatBlock', 'BLOCKQUOTE')));
    bar.appendChild(mk('&bull;', 'Daftar', cmd('insertUnorderedList')));
    bar.appendChild(mk('1.', 'Daftar angka', cmd('insertOrderedList')));
    bar.appendChild(mk('&#128279;', 'Tautan', function (e) { e.preventDefault(); var u = prompt('URL tautan:'); if (u) { editor.focus(); document.execCommand('createLink', false, u); } }));
    bar.appendChild(mk('&times;', 'Bersihkan format', cmd('removeFormat')));
    return bar;
  }

  function renderArticlesPanel(body) {
    var wrap = document.createElement('div');
    wrap.innerHTML = '<p class="section-note">Kelola tulisan/artikel yang tampil di halaman <b>Tulisan</b>.</p>';

    // Judul bagian "Tulisan Terbaru" di beranda (tersimpan via tombol Simpan Perubahan).
    ensurePath('articlesSection');
    var headBox = document.createElement('div');
    headBox.className = 'card-panel'; headBox.style.maxWidth = 'none'; headBox.style.marginBottom = '20px';
    headBox.innerHTML = '<h3>Judul Bagian di Beranda</h3><p>Label & judul bagian tulisan di halaman utama. Klik <b>Simpan Perubahan</b> (kanan atas) setelah mengubah.</p>';
    headBox.appendChild(buildField(state.data.articlesSection, { k: 'kicker', t: 'text', label: 'Label Kecil (mis. Artikel & Blog)' }));
    headBox.appendChild(buildField(state.data.articlesSection, { k: 'title', t: 'text', label: 'Judul Bagian (mis. Tulisan Terbaru)' }));
    wrap.appendChild(headBox);

    var topBar = document.createElement('div'); topBar.className = 'art-topbar';
    var newBtn = document.createElement('button'); newBtn.className = 'btn-primary'; newBtn.textContent = '+ Tulis Artikel Baru';
    topBar.appendChild(newBtn); wrap.appendChild(topBar);
    var listEl = document.createElement('div'); listEl.className = 'art-list'; wrap.appendChild(listEl);
    var editorEl = document.createElement('div'); editorEl.className = 'art-editor'; editorEl.hidden = true; wrap.appendChild(editorEl);
    body.appendChild(wrap);
    newBtn.addEventListener('click', function () { openEditor({}, editorEl, listEl); });
    loadArticles(listEl, editorEl);
  }

  function loadArticles(listEl, editorEl) {
    api('/api/articles').then(function (list) {
      state.articles = Array.isArray(list) ? list : [];
      drawArticleList(listEl, editorEl);
    }).catch(function (err) { listEl.innerHTML = '<p class="section-note">Gagal memuat: ' + esc(err.message) + '</p>'; });
  }

  function drawArticleList(listEl, editorEl) {
    var list = (state.articles || []).slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    if (!list.length) { listEl.innerHTML = '<p class="section-note">Belum ada tulisan.</p>'; return; }
    listEl.innerHTML = '';
    list.forEach(function (a) {
      var row = document.createElement('div'); row.className = 'art-row';
      row.innerHTML =
        '<div class="art-row-main"><div class="art-row-title">' + esc(a.title) + '</div>' +
        '<div class="art-row-meta"><span class="art-cat">' + esc(a.category || '') + '</span> &middot; ' + esc(a.date || '') + ' &middot; ' +
        (a.published === false ? '<span class="art-draft">Draf</span>' : '<span class="art-pub">Terbit</span>') + '</div></div>';
      var tools = document.createElement('div'); tools.className = 'art-row-tools';
      var edit = document.createElement('button'); edit.className = 'upload-btn'; edit.textContent = 'Edit';
      edit.addEventListener('click', function () { openEditor(a, editorEl, listEl); });
      var view = document.createElement('a'); view.className = 'upload-btn'; view.textContent = 'Lihat';
      view.href = 'artikel.html?slug=' + encodeURIComponent(a.slug); view.target = '_blank';
      var del = document.createElement('button'); del.className = 'upload-btn danger'; del.textContent = 'Hapus';
      del.addEventListener('click', function () {
        if (!confirm('Hapus tulisan "' + a.title + '"?')) return;
        api('/api/article/delete', { method: 'POST', body: { id: a.id } })
          .then(function () { toast('Tulisan dihapus'); editorEl.hidden = true; loadArticles(listEl, editorEl); })
          .catch(function (e) { toast(e.message, true); });
      });
      tools.appendChild(edit); tools.appendChild(view); tools.appendChild(del);
      row.appendChild(tools); listEl.appendChild(row);
    });
  }

  function openEditor(a, editorEl, listEl) {
    editorEl.hidden = false;
    editorEl.innerHTML = '';
    var current = { id: a.id, cover: a.cover || '' };

    function field(labelText, node) { var f = document.createElement('div'); f.className = 'field'; var l = document.createElement('label'); l.textContent = labelText; f.appendChild(l); f.appendChild(node); return f; }
    function inp(val) { var i = document.createElement('input'); i.type = 'text'; i.value = val || ''; return i; }

    var titleI = inp(a.title);
    var catI = inp(a.category || 'Opini');
    var dateI = document.createElement('input'); dateI.type = 'date'; dateI.value = a.date || new Date().toISOString().slice(0, 10);
    var excerptI = document.createElement('textarea'); excerptI.value = a.excerpt || ''; excerptI.rows = 2;

    var coverWrap = document.createElement('div'); coverWrap.className = 'photo-field';
    var coverImg = document.createElement('img'); coverImg.className = 'photo-preview'; coverImg.src = a.cover || '';
    var coverCtl = document.createElement('div'); coverCtl.className = 'photo-controls';
    var coverBtn = document.createElement('button'); coverBtn.type = 'button'; coverBtn.className = 'upload-btn'; coverBtn.textContent = 'Unggah Sampul';
    var coverPath = document.createElement('div'); coverPath.className = 'photo-path'; coverPath.textContent = a.cover || 'Belum ada sampul';
    var coverFile = document.createElement('input'); coverFile.type = 'file'; coverFile.accept = 'image/*'; coverFile.hidden = true;
    coverBtn.addEventListener('click', function () { coverFile.click(); });
    coverFile.addEventListener('change', function () {
      var fl = coverFile.files[0]; if (!fl) return;
      if (fl.size > 10 * 1024 * 1024) { toast('Ukuran maksimal 10MB', true); return; }
      var rd = new FileReader(); coverBtn.textContent = 'Mengunggah...'; coverBtn.disabled = true;
      rd.onload = function () {
        api('/api/upload', { method: 'POST', body: { dataUrl: rd.result } })
          .then(function (res) { current.cover = res.path; coverImg.src = res.path; coverPath.textContent = res.path; })
          .catch(function (e) { toast(e.message, true); })
          .finally(function () { coverBtn.textContent = 'Unggah Sampul'; coverBtn.disabled = false; });
      };
      rd.readAsDataURL(fl);
    });
    coverCtl.appendChild(coverBtn); coverCtl.appendChild(coverPath); coverCtl.appendChild(coverFile);
    coverWrap.appendChild(coverImg); coverWrap.appendChild(coverCtl);

    var editor = document.createElement('div'); editor.className = 'rich'; editor.contentEditable = 'true'; editor.innerHTML = a.bodyHtml || '';
    var bodyField = document.createElement('div'); bodyField.className = 'field';
    var bl = document.createElement('label'); bl.textContent = 'Isi Tulisan';
    bodyField.appendChild(bl); bodyField.appendChild(buildRichTools(editor)); bodyField.appendChild(editor);

    var pubWrap = document.createElement('label'); pubWrap.className = 'art-check';
    var pubChk = document.createElement('input'); pubChk.type = 'checkbox'; pubChk.checked = a.published !== false;
    pubWrap.appendChild(pubChk); pubWrap.appendChild(document.createTextNode(' Terbitkan (tampilkan di situs)'));

    var actions = document.createElement('div'); actions.className = 'art-actions';
    var saveBtn = document.createElement('button'); saveBtn.className = 'btn-primary'; saveBtn.textContent = a.id ? 'Simpan Tulisan' : 'Terbitkan Tulisan';
    var cancelBtn = document.createElement('button'); cancelBtn.className = 'upload-btn'; cancelBtn.textContent = 'Tutup';
    cancelBtn.addEventListener('click', function () { editorEl.hidden = true; });
    actions.appendChild(saveBtn); actions.appendChild(cancelBtn);

    saveBtn.addEventListener('click', function () {
      var payload = {
        id: current.id,
        title: titleI.value.trim() || 'Tanpa Judul',
        category: catI.value.trim() || 'Opini',
        date: dateI.value,
        excerpt: excerptI.value.trim(),
        cover: current.cover,
        bodyHtml: editor.innerHTML.trim(),
        published: pubChk.checked
      };
      saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan...';
      api('/api/article', { method: 'POST', body: payload })
        .then(function () { toast('Tulisan tersimpan'); editorEl.hidden = true; loadArticles(listEl, editorEl); })
        .catch(function (e) { toast(e.message, true); })
        .finally(function () { saveBtn.disabled = false; saveBtn.textContent = a.id ? 'Simpan Tulisan' : 'Terbitkan Tulisan'; });
    });

    var head = document.createElement('h3'); head.className = 'art-editor-head'; head.textContent = a.id ? 'Edit Tulisan' : 'Tulisan Baru';
    editorEl.appendChild(head);
    editorEl.appendChild(field('Judul', titleI));
    var grid = document.createElement('div'); grid.className = 'grid-2';
    grid.appendChild(field('Kategori', catI));
    grid.appendChild(field('Tanggal', dateI));
    editorEl.appendChild(grid);
    editorEl.appendChild(field('Ringkasan (excerpt)', excerptI));
    editorEl.appendChild(field('Gambar Sampul', coverWrap));
    editorEl.appendChild(bodyField);
    var pf = document.createElement('div'); pf.className = 'field'; pf.appendChild(pubWrap); editorEl.appendChild(pf);
    editorEl.appendChild(actions);
    head.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Security ----
  function renderSecurity(body) {
    var panel = document.createElement('div');
    panel.className = 'card-panel';
    panel.innerHTML =
      '<h3>Ubah Kata Sandi</h3><p>Minimal 6 karakter.</p>' +
      '<div class="field"><label>Kata sandi saat ini</label><input type="password" id="pwCur"></div>' +
      '<div class="field"><label>Kata sandi baru</label><input type="password" id="pwNew"></div>' +
      '<button class="btn-primary" id="pwBtn">Perbarui</button>';
    body.appendChild(panel);
    $('pwBtn').addEventListener('click', function () {
      var cur = $('pwCur').value, next = $('pwNew').value;
      api('/api/password', { method: 'POST', body: { current: cur, next: next } })
        .then(function () { toast('Kata sandi diperbarui'); $('pwCur').value = ''; $('pwNew').value = ''; })
        .catch(function (err) { toast(err.message || 'Gagal', true); });
    });
  }

  // ---- Save / logout ----
  $('saveBtn').addEventListener('click', function () {
    var btn = $('saveBtn'); btn.disabled = true; btn.textContent = 'Menyimpan...';
    api('/api/content', { method: 'POST', body: state.data })
      .then(function () { markClean(); toast('Perubahan tersimpan'); })
      .catch(function (err) { toast(err.message || 'Gagal simpan', true); })
      .finally(function () { btn.disabled = false; btn.textContent = 'Simpan Perubahan'; });
  });

  $('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('pd_token');
    location.reload();
  });

  window.addEventListener('beforeunload', function (e) {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---- Boot: verify existing token before showing panel ----
  (function () {
    var saved = sessionStorage.getItem('pd_token');
    if (!saved) return;
    state.token = saved;
    // Validate the token first; GET /api/content is public so it can't confirm auth.
    api('/api/session')
      .then(function () { return loadContent().then(showApp); })
      .catch(function () {
        sessionStorage.removeItem('pd_token'); state.token = null;
        $('login').hidden = false; $('app').hidden = true;
      });
  })();
})();
