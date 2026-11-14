// Leser innhold.yml og fyller siden. Du trenger normalt ikke røre denne fila.
(function () {
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (id) { return document.getElementById(id); };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); };
  var chipNavn = { book: 'Book', ipa: 'IPA', sjekk: 'Sjekk åpent' };
  var chipKlasse = { book: 'book', ipa: 'beer', sjekk: 'check' };
  var chip = function (c) { return c ? ' <span class="chip ' + (chipKlasse[c] || 'check') + '">' + esc(chipNavn[c] || c) + '</span>' : ''; };
  var get = function (o, path) { return path.split('.').reduce(function (a, k) { return a ? a[k] : undefined; }, o); };

  function render(d) {
    document.querySelectorAll('[data-f]').forEach(function (el) { el.textContent = get(d, el.dataset.f) || ''; });
    if (d.tur && d.tur.start) {
      var start = new Date(d.tur.start), now = new Date();
      start.setHours(0, 0, 0, 0); now.setHours(0, 0, 0, 0);
      var dager = Math.round((start - now) / 86400000);
      var nedtelling = dager > 1 ? 'om ' + dager + ' dager' : dager === 1 ? 'i morgen!' : dager > -4 ? 'nå!' : '';
      if (nedtelling) document.querySelector('[data-f="tur.undertittel"]').textContent += ' · ' + nedtelling;
    }
    var t = (d.tur && d.tur.tittel) || '';
    $('tittel').innerHTML = esc(t).replace('&amp;', '<em>&amp;</em>');

    $('fakta').innerHTML = (d.tur.fakta || []).map(function (f) {
      return '<div class="fact"><span>' + esc(f.etikett) + '</span><b class="mono">' + esc(f.verdi) + '</b><span>' + esc(f.tekst) + '</span></div>';
    }).join('');

    $('merknad').innerHTML = d.merknad ? '<div class="note"><span>⚠︎</span><p><b>' + esc(d.merknad.tittel) + ':</b> ' + esc(d.merknad.tekst) + '</p></div>' : '';

    $('dager').innerHTML = (d.program || []).map(function (dag) {
      return '<article class="day"><div class="day-head"><h3>' + esc(dag.dag) + '</h3><span class="where">' + esc(dag.hvor) + '</span>' +
        (dag.merke ? '<span class="tag">' + esc(dag.merke) + '</span>' : '') + '</div><ol class="tl">' +
        (dag.punkter || []).map(function (p) {
          return '<li><time>' + esc(p.tid) + '</time><div class="what"><strong>' + esc(p.tittel) + chip(p.chip) + '</strong>' + (p.tekst ? '<p>' + esc(p.tekst) + '</p>' : '') + '</div></li>';
        }).join('') + '</ol></article>';
    }).join('');

    $('steder').innerHTML = (d.steder || []).map(function (s) {
      return '<article class="card"><span class="kind">' + esc(s.type) + '</span><h3>' + esc(s.navn) + '</h3>' +
        (s['når'] ? '<span class="day-ref">' + esc(s['når']) + '</span>' : '') +
        (s.tekst ? '<p>' + esc(s.tekst) + '</p>' : '') +
        (s.bestill ? '<div class="order"><b>Tips:</b> ' + esc(s.bestill) + '</div>' : '') +
        (s.adresse ? '<span class="addr">' + esc(s.adresse) + '</span>' : '') +
        '<div class="links"><a href="' + maps(s.sok || s.navn) + '" target="_blank" rel="noopener">Åpne i kart ↗</a>' +
        (s.nettside ? '<a href="' + esc(s.nettside) + '" target="_blank" rel="noopener">Nettside ↗</a>' : '') + '</div></article>';
    }).join('');

    $('overnatting').innerHTML = (d.overnatting || []).map(function (o) {
      return '<article class="card"><span class="kind">' + esc(o['når']) + '</span><h3>' + esc(o.navn) + '</h3><p>' + esc(o.tekst) + '</p>' +
        '<ul>' + (o.punkter || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '<div class="links"><a href="' + maps(o.sok || o.navn) + '" target="_blank" rel="noopener">Åpne i kart ↗</a></div></article>';
    }).join('');

    var farge = { mat: 'var(--gamay)', ol: 'var(--gold)', hjem: 'var(--saone)' };
    var pinKl = { mat: '', ol: ' beer', hjem: ' home' };
    var paKart = [].concat(d.overnatting || [], d.steder || []).filter(function (s) { return s.kart; });
    $('naler').innerHTML = paKart.map(function (s) {
      var k = s.kart;
      return '<a href="' + maps(s.sok || s.navn) + '" target="_blank"><circle cx="' + (+k.x) + '" cy="' + (+k.y) + '" r="12" fill="' + (farge[k.type] || farge.mat) + '"/>' +
        '<text x="' + (+k.x) + '" y="' + (+k.y + 4) + '" fill="var(--bg)">' + esc(k.nr) + '</text></a>';
    }).join('');
    $('tegnforklaring').innerHTML = paKart.map(function (s) {
      var k = s.kart;
      return '<li><span class="pin' + (pinKl[k.type] || '') + '">' + esc(k.nr) + '</span><div><a href="' + maps(s.sok || s.navn) + '" target="_blank" rel="noopener">' + esc(s.navn) + '</a><small>' + esc(s['når'] || '') + '</small></div></li>';
    }).join('');

    $('strekninger').innerHTML = ((d.transport && d.transport.strekninger) || []).map(function (l) {
      return '<div class="leg"><span class="from">' + esc(l.fra) + '</span><span class="how">' + esc(l.hvordan) + '</span><span class="dur">' + esc(l.tid) + '</span></div>';
    }).join('');

    $('retter').innerHTML = (d.retter || []).map(function (r) { return '<dt>' + esc(r.navn) + '</dt><dd>' + esc(r.tekst) + '</dd>'; }).join('');

    $('praktiskgrid').innerHTML = (d.praktisk || []).map(function (p) {
      return '<div class="card"><span class="kind">' + esc(p.etikett) + '</span>' + (p.stor ? '<span class="big mono">' + esc(p.stor) + '</span>' : '<h3>' + esc(p.tittel) + '</h3>') + '<p>' + esc(p.tekst) + '</p></div>';
    }).join('') + (d.fraser ? '<div class="card" style="grid-column:1/-1"><span class="kind">Fransk for gourmeter</span><h3>Fraser som hjelper</h3><div class="phr">' +
      d.fraser.map(function (f) { return '<div><span>' + esc(f.norsk) + '</span><i>' + esc(f.fransk) + '</i></div>'; }).join('') + '</div></div>' : '');

    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('gk-lyon-todo') || '{}'); } catch (e) {}
    $('todo').innerHTML = (d.sjekkliste || []).map(function (t, i) {
      return '<li><label><input type="checkbox" data-k="' + esc(t) + '" id="t' + i + '"><span>' + esc(t) + '</span></label></li>';
    }).join('');
    document.querySelectorAll('.todo input').forEach(function (b) {
      if (saved[b.dataset.k]) b.checked = true;
      b.addEventListener('change', function () {
        saved[b.dataset.k] = b.checked;
        try { localStorage.setItem('gk-lyon-todo', JSON.stringify(saved)); } catch (e) {}
      });
    });
  }

  fetch('innhold.yml', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('Fant ikke innhold.yml'); return r.text(); })
    .then(function (txt) { render(jsyaml.load(txt)); })
    .catch(function (e) {
      document.querySelector('main').insertAdjacentHTML('afterbegin',
        '<div class="wrap" style="padding-block:24px"><div class="note"><span>⚠︎</span><p><b>Klarte ikke å lese innhold.yml:</b> ' + esc(e.message) +
        '. Sjekk at innrykk og kolon er riktige i siste endring.</p></div></div>');
    });
})();
