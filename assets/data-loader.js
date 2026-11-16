/* Loads invitation data: #data=<encoded JSON> overrides the demo sample. */
(function () {
  var SAMPLE = window.JFY_DATA || {};
  var ASSETS = { music_url: SAMPLE.music_url, music_credit: SAMPLE.music_credit, gallery: SAMPLE.gallery };
  function finalize(d) {
    Object.keys(ASSETS).forEach(function (k) { if (d[k] == null || d[k] === '' || (Array.isArray(d[k]) && !d[k].length)) d[k] = ASSETS[k]; });
    if (d.music_enabled === false) d.music_url = '';
    if (d.event_time && d.event_date && String(d.event_date).indexOf('T') < 0) d.event_date = d.event_date + 'T' + d.event_time;
    if (!Array.isArray(d.events)) d.events = SAMPLE.events || [];
    if (!Array.isArray(d.blessings)) d.blessings = SAMPLE.blessings || [];
    if (!Array.isArray(d.gallery) || !d.gallery.length) d.gallery = SAMPLE.gallery || [];
    (d.events || []).forEach(function (e, i) {
      if (!e.image) e.image = (SAMPLE.events && SAMPLE.events[i] && SAMPLE.events[i].image) || 'assets/img/ev_wedding.webp';
      if (!e.map_url && e.venue) e.map_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.venue + ' ' + (e.street || ''));
    });
    return d;
  }
  var m = /[#&]data=([^&]+)/.exec(location.hash);
  window.JFY_READY = (m && window.JFYCodec ? JFYCodec.decode(m[1]).then(function (d) { window.JFY_DATA = finalize(Object.assign({}, SAMPLE, d)); }) : Promise.resolve())
    .catch(function (e) { console.warn('Invitation data could not be read, showing the demo.', e); });
})();
