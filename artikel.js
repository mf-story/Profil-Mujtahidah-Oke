(function () {
  'use strict';
  var MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function fmtDate(s){var d=new Date(s);return isNaN(d)?esc(s||''):d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}

  var root = document.getElementById('readerRoot');
  var slug = new URLSearchParams(location.search).get('slug');
  var progress = document.getElementById('readProgress');
  window.addEventListener('scroll', function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h>0 ? (window.scrollY/h)*100 : 0) + '%';
  });

  if(!slug){ root.innerHTML='<div class="empty-note">Tulisan tidak ditemukan.</div>'; return; }

  Promise.all([
    fetch('/api/article?slug='+encodeURIComponent(slug), { cache:'no-store' }).then(function(r){return r.ok?r.json():null;}),
    fetch('/api/content', { cache:'no-store' }).then(function(r){return r.json();}).catch(function(){return {};})
  ]).then(function(res){
    var a = res[0], content = res[1] || {};
    if(!a || a.ok===false){ root.innerHTML='<div class="empty-note">Tulisan tidak ditemukan.</div>'; return; }
    var profile = content.profile || {};
    var authorName = profile.name || '';
    var authorRole = profile.role || '';
    var avatar = profile.avatar || '';
    document.title = a.title + (authorName ? ' — ' + authorName : '');
    document.getElementById('writingBrand').textContent = authorName || 'Tulisan';
    var md = document.querySelector('meta[name="description"]');
    if(md) md.setAttribute('content', a.excerpt || a.title);

    var badge = avatar ? '<img src="'+esc(avatar)+'" alt="">' : esc((profile.initials||'').slice(0,2));
    var cover = a.cover ? '<div class="reader-cover"><img src="'+esc(a.cover)+'" alt="'+esc(a.title)+'"></div>' : '';

    root.innerHTML =
      '<div class="reader-head">'+
        '<span class="reader-cat">'+esc(a.category||'Tulisan')+'</span>'+
        '<h1>'+esc(a.title)+'</h1>'+
        '<div class="reader-meta"><span>'+fmtDate(a.date)+'</span> · <span>'+(Number(a.readMinutes)||1)+' menit baca</span></div>'+
      '</div>'+
      cover+
      '<article class="prose">'+(a.bodyHtml||'')+'</article>'+
      '<div class="reader-footer">'+
        '<div class="byline">'+
          '<span class="byline-badge">'+badge+'</span>'+
          '<span class="byline-who"><b>'+esc(authorName)+'</b><span>'+esc(authorRole)+'</span></span>'+
        '</div>'+
        '<a class="btn btn-ghost" href="tulisan.html">← Semua Tulisan</a>'+
      '</div>';
  }).catch(function(){
    root.innerHTML='<div class="empty-note">Gagal memuat tulisan.</div>';
  });
})();
