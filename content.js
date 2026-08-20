/* Renders all sections from data/content.json into the DOM. */
(function () {
  'use strict';

  var ICONS = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    scholar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3z"/><path d="M6 13.2V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8l-6 3.3-6-3.3z"/></svg>',
    sinta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20" opacity="0"/><path d="M12 2 4 6v6c0 5 3.4 8 8 10 4.6-2 8-5 8-10V6l-8-4z"/></svg>',
    scopus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 22 11 22 14.4V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/></svg>'
  };

  var NAV = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'keahlian', label: 'Keahlian' },
    { id: 'pendidikan', label: 'Pendidikan' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'portofolio', label: 'Portofolio' },
    { id: 'publikasi', label: 'Publikasi' },
    { id: 'penelitian', label: 'Penelitian' },
    { id: 'pengabdian', label: 'Pengabdian' },
    { id: 'hki', label: 'HKI' },
    { id: 'tulisan', label: 'Tulisan' },
    { id: 'kontak', label: 'Kontak' }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function el(id) { return document.getElementById(id); }
  function icon(name) { return ICONS[name] || ICONS.globe; }

  function render(data) {
    var d = data || {};
    var p = d.profile || {};
    document.title = (d.meta && d.meta.siteTitle) || 'Portofolio Dosen';
    if (d.meta && d.meta.accent) {
      document.documentElement.style.setProperty('--accent', d.meta.accent);
    }

    // Sidebar profile
    var avatar = p.avatar
      ? '<img class="sb-avatar" src="' + esc(p.avatar) + '" alt="' + esc(p.name) + '" />'
      : '<div class="sb-avatar"></div>';
    el('sbProfile').innerHTML =
      avatar +
      '<h1 class="sb-name">' + esc(p.name) + '</h1>' +
      (p.role ? '<div class="sb-role">' + esc(p.role) + '</div>' : '') +
      (p.affiliation ? '<div class="sb-affil">' + esc(p.affiliation) + '</div>' : '') +
      (p.location ? '<div class="sb-loc">' + icon('pin') + esc(p.location) + '</div>' : '');
    var tb = el('topbarName'); if (tb) tb.textContent = p.name || 'Dosen';
    var ta = document.getElementById('topbarAvatar');
    if (ta) { if (p.avatar) { ta.src = p.avatar; ta.hidden = false; } else { ta.hidden = true; } }

    // Sidebar nav
    el('sbNav').innerHTML = NAV.map(function (n, i) {
      return '<a href="#' + n.id + '" data-nav="' + n.id + '"' + (i === 0 ? ' class="active"' : '') +
        '><span class="dot"></span>' + esc(n.label) + '</a>';
    }).join('');

    // Socials
    var socials = d.socials || [];
    el('sbSocials').innerHTML = socials.map(function (s) {
      return '<a href="' + esc(s.url) + '" title="' + esc(s.label) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' + icon(s.icon) + '</a>';
    }).join('');

    el('sbCopy').textContent = '© ' + new Date().getFullYear() + ' ' + (p.name || '');

    renderHero(d.hero || {});
    renderAbout(d.about || {});
    renderExpertise(d.expertise || {});
    renderTimeline('educationMount', d.education || {}, 'degree', 'institution');
    renderTimeline('experienceMount', d.experience || {}, 'role', 'org');
    renderPortfolio(d.portfolio || {});
    renderPublications(d.publications || {});
    renderList('penelitianMount', d.penelitian || {});
    renderList('pengabdianMount', d.pengabdian || {});
    renderList('hkiMount', d.hki || {});
    renderContact(d.contact || {});

    window.dispatchEvent(new CustomEvent('content:rendered'));
    renderArticles(d.articlesSection || {});
  }

  function sectionHead(kicker, title) {
    return (kicker ? '<div class="kicker">' + esc(kicker) + '</div>' : '') +
      '<h2 class="section-title reveal">' + esc(title) + '</h2>';
  }

  function renderHero(h) {
    var stats = (h.stats || []).map(function (s) {
      return '<div class="hero-stat"><div class="num" data-count="' + esc(s.value) + '">0<span>' + esc(s.suffix || '') + '</span></div>' +
        '<div class="lbl">' + esc(s.label) + '</div></div>';
    }).join('');
    var cta = '';
    if (h.ctaText) cta += '<a class="btn btn-primary" href="' + esc(h.ctaHref || '#portofolio') + '">' + esc(h.ctaText) + '</a>';
    if (h.ctaGhostText) cta += '<a class="btn btn-ghost" href="' + esc(h.ctaGhostHref || '#kontak') + '">' + esc(h.ctaGhostText) + '</a>';

    var heroSection = document.getElementById('beranda');
    if (h.portrait) {
      heroSection.classList.add('has-bg');
      heroSection.style.backgroundImage = "url('" + String(h.portrait).replace(/'/g, "%27") + "')";
      heroSection.style.backgroundPosition = h.bgPosition || 'center right';
    } else {
      heroSection.classList.remove('has-bg');
      heroSection.style.backgroundImage = '';
    }

    el('heroMount').innerHTML =
      '<div class="hero-copy">' +
        (h.greeting ? '<div class="hero-greeting reveal">' + esc(h.greeting) + '</div>' : '') +
        '<h2 class="hero-title reveal">' + esc(h.headline) + '</h2>' +
        (h.tagline ? '<p class="hero-tagline reveal">' + esc(h.tagline) + '</p>' : '') +
        '<div class="hero-cta reveal">' + cta + '</div>' +
        (stats ? '<div class="hero-stats reveal">' + stats + '</div>' : '') +
      '</div>';
  }

  function renderAbout(a) {
    var paras = (a.paragraphs || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    el('aboutMount').innerHTML = sectionHead(a.kicker, a.title) +
      '<div class="about-body reveal">' + paras + '</div>';
  }

  function renderExpertise(e) {
    var cards = (e.items || []).map(function (it, i) {
      return '<div class="card reveal"><div class="card-index">0' + (i + 1) + '</div>' +
        '<h3>' + esc(it.title) + '</h3><p>' + esc(it.desc) + '</p></div>';
    }).join('');
    el('expertiseMount').innerHTML = sectionHead(e.kicker, e.title) + '<div class="cards">' + cards + '</div>';
  }

  function renderTimeline(mountId, data, titleKey, orgKey) {
    var items = (data.items || []).map(function (it) {
      return '<div class="tl-item reveal">' +
        '<div class="tl-period">' + esc(it.period) + '</div>' +
        '<div class="tl-title">' + esc(it[titleKey]) + '</div>' +
        '<div class="tl-org">' + esc(it[orgKey]) + '</div>' +
        (it.detail ? '<div class="tl-detail">' + esc(it.detail) + '</div>' : '') +
        '</div>';
    }).join('');
    el(mountId).innerHTML = sectionHead(data.kicker, data.title) + '<div class="timeline">' + items + '</div>';
  }

  function renderPortfolio(pf) {
    var cards = (pf.items || []).map(function (it) {
      return '<article class="pf-card reveal">' +
        (it.image ? '<div class="pf-thumb"><img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy" /></div>' : '') +
        '<div class="pf-body">' +
          '<div class="pf-meta"><span class="pf-tag">' + esc(it.category) + '</span><span>' + esc(it.year) + '</span></div>' +
          '<h3>' + esc(it.title) + '</h3>' +
          '<p>' + esc(it.desc) + '</p>' +
          (it.link ? '<a class="pf-link" href="' + esc(it.link) + '" target="_blank" rel="noopener">Lihat detail ' + icon('link') + '</a>' : '') +
        '</div></article>';
    }).join('');
    el('portfolioMount').innerHTML = sectionHead(pf.kicker, pf.title) + '<div class="portfolio-grid">' + cards + '</div>';
  }

  function renderPublications(pub) {
    var items = sortByYearDesc(pub.items).map(pubItemHtml).join('');
    el('publicationsMount').innerHTML = sectionHead(pub.kicker, pub.title) + renderTrack(pub) +
      (items ? '<div class="pub-list">' + items + '</div>' : '');
  }

  function sortByYearDesc(items) {
    return (items || []).slice().sort(function (a, b) {
      var ya = parseInt(a && a.year, 10); if (isNaN(ya)) ya = -1;
      var yb = parseInt(b && b.year, 10); if (isNaN(yb)) yb = -1;
      return yb - ya;
    });
  }

  function pubItemHtml(it) {
    var inner =
      '<div class="pub-year">' + esc(it.year) + '</div>' +
      '<div class="pub-main"><h3>' + esc(it.title) + '</h3>' +
      '<div class="pub-venue">' + esc(it.venue) + '</div></div>' +
      (it.link ? '<div class="pub-go">' + icon('link') + '</div>' : '');
    return it.link
      ? '<a class="pub-item reveal" href="' + esc(it.link) + '" target="_blank" rel="noopener">' + inner + '</a>'
      : '<div class="pub-item reveal">' + inner + '</div>';
  }

  function renderList(mountId, data) {
    var mount = el(mountId);
    if (!mount) return;
    var items = sortByYearDesc(data.items).map(pubItemHtml).join('');
    var body = items
      ? '<div class="pub-list">' + items + '</div>'
      : '<p class="about-body reveal" style="color:var(--ink-3)">Belum ada data. Tambahkan lewat panel admin.</p>';
    mount.innerHTML = sectionHead(data.kicker, data.title) + body;
  }

  function trackIcon(i) {
    var svgs = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 19V5M4 19h16M8 16l3-4 3 2 4-6"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="9" r="5"/><path d="M9 13.5 7.5 21 12 18.5 16.5 21 15 13.5"/></svg>'
    ];
    return svgs[i] || svgs[0];
  }

  function renderTrack(pub) {
    var stats = pub.stats || [];
    if (!stats.length && !pub.scholarUrl && !pub.sintaUrl && !pub.scopusUrl) return '';
    var cards = stats.map(function (s, i) {
      return '<div class="track-card reveal">' +
        '<span class="track-ico">' + trackIcon(i) + '</span>' +
        '<div class="track-num">' + esc(s.value) + '</div>' +
        '<div class="track-lbl">' + esc(s.label) + '</div>' +
      '</div>';
    }).join('');
    var links = '';
    if (pub.scholarUrl) links += '<a class="btn btn-primary" href="' + esc(pub.scholarUrl) + '" target="_blank" rel="noopener">Lihat di Google Scholar &#8599;</a>';
    if (pub.sintaUrl) links += '<a class="btn btn-ghost" href="' + esc(pub.sintaUrl) + '" target="_blank" rel="noopener">Lihat di SINTA &#8599;</a>';
    if (pub.scopusUrl) links += '<a class="btn btn-ghost" href="' + esc(pub.scopusUrl) + '" target="_blank" rel="noopener">Lihat di Scopus &#8599;</a>';
    return '<div class="track-wrap reveal">' +
      (pub.trackTitle ? '<h3 class="track-title">' + esc(pub.trackTitle) + '</h3>' : '') +
      (cards ? '<div class="track-stats">' + cards + '</div>' : '') +
      (links ? '<div class="track-links">' + links + '</div>' : '') +
    '</div>';
  }

  function renderArticles(cfg) {
    var mount = el('articlesMount');
    if (!mount) return;
    var kicker = (cfg && cfg.kicker) || 'Artikel & Blog';
    var title = (cfg && cfg.title) || 'Tulisan Terbaru';
    var MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    function fmtDate(s){ var d=new Date(s); return isNaN(d)?esc(s||''):d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear(); }
    fetch('/api/articles', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (list) {
        list = Array.isArray(list) ? list : [];
        var head = sectionHead(kicker, title);
        if (!list.length) {
          mount.innerHTML = head + '<p class="about-body reveal" style="color:var(--ink-3)">Belum ada tulisan. Tambahkan lewat panel admin.</p>';
          markRevealed(mount);
          return;
        }
        var cards = list.slice(0, 3).map(function (a) {
          var cover = a.cover ? '<div class="ac-thumb"><img src="' + esc(a.cover) + '" alt="' + esc(a.title) + '" loading="lazy"></div>' : '';
          return '<a class="article-card reveal" href="artikel.html?slug=' + encodeURIComponent(a.slug) + '">' +
            cover +
            '<div class="ac-body">' +
              '<div class="ac-meta"><span class="ac-cat">' + esc(a.category || 'Tulisan') + '</span><span>' + fmtDate(a.date) + '</span></div>' +
              '<h3>' + esc(a.title) + '</h3>' +
              (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') +
              '<span class="ac-more">Baca selengkapnya →</span>' +
            '</div>' +
          '</a>';
        }).join('');
        mount.innerHTML = head +
          '<div class="article-grid">' + cards + '</div>' +
          '<div class="articles-cta reveal"><a class="btn btn-ghost" href="tulisan.html">Lihat Semua Tulisan</a></div>';
        markRevealed(mount);
      })
      .catch(function () {
        mount.innerHTML = sectionHead(kicker, title) +
          '<p class="about-body" style="color:var(--ink-3)">Gagal memuat tulisan.</p>';
      });
  }

  function markRevealed(scope) {
    // Article cards load after the initial IntersectionObserver pass; reveal them now.
    if (!('IntersectionObserver' in window)) {
      scope.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    scope.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });
  }

  function renderContact(c) {
    var items = '';
    if (c.email) items += '<div class="contact-item">' + icon('mail') + '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></div>';
    if (c.phone) items += '<div class="contact-item">' + icon('phone') + '<a href="tel:' + esc(String(c.phone).replace(/\s/g, '')) + '">' + esc(c.phone) + '</a></div>';
    if (c.address) items += '<div class="contact-item">' + icon('pin') + '<span>' + esc(c.address) + '</span></div>';

    el('contactMount').innerHTML =
      '<div class="contact-wrap reveal">' +
        (c.kicker ? '<div class="kicker">' + esc(c.kicker) + '</div>' : '') +
        '<h2 class="section-title">' + esc(c.title) + '</h2>' +
        (c.subtitle ? '<p class="contact-sub">' + esc(c.subtitle) + '</p>' : '') +
        '<div class="contact-list">' + items + '</div>' +
        (c.email ? '<div class="contact-cta"><a class="btn btn-primary" href="mailto:' + esc(c.email) + '">Kirim Email</a></div>' : '') +
      '</div>';
  }

  function boot() {
    fetch('data/content.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function (err) {
        console.error('Gagal memuat konten:', err);
        el('heroMount').innerHTML = '<p style="color:#c00">Gagal memuat konten. Pastikan server berjalan.</p>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
