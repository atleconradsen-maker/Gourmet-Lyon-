// Leser innhold.yml og fyller siden. Du trenger normalt ikke røre denne fila.
(function () {
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (id) { return document.getElementById(id); };
  var maps = function (q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); };
  var dir = function (q) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q); };
  var pinIkon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var navIkon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8z"/></svg>';
  var webIkon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>';
  var trygg = function (u) { return /^https?:\/\//.test(u || '') ? u : ''; };
  var webKnapp = function (u) { return trygg(u) ? '<a class="mapbtn" href="' + esc(u) + '" target="_blank" rel="noopener">' + webIkon + 'Nettside</a>' : ''; };
  var knapper = function (q, url) {
    return '<div class="mapbtns"><a class="mapbtn primary" href="' + dir(q) + '" target="_blank" rel="noopener">' + navIkon + 'Veibeskrivelse</a>' +
      '<a class="mapbtn" href="' + maps(q) + '" target="_blank" rel="noopener">' + pinIkon + 'Vis i kart</a>' + webKnapp(url) + '</div>';
  };
  var chipNavn = { book: 'Book', ipa: 'IPA', sjekk: 'Sjekk åpent' };
  var chipKlasse = { book: 'book', ipa: 'beer', sjekk: 'check' };
  var chip = function (c) { return c ? ' <span class="chip ' + (chipKlasse[c] || 'check') + '">' + esc(chipNavn[c] || c) + '</span>' : ''; };
  var get = function (o, path) { return path.split('.').reduce(function (a, k) { return a ? a[k] : undefined; }, o); };

  function render(d) {
    var oppslag = {};
    [].concat(d.steder || [], d.overnatting || []).forEach(function (s) { oppslag[s.navn] = s.sok || s.adresse || s.navn; });
    var finn = function (sted) { return oppslag[sted] || sted; };
    if (d.tur && d.tur.hjem) {
      document.querySelectorAll('[data-hjem]').forEach(function (a) { a.href = dir(d.tur.hjem); });
    }
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
          return '<li><time>' + esc(p.tid) + '</time><div class="what"><strong>' + esc(p.tittel) + chip(p.chip) + '</strong>' + (p.tekst ? '<p>' + esc(p.tekst) + '</p>' : '') + (p.sted ? '<a class="tl-map" href="' + dir(finn(p.sted)) + '" target="_blank" rel="noopener">' + navIkon + 'Veibeskrivelse</a>' : '') + '</div></li>';
        }).join('') + '</ol></article>';
    }).join('');

    var kort = function (s) {
      return '<article class="card"><span class="kind">' + esc(s.type) + '</span><h3>' + esc(s.navn) + chip(s.chip) + '</h3>' +
        (s['når'] ? '<span class="day-ref">' + esc(s['når']) + '</span>' : '') +
        (s.tekst ? '<p>' + esc(s.tekst) + '</p>' : '') +
        (s.apent ? '<div class="order"><b>Åpent:</b> ' + esc(s.apent) + '</div>' : '') +
        (s.bestill ? '<div class="order"><b>Tips:</b> ' + esc(s.bestill) + '</div>' : '') +
        (s.adresse ? '<span class="addr">' + esc(s.adresse) + '</span>' : '') +
        knapper(s.sok || s.navn, s.nettside) + '</article>';
    };
    $('steder').innerHTML = (d.steder || []).map(kort).join('');
    $('barer-liste').innerHTML = (d.barer || []).map(kort).join('');
    if (d.vidar) {
      $('vidar-ingress').textContent = d.vidar.ingress || '';
      $('vidar-steder').innerHTML = (d.vidar.steder || []).map(kort).join('');
    } else { $('vidar').hidden = true; }
    if (d.ipa) {
      $('ipa-ingress').textContent = d.ipa.ingress || '';
      $('ipa-liste').innerHTML = (d.ipa.steder || []).map(kort).join('');
    } else { $('ipa').hidden = true; }
    if (d.taxi) {
      var tel = function (n) { return 'tel:+33' + String(n).replace(/\D/g, '').replace(/^0/, ''); };
      $('taxi-ingress').textContent = d.taxi.ingress || '';
      $('taxi-grupper').innerHTML = (d.taxi.grupper || []).map(function (g) {
        return '<div class="card"><h3>' + esc(g.tittel) + '</h3><div class="taxis">' + (g.nummer || []).map(function (t) {
          return '<a class="taxi-btn" href="' + tel(t.nummer) + '"><span class="taxi-ikon" aria-hidden="true">☎</span><span><b>' + esc(t.navn) + '</b><span class="mono">' + esc(t.nummer) + '</span></span></a>';
        }).join('') + '</div></div>';
      }).join('') +
      '<div class="card"><h3>Vis sjåføren adressen</h3>' + (d.taxi.adresser || []).map(function (a) {
        return '<div class="taxi-addr"><span>' + esc(a.navn) + '</span><b>' + esc(a.adresse) + '</b></div>';
      }).join('') + (d.taxi.apper ? '<p style="color:var(--muted);font-size:.9rem">' + esc(d.taxi.apper) + '</p>' : '') + '</div>';
    } else { $('taxi').hidden = true; }
    if (d.gutta) {
      $('gutta-liste').innerHTML = d.gutta.map(function (g) {
        return '<div class="gutt"><div class="gutt-head"><span class="gutt-navn">' + esc(g.person) + '</span><span class="gutt-rolle">' + esc(g.rolle) + '</span></div>' +
          (g.ingress ? '<p class="lead">' + esc(g.ingress) + '</p>' : '') +
          '<div class="grid">' + (g.steder || []).map(kort).join('') + '</div></div>';
      }).join('');
    } else { $('gutta').hidden = true; }
    var maKort = function (x) {
      return '<article class="card ma"><span class="kind">' + esc(x.type || '') + '</span><h3>' + esc(x.navn) + '</h3><p>' + esc(x.tekst) + '</p>' +
        (x.hvor ? '<div class="order"><b>Hvor:</b> ' + esc(x.hvor) + '</div>' : '') + '</article>';
    };
    $('ma-spise').innerHTML = (d.ma_spise || []).map(maKort).join('');
    $('ma-drikke').innerHTML = (d.ma_drikke || []).map(maKort).join('');
    if (d.lokal) {
      $('lokal').innerHTML = '<h3 class="ma-tittel">Drikk som en lokal</h3><p class="lead">' + esc(d.lokal.ingress || '') + '</p>' +
        '<div class="card lokal-liste">' + (d.lokal.regler || []).map(function (r) {
          return '<div class="lokal-rad"><i>' + esc(r.fransk) + '</i><span>' + esc(r.betyr) + '</span></div>';
        }).join('') + (d.lokal.tips ? '<p class="lokal-tips"><b>Viktigst:</b> ' + esc(d.lokal.tips) + '</p>' : '') + '</div>';
    }
    if (d.gems) {
      $('gems-ingress').textContent = d.gems.ingress || '';
      $('gems-liste').innerHTML = (d.gems.steder || []).map(kort).join('');
    } else { $('gems').hidden = true; }
    $('moro-liste').innerHTML = (d.moro || []).map(function (m) {
      return '<article class="card idea"><h3>' + esc(m.tittel) + '</h3><p>' + esc(m.tekst) + '</p>' +
        '<div class="mapbtns">' + (m.sted ? '<a class="tl-map" href="' + dir(finn(m.sted)) + '" target="_blank" rel="noopener">' + navIkon + 'Veibeskrivelse</a>' : '') +
        (trygg(m.nettside) ? '<a class="tl-map" href="' + esc(m.nettside) + '" target="_blank" rel="noopener">' + webIkon + 'Nettside</a>' : '') + '</div></article>';
    }).join('');

    $('overnatting').innerHTML = (d.overnatting || []).map(function (o) {
      return '<article class="card"><span class="kind">' + esc(o['når']) + '</span><h3>' + esc(o.navn) + '</h3><p>' + esc(o.tekst) + '</p>' +
        '<ul>' + (o.punkter || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        knapper(o.sok || o.navn, o.nettside) + '</article>';
    }).join('');

    var farge = { mat: 'var(--gamay)', ol: 'var(--gold)', hjem: 'var(--saone)' };
    var pinKl = { mat: '', ol: ' beer', hjem: ' home' };
    var paKart = [].concat(d.overnatting || [], d.steder || []).filter(function (s) { return s.kart; });
    $('naler').innerHTML = paKart.map(function (s) {
      var k = s.kart;
      return '<a href="' + dir(s.sok || s.navn) + '" target="_blank"><circle cx="' + (+k.x) + '" cy="' + (+k.y) + '" r="12" fill="' + (farge[k.type] || farge.mat) + '"/>' +
        '<text x="' + (+k.x) + '" y="' + (+k.y + 4) + '" fill="var(--bg)">' + esc(k.nr) + '</text></a>';
    }).join('');
    $('tegnforklaring').innerHTML = paKart.map(function (s) {
      var k = s.kart;
      return '<li><span class="pin' + (pinKl[k.type] || '') + '">' + esc(k.nr) + '</span><div><a href="' + dir(s.sok || s.navn) + '" target="_blank" rel="noopener">' + esc(s.navn) + '</a><small>' + esc(s['når'] || '') + '</small></div></li>';
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

  fetch('innhold.yml?v=' + Date.now(), { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('Fant ikke innhold.yml'); return r.text(); })
    .then(function (txt) { render(jsyaml.load(txt)); })
    .catch(function (e) {
      document.querySelector('main').insertAdjacentHTML('afterbegin',
        '<div class="wrap" style="padding-block:24px"><div class="note"><span>⚠︎</span><p><b>Klarte ikke å lese innhold.yml:</b> ' + esc(e.message) +
        '. Sjekk at innrykk og kolon er riktige i siste endring.</p></div></div>');
    });
})();
