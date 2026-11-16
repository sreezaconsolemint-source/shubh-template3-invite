/* Golden Journey invitation editor — live preview + shareable #data= link. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SAMPLE = JSON.parse(JSON.stringify(window.JFY_DATA || {}));
  var TEXT = ['groom_name','bride_name','groom_parents','bride_parents','invite_kicker','invite_lead','blessing_line',
    'from_city','to_city','from_code','to_code','from_region','to_region','from_date_short','to_date_short',
    'story_title','story_p1','story_p2','story_p3','thanks_text','postcard_to1','postcard_to2','postcard_to3',
    'rsvp_title','rsvp_lead','rsvp_whatsapp','rsvp_deadline'];
  var form = $('#ed'), pvTimer = null, pvN = 0, DRAFT = 'jfy-shubh-draft';
  function split(dt) { var m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(dt || ''); return m ? [m[1], m[2] || ''] : ['', '']; }

  function load(d) {
    TEXT.forEach(function (k) { if (form[k]) form[k].value = d[k] || ''; });
    var dt = split(d.event_date); if (form.event_date) form.event_date.value = dt[0]; if (form.event_time) form.event_time.value = d.event_time || dt[1];
    form.music_enabled.checked = d.music_enabled !== false;
    $('#evList').innerHTML = ''; (d.events || []).forEach(addEv); renumber();
    $('#blList').innerHTML = ''; (d.blessings || []).forEach(addBl); renumberBl();
  }
  function addEv(e) {
    e = e || {};
    var node = $('#evTpl').content.firstElementChild.cloneNode(true), dt = split(e.date);
    $('[data-k=name]', node).value = e.name || '';
    $('[data-k=date]', node).value = dt[0]; $('[data-k=time]', node).value = e.time || dt[1];
    ['venue','street','country','map_url'].forEach(function (k) { var i=$('[data-k='+k+']', node); if (i) i.value = e[k] || ''; });
    $('.ev__del', node).onclick = function () { node.remove(); renumber(); schedule(); };
    $('#evList').appendChild(node); renumber(); return node;
  }
  function addBl(e) {
    e = e || {};
    var node = $('#blTpl').content.firstElementChild.cloneNode(true);
    $('[data-k=role]', node).value = e.role || ''; $('[data-k=names]', node).value = e.names || '';
    $('.ev__del', node).onclick = function () { node.remove(); renumberBl(); schedule(); };
    $('#blList').appendChild(node); renumberBl(); return node;
  }
  function renumber() { $$('#evList .ev').forEach(function (n, i) { $('.ev__no', n).textContent = 'Event ' + (i+1); }); }
  function renumberBl() { $$('#blList .bl').forEach(function (n, i) { $('.ev__no', n).textContent = 'Blessing ' + (i+1); }); }

  function collect() {
    var d = {};
    TEXT.forEach(function (k) { if (!form[k]) return; var v = (form[k].value || '').trim(); if (v) d[k] = v; });
    if (d.rsvp_whatsapp) d.rsvp_whatsapp = d.rsvp_whatsapp.replace(/\D/g,'');
    if (form.event_date.value) d.event_date = form.event_date.value + (form.event_time.value ? 'T'+form.event_time.value : '');
    if (!form.music_enabled.checked) d.music_enabled = false;
    d.events = $$('#evList .ev').map(function (n) {
      var g = function (k) { var el=$('[data-k='+k+']', n); return el ? (el.value||'').trim() : ''; };
      var e = { name: g('name') }; if (!e.name) return null;
      if (g('date')) e.date = g('date') + (g('time') ? 'T'+g('time') : '');
      ['venue','street','country','map_url'].forEach(function (k) { if (g(k)) e[k] = g(k); });
      return e;
    }).filter(Boolean);
    d.blessings = $$('#blList .bl').map(function (n) {
      var g = function (k) { var el=$('[data-k='+k+']', n); return el ? (el.value||'').trim() : ''; };
      var e = { role: g('role'), names: g('names') }; return (e.role || e.names) ? e : null;
    }).filter(Boolean);
    return d;
  }
  function schedule() { clearTimeout(pvTimer); pvTimer = setTimeout(preview, 650); }
  function preview() {
    var d = collect();
    try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (_) {}
    JFYCodec.encode(d).then(function (s) {
      var f = $('#pv'), y = 0; try { y = Math.round(f.contentWindow.scrollY || 0); } catch (_) {}
      f.src = 'index.html?skip=1&preview=1&music=0&y=' + y + '&r=' + (++pvN) + '#data=' + s;
    });
  }
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  $('#evAdd').onclick = function () { var n = addEv({}); $('input', n).focus(); schedule(); };
  $('#evPreset').onchange = function () { if (!this.value) return; addEv({ name: this.value, date: form.event_date.value }); this.value=''; schedule(); };
  $('#blAdd').onclick = function () { addBl({}); schedule(); };
  $('#resetBtn').onclick = function () { load(SAMPLE); preview(); };
  $('#clearBtn').onclick = function () { load({ events: [], blessings: [], music_enabled: true }); preview(); };

  function showErr(t) { var e = $('#err'); e.textContent = t; e.hidden = !t; }
  $('#createBtn').onclick = function () {
    var d = collect(), miss = [];
    [['groom_name',"Groom's first name"],['bride_name',"Bride's first name"],['event_date','Wedding date']].forEach(function (p) { if (!d[p[0]]) miss.push(p[1]); });
    if (miss.length) { showErr('Please fill: ' + miss.join(', ')); document.body.classList.remove('v-preview'); var first=form.querySelector(':invalid'); if (first) { var det=first.closest('details'); if (det) det.open=true; first.focus(); } return; }
    showErr('');
    JFYCodec.encode(d).then(function (s) {
      var u = new URL('index.html', location.href); u.search=''; u.hash='data='+s;
      var link = u.toString(), msg = 'You are invited to the wedding of ' + d.groom_name + ' & ' + d.bride_name + ' 💐\nOpen your invitation: ' + link;
      $('#shareUrl').value = link; $('#openLink').href = link;
      $('#waShare').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
      $('#lenNote').textContent = link.length > 6000 ? 'This link is long (' + Math.round(link.length/1000) + 'k characters).' : '';
      var ns = $('#nativeShare'); ns.hidden = !navigator.share; ns.onclick = function () { navigator.share({ title:'Wedding invitation', text: msg.split('\n')[0], url: link }).catch(function(){}); };
      $('#sheet').hidden = false;
    });
  };
  $('#copyBtn').onclick = function () {
    var i = $('#shareUrl'), b = this; i.select();
    var ok = function () { b.textContent = 'Copied ✓'; setTimeout(function(){ b.textContent='Copy'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(i.value).then(ok, function(){ document.execCommand('copy'); ok(); }); else { document.execCommand('copy'); ok(); }
  };
  $('#sheetX').onclick = function () { $('#sheet').hidden = true; };
  $$('.tab').forEach(function (t) { t.onclick = function () { $$('.tab').forEach(function (x) { x.classList.toggle('on', x===t); }); document.body.classList.toggle('v-preview', t.dataset.view==='preview'); window.scrollTo(0,0); }; });

  var m = /[#&]data=([^&]+)/.exec(location.hash), start = Promise.resolve(null);
  if (m) start = JFYCodec.decode(m[1]).catch(function () { return null; });
  start.then(function (d) {
    if (!d) { try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (_) { d = null; } }
    load(d || SAMPLE); preview();
  });
})();
