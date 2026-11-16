/* Golden Journey live invitation runtime (Just For You)
 * Tokens {{key}}  data-optional  data-fit
 * Hero: tap starts a 12s painted opening (names at 6.5s, skip after 1.5s).
 * Scratch, countdown, story carousel, journey plane, boarding-pass RSVP.
 */
(window.JFY_READY || Promise.resolve()).then(function () {
  'use strict';
  var D = Object.assign({}, window.JFY_DATA || {});
  var Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var CFG = { heroHoldMs: 12000, namesAtMs: 6500, skipAfterMs: 1500, preloaderMs: 1600, carInterval: 3500 };

  function pd(v) { var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2}))?/.exec(String(v || '')); if (!m) return null; return { y:+m[1], mo:+m[2]-1, d:+m[3], h: m[4]==null?null:+m[4], mi: m[5]==null?0:+m[5] }; }
  function dow(p) { return new Date(Date.UTC(p.y,p.mo,p.d)).getUTCDay(); }
  function ord(n) { var s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function fmtTime(p) { if (!p || p.h == null) return ''; var h=p.h%12||12; return h + (p.mi ? ':'+String(p.mi).padStart(2,'0') : '') + (p.h<12?' AM':' PM') + ' Onwards'; }
  var TOK = /\{\{\s*([\w.]+)\s*(?:\|\s*(\w+)\s*)?\}\}/g;
  function interp(str, ctx) { return String(str).replace(TOK, function (_, k) { var v = ctx[k]; return (v == null || typeof v === 'object') ? '' : String(v); }); }
  function empty(ctx, k) { var v = ctx[k]; return v == null || (Array.isArray(v) ? !v.length : String(v).trim() === ''); }
  function bind(root, ctx) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) if (n.nodeValue.indexOf('{{') > -1) list.push(n);
    list.forEach(function (t) { t.nodeValue = interp(t.nodeValue, ctx); });
    Array.prototype.forEach.call(root.querySelectorAll('*'), function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (a) { if (a.value.indexOf('{{') > -1) el.setAttribute(a.name, interp(a.value, ctx)); });
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-optional]'), function (el) {
      var ks = el.getAttribute('data-optional').split(',').map(function (s) { return s.trim(); });
      el.classList.toggle('is-empty', ks.every(function (k) { return empty(ctx, k); }));
    });
  }
  function fit(el) {
    var min = parseFloat(el.getAttribute('data-fit')) || 14;
    el.style.fontSize = ''; var fs = parseFloat(getComputedStyle(el).fontSize);
    var box = (el.parentElement ? el.parentElement.clientWidth : el.clientWidth) - 8, g = 40;
    while (el.scrollWidth > box && fs > min && g--) { fs -= 1; el.style.fontSize = fs + 'px'; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---- render dynamic bits ---- */
  function buildEvents() {
    var evs = (D.events || []).filter(function (e) { return e && e.name; });
    var box = $('#eventList');
    if (!evs.length) { $('#events').classList.add('is-empty'); return; }
    // Wedding card should sit after the journey (as in the reference)
    var pre = evs.filter(function (e) { return !/wedding/i.test(e.name) || /sangeet|cocktail|mehndi|mehendi|haldi/i.test(e.name); });
    var wed = evs.filter(function (e) { return /wedding/i.test(e.name) && !/sangeet|cocktail|mehndi|mehendi|haldi/i.test(e.name); });
    function card(e) {
      var p = pd(e.date);
      var date = p ? (ord(p.d) + ' ' + MON[p.mo] + ' ' + p.y).replace(/(\d+)(st|nd|rd|th)/, '$1<sup>$2</sup>') : '';
      var time = p ? (DAYS[dow(p)] + ' • ' + fmtTime(p)) : '';
      var map = e.map_url || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((e.venue||'')+' '+(e.street||'')));
      return '<article class="event">' +
        '<header><h3 class="event__name">' + esc(e.name) + '</h3>' +
        (date ? '<p class="event__date">' + date + '</p>' : '') +
        (time ? '<p class="event__time">' + time + '</p>' : '') + '</header>' +
        (e.image ? '<img class="event__art" src="' + esc(e.image) + '" alt="' + esc(e.name) + '">' : '') +
        '<footer class="event__venue"><p class="event__venue-label">Venue</p>' +
        (e.venue ? '<p class="event__venue-name">' + esc(e.venue) + '</p>' : '') +
        (e.street ? '<p class="event__street">' + esc(e.street) + '</p>' : '') +
        (e.country ? '<p class="event__country">' + esc(e.country) + '</p>' : '') +
        '<a class="map-link" href="' + esc(map) + '" target="_blank" rel="noopener">View on Maps</a></footer></article>';
    }
    box.innerHTML = pre.map(card).join('');
    // append wedding after journey by inserting journey then wedding into events section
    var j = $('#journey');
    wed.forEach(function (e) {
      var wrap = document.createElement('div'); wrap.innerHTML = card(e);
      j.parentNode.appendChild(wrap.firstElementChild);
    });
  }
  function buildBless() {
    var list = (D.blessings || []).filter(function (b) { return b && (b.names || b.role); });
    var box = $('#blessList');
    if (!list.length) { $('#blessings').classList.add('is-empty'); return; }
    box.innerHTML = list.map(function (b) {
      return '<div class="bless__row"><div class="bless__role">' + esc(b.role || '') + '</div><div class="bless__names">' + esc(b.names || '') + '</div></div>';
    }).join('');
  }
  function buildCarousel() {
    var g = (D.gallery || []).filter(Boolean), box = $('#carousel'), dots = $('#carDots');
    if (!g.length) { box.classList.add('is-empty'); return; }
    box.innerHTML = g.map(function (src, i) { return '<img ' + (i===0?'class="is-on"':'') + ' src="' + esc(src) + '" alt="">'; }).join('');
    dots.innerHTML = g.map(function (_, i) { return '<button type="button"' + (i===0?' class="is-on"':'') + ' aria-label="Photo ' + (i+1) + '"></button>'; }).join('');
    var i = 0, timer;
    function show(n) {
      i = (n + g.length) % g.length;
      $$('#carousel img').forEach(function (im, k) { im.classList.toggle('is-on', k===i); });
      $$('#carDots button').forEach(function (b, k) { b.classList.toggle('is-on', k===i); });
    }
    $$('#carDots button').forEach(function (b, k) { b.onclick = function () { show(k); restart(); }; });
    function restart() { clearInterval(timer); timer = setInterval(function () { show(i+1); }, CFG.carInterval); }
    restart();
  }

  /* countdown */
  function tick() {
    var p = pd(D.event_date); if (!p) return;
    var t = Date.UTC(p.y, p.mo, p.d, p.h == null ? 19 : p.h, p.mi) - 330 * 60000 - Date.now();
    if (t < 0) t = 0;
    var s = Math.floor(t/1000), pad = function (n) { return String(n).padStart(2,'0'); };
    $('#cdD').textContent = pad(Math.floor(s/86400));
    $('#cdH').textContent = pad(Math.floor(s%86400/3600));
    $('#cdM').textContent = pad(Math.floor(s%3600/60));
    $('#cdS').textContent = pad(s%60);
  }

  /* scratch heart */
  function initScratch() {
    var canvas = $('#scratch-foil'), dateEl = $('#scratch-date'), hint = $('#scratch-hint'), conf = $('#scratch-confetti');
    if (!canvas) return;
    var p = pd(D.event_date);
    if (p) dateEl.innerHTML = p.d + '<br>' + MON[p.mo] + '<br>' + p.y;
    var ctx = canvas.getContext('2d'), size = 0, cleared = false, down = false, last = null, cells = {}, nCells = 0;
    function paint() {
      var dpr = window.devicePixelRatio || 1;
      size = canvas.offsetWidth;
      canvas.width = size * dpr; canvas.height = size * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var g = ctx.createLinearGradient(0,0,size,size);
      g.addColorStop(0,'#d4af37'); g.addColorStop(.3,'#e6c27a'); g.addColorStop(.5,'#c9a227'); g.addColorStop(.7,'#fdf2a9'); g.addColorStop(1,'#aa771c');
      ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
      for (var i=0;i<size*size*0.04;i++) { ctx.fillStyle = Math.random()>0.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'; ctx.fillRect(Math.random()*size, Math.random()*size, 1, 1); }
    }
    function brush(x,y) {
      var r = size * 0.10, grd = ctx.createRadialGradient(x,y,0,x,y,r);
      grd.addColorStop(0,'rgba(0,0,0,1)'); grd.addColorStop(.4,'rgba(0,0,0,.8)'); grd.addColorStop(.8,'rgba(0,0,0,.2)'); grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    function at(e) {
      if (cleared) return;
      var r = canvas.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * size, y = (e.clientY - r.top) / r.height * size;
      var from = last || {x:x,y:y}, dist = Math.hypot(x-from.x,y-from.y), steps = Math.max(1, Math.ceil(dist/(size*0.02)));
      for (var i=0;i<=steps;i++) {
        var px = from.x+(x-from.x)*(i/steps), py = from.y+(y-from.y)*(i/steps);
        brush(px,py);
        var cx = Math.floor(px/size*10), cy = Math.floor(py/size*10);
        if (cx<1||cx>8||cy<1||cy>8) continue;
        var k = cx+','+cy; if (!cells[k]) { cells[k]=1; nCells++; }
      }
      last = {x:x,y:y};
      if (nCells/64*100 > 25) reveal();
    }
    function reveal() {
      if (cleared) return; cleared = true;
      canvas.classList.add('is-cleared'); hint.classList.add('is-done'); dateEl.classList.add('is-in');
      burst(conf);
    }
    canvas.addEventListener('pointerdown', function (e) { down=true; last=null; canvas.setPointerCapture(e.pointerId); at(e); });
    canvas.addEventListener('pointermove', function (e) { if (down) at(e); });
    ['pointerup','pointercancel','pointerleave'].forEach(function (t) { canvas.addEventListener(t, function(){ down=false; last=null; }); });
    canvas.addEventListener('touchmove', function (e) { if (!cleared) e.preventDefault(); }, {passive:false});
    paint();
    window.addEventListener('resize', function () { if (!cleared && canvas.offsetWidth !== size) paint(); });
  }
  function burst(box) {
    if (!box) return;
    var cols = ['#c9a227','#e8c978','#6e1f2f','#b38728','#fdf2a9','#fff'];
    for (var i=0;i<80;i++) {
      var s = document.createElement('i');
      s.style.cssText = 'position:absolute;left:50%;top:50%;width:8px;height:10px;border-radius:1px;background:'+cols[i%cols.length]+';transform:translate(-50%,-50%);pointer-events:none;';
      var ang = Math.random()*Math.PI*2, dist = 40+Math.random()*180;
      s.animate([{transform:'translate(-50%,-50%) rotate(0)',opacity:1},{transform:'translate(calc(-50% + '+Math.cos(ang)*dist+'px), calc(-50% + '+Math.sin(ang)*dist+'px)) rotate(200deg)',opacity:0}], {duration:900+Math.random()*700, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards'});
      box.appendChild(s); setTimeout(s.remove.bind(s), 1800);
    }
  }

  /* journey plane follows scroll */
  function onJourney() {
    var track = $('#journey-track'), plane = $('#journey-plane');
    if (!track) return;
    var r = track.getBoundingClientRect(), h = track.offsetHeight;
    plane.style.setProperty('--track', (h) + 'px');
    var mid = innerHeight * 0.55;
    var prog = Math.min(1, Math.max(0, (mid - r.top) / h));
    plane.style.setProperty('--progress', prog);
  }

  /* music */
  var audio = $('#music'), mBtn = $('#musicBtn'), musicOn = Q.get('music') !== '0' && D.music_enabled !== false;
  if (D.music_url) audio.src = D.music_url;
  function playMusic() {
    if (!musicOn || !audio.src) return;
    audio.volume = 0; var p = audio.play(); if (p && p.catch) p.catch(function(){});
    var s=audio.volume, t0=performance.now();
    (function f(t){ var k=Math.min(1,(t-t0)/1000); audio.volume=s+(0.8-s)*k; if(k<1) requestAnimationFrame(f); })(t0);
    mBtn.classList.add('is-on');
  }
  mBtn.onclick = function () {
    if (audio.paused) { musicOn = true; playMusic(); }
    else { audio.pause(); mBtn.classList.remove('is-on'); }
  };

  /* hero opening */
  var opened = false, named = false;
  function showNames() { if (named) return; named = true; $('#hero-names').classList.add('is-in'); }
  function unlock() {
    if (opened) return; opened = true;
    showNames();
    $('#hero-skip').hidden = true;
    $('#hero-scroll').classList.add('is-in');
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    mBtn.classList.add('is-in');
  }
  function begin() {
    if ($('#hero-cover').classList.contains('is-open')) return;
    $('#hero-cover').classList.add('is-open');
    $('#hero').classList.add('is-playing');
    playMusic();
    setTimeout(function () { $('#hero').classList.add('is-late'); }, 4200);
    setTimeout(showNames, CFG.namesAtMs);
    setTimeout(unlock, CFG.heroHoldMs);
    setTimeout(function () { if (!opened) $('#hero-skip').hidden = false; }, CFG.skipAfterMs);
  }
  $('#hero-cover').addEventListener('click', begin);
  $('#hero-skip').addEventListener('click', function () { $('#hero-cover').classList.add('is-open'); $('#hero').classList.add('is-playing','is-late','is-instant'); unlock(); });

  /* rsvp */
  var guests = 1;
  $$('.choice').forEach(function (c) {
    c.onclick = function () {
      $$('.choice').forEach(function (x) { x.classList.remove('is-on'); });
      c.classList.add('is-on');
      $('#rsvpForm').attending.value = c.getAttribute('data-v');
      $('#qGuests').classList.toggle('is-empty', c.getAttribute('data-v')==='no');
    };
  });
  $('#gMinus').onclick = function () { guests = Math.max(1, guests-1); $('#gCount').textContent = guests; };
  $('#gPlus').onclick = function () { guests = Math.min(12, guests+1); $('#gCount').textContent = guests; };
  $('#rsvpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target, name = form.name.value.trim();
    if (!name) { $('#rErr').hidden = false; form.name.focus(); return; }
    $('#rErr').hidden = true;
    var yes = form.attending.value === 'yes';
    var couple = (D.groom_name||'') + ' & ' + (D.bride_name||'');
    var msg = yes
      ? 'Namaste! This is ' + name + '. Joyfully confirming ' + guests + ' guest' + (guests>1?'s':'') + ' for the wedding of ' + couple + '.'
      : 'Namaste! This is ' + name + '. With regret I cannot attend, but sending love to ' + couple + '.';
    if (form.note.value.trim()) msg += '\n\n“' + form.note.value.trim() + '”';
    try { localStorage.setItem('jfy-shubh-rsvp', JSON.stringify({name:name,attending:yes,guests:yes?guests:0,note:form.note.value.trim()})); } catch(_){}
    try { (window.parent!==window) && window.parent.postMessage({type:'jfy:rsvp',data:{name:name,attending:yes,guests:guests}}, '*'); } catch(_){}
    $('#thanksMsg').textContent = yes
      ? 'Passenger ' + name + ' — ' + guests + ' guest' + (guests>1?'s':'') + ' confirmed. We cannot wait to celebrate with you.'
      : 'Dear ' + name + ', we will miss you. Thank you for your blessings.';
    var wa = String(D.rsvp_whatsapp||'').replace(/\D/g,'');
    var b = $('#waBtn');
    if (wa) { b.href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg); b.hidden=false; b.style.display='inline-block'; } else b.hidden=true;
    form.hidden = true; $('#thanks').classList.add('is-on');
  });
  $('#editRsvp').onclick = function () { $('#thanks').classList.remove('is-on'); $('#rsvpForm').hidden = false; };

  function render() {
    document.title = interp(document.title, D);
    bind(document.body, D);
    var p = pd(D.event_date);
    if (p) $('#postDate').textContent = String(p.d).padStart(2,'0') + ' · ' + String(p.mo+1).padStart(2,'0') + ' · ' + String(p.y).slice(2);
    buildEvents(); buildBless(); buildCarousel();
    $$('[data-fit]').forEach(fit);
  }

  function boot() {
    render(); tick(); setInterval(tick, 1000); initScratch();
    window.addEventListener('scroll', onJourney, {passive:true});
    window.addEventListener('resize', function () { $$('[data-fit]').forEach(fit); onJourney(); });
    setTimeout(function () { $('#preloader').classList.add('is-done'); }, CFG.preloaderMs);
    if (Q.get('music') === '0') { musicOn = false; }
    if (Q.get('skip') === '1') {
      $('#preloader').classList.add('is-done');
      $('#hero-cover').classList.add('is-open');
      $('#hero').classList.add('is-playing','is-late','is-instant');
      unlock();
    }
    if (Q.get('preview') === '1') {
      var sy = +Q.get('y') || 0;
      if (sy) setTimeout(function () { window.scrollTo(0, sy); }, 400);
    }
  }
  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.type === 'jfy:data' && m.data && window.JFYCodec) {
      JFYCodec.encode(m.data).then(function (s) { location.hash = 'data=' + s; location.reload(); });
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
});
