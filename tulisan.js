(function () {
  'use strict';
  var MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(s){var d=new Date(s);return isNaN(d)?esc(s||''):d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();}

  var all = [], activeCat = 'Semua', query = '';
  var listMount = document.getElementById('listMount');
  var emptyNote = document.getElementById('emptyNote');
  var searchInput = document.getElementById('searchInput');
  var filterBar = document.getElementById('filterBar');

  fetch('/api/content', { cache: 'no-store' }).then(function(r){return r.json();}).then(function(c){
    var name = (c.profile && c.profile.name) || 'Tulisan';
    document.getElementById('writingBrand').textContent = name;
    document.title = 'Tulisan — ' + name;
  }).catch(function(){});

  fetch('/api/articles', { cache: 'no-store' })
    .then(function(r){return r.json();})
    .then(function(list){
      all = Array.isArray(list) ? list : [];
      buildFilters();
      render();
    })
    .catch(function(){ emptyNote.hidden = false; emptyNote.textContent = 'Gagal memuat tulisan.'; });

  function buildFilters(){
    var cats = ['Semua'];
    all.forEach(function(a){ if(a.category && cats.indexOf(a.category)<0) cats.push(a.category); });
    filterBar.innerHTML = cats.map(function(c){
      return '<button class="filter-chip'+(c===activeCat?' active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
    }).join('');
    Array.prototype.forEach.call(filterBar.children, function(b){
      b.addEventListener('click', function(){ activeCat=b.getAttribute('data-cat'); buildFilters(); render(); });
    });
  }

  searchInput.addEventListener('input', function(){ query = searchInput.value.toLowerCase().trim(); render(); });

  function render(){
    var items = all.filter(function(a){
      var okCat = activeCat==='Semua' || a.category===activeCat;
      var hay = ((a.title||'')+' '+(a.excerpt||'')+' '+(a.category||'')).toLowerCase();
      var okQ = !query || hay.indexOf(query)>=0;
      return okCat && okQ;
    });
    if(!items.length){ listMount.innerHTML=''; emptyNote.hidden=false; return; }
    emptyNote.hidden = true;
    listMount.innerHTML = items.map(function(a){
      var cover = a.cover ? '<div class="ac-thumb"><img src="'+esc(a.cover)+'" alt="'+esc(a.title)+'" loading="lazy"></div>' : '';
      return '<a class="article-card" href="artikel.html?slug='+encodeURIComponent(a.slug)+'">'+
        cover+
        '<div class="ac-body">'+
          '<div class="ac-meta"><span class="ac-cat">'+esc(a.category||'Tulisan')+'</span><span>'+fmtDate(a.date)+'</span></div>'+
          '<h2>'+esc(a.title)+'</h2>'+
          (a.excerpt?'<p>'+esc(a.excerpt)+'</p>':'')+
          '<span class="ac-more">Baca selengkapnya →</span>'+
        '</div>'+
      '</a>';
    }).join('');
  }
})();
