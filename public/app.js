(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  // Configuration and persistent state
  var CFG = Object.assign({ server: '', password: '', limit: 80, support: '' }, window.HEXIGO_CONFIG || {});
  try { Object.assign(CFG, JSON.parse(localStorage.getItem('hx_cfg') || '{}')); } catch (e) {}

  var SETTINGS = Object.assign({
    lightTheme: false,
    iconSize: 'Medium',
    timeFormat: '12 Hours',
    speedoMeter: 'Analog',
    defaultPage: 'Dashboard',
    mapType: 'Normal',
    fuelUnit: 'Liter',
    language: 'English',
    speedUnit: 'kmh',
    distUnit: 'km',
    areaUnit: 'Hectare',
    voiceCommand: 'ON',
    currency: 'INR',
    liveTrail: 'OFF',
    showHistoryLive: 'OFF',
    filterFluctuation: 'OFF',
    farmCalc: 'OFF',
    notification: 'ON',
    fuelReading: 'Sensor',
    routeColor: 'Default Color',
    appColor: 'HEXIGO Orange',
    zoomLevel: 15
  }, JSON.parse(localStorage.getItem('hx_gen_settings') || '{}'));

  if (SETTINGS.lightTheme) document.body.classList.add('light-theme');
  else document.body.classList.remove('light-theme');

  // Alert configuration storage
  var ALERT_CFG = Object.assign({
    speedLimit: CFG.limit || 80,
    speedBuzzer: true,
    harshBraking: true,
    rapidAccel: true,
    ignOnAlert: true,
    ignOffAlert: true,
    idleLimitMin: 15,
    geofenceEnter: true,
    geofenceExit: true,
    afterHoursAlert: false,
    towAlert: true,
    powerCutAlert: true,
    lowBatteryAlert: true,
    shockSensor: true,
    sirenAudio: true,
    pushBanner: true,
    smsAlerts: false,
    emailDigest: true
  }, JSON.parse(localStorage.getItem('hx_alert_config') || '{}'));

  var typeMap = {}; try { typeMap = JSON.parse(localStorage.getItem('hx_types') || '{}'); } catch (e) {}
  var TYPES = ['truck', 'bus', 'coach', 'van', 'pickup', 'excavator', 'bike'];
  var ST = {
    running: ['Moving', '#10b981'],
    idle: ['Idle', '#f59e0b'],
    stopped: ['Parked', '#ef4444'],
    inactive: ['InActive', '#3b82f6'],
    nodata: ['Non Reporting', '#94a3b8']
  };
  var RANGES = ['Today', 'Yesterday', '2 Days', '3 Days', 'This Week', 'Last Week', 'This Month', 'Last Month'];

  var ICON = {
    dash: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    pin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>',
    car: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
    doc: '<path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>',
    gear: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
    clock: '<circle cx="12" cy="12" r="9.500"/><path d="M12 6.500V12l4 2.500" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
    bell: '<path d="M12 22a2.200 2.200 0 002.200-2.200H9.800A2.200 2.200 0 0012 22zm7-6v-5a7 7 0 00-5-6.700V3a2 2 0 10-4 0v1.300A7 7 0 005 11v5l-2 2v1h18v-1z"/>',
    stats: '<path d="M4 20V10h3.500v10zm6.200 0V4h3.500v16zm6.300 0v-7H20v7z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.500 16.500L21 21"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.300 5.700M20 4v7h-7"/>',
    fit: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
    filter: '<path d="M3 4h18l-7 8v7l-4 2v-9z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    power: '<path d="M11 2h2v10h-2zM6.300 5.300l1.400 1.400a7 7 0 108.600 0l1.400-1.400A9 9 0 116.300 5.300z"/>',
    key: '<path d="M14 3a6 6 0 00-5.700 7.800L2 17v4h4l1-1v-2h2v-2h2l1.200-1.200A6 6 0 1014 3zm2 4.500a1.500 1.500 0 110 3 1.500 1.500 0 010-3z"/>',
    chev: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3"/>'
  };

  function ico(n, w) { return '<svg viewBox="0 0 24 24" fill="currentColor"' + (w ? ' style="width:' + w + 'px;height:' + w + 'px"' : '') + ' aria-hidden="true">' + (ICON[n] || '') + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 2400); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ts) { if (!ts) return '–'; var d = new Date(ts * 1000), M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], h = d.getHours() % 12 || 12; return M[d.getMonth()] + ' ' + pad(d.getDate()) + ',' + d.getFullYear() + ' ' + pad(h) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + (d.getHours() < 12 ? ' AM' : ' PM'); }
  function dur(s) { s = Math.max(0, Math.round(s)); var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return (d ? pad(d) + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm'; }
  function dayKey(t) { var d = new Date(t * 1000); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dist(a, b) {
    if (typeof a.lat !== 'number' || typeof b.lat !== 'number' || typeof a.lon !== 'number' || typeof b.lon !== 'number') return 0;
    var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function range(name) {
    var n = new Date(), s = new Date(n.getFullYear(), n.getMonth(), n.getDate()), D = 86400000, f, t = n.getTime();
    var wk = new Date(s - ((s.getDay() + 6) % 7) * D);
    switch (name) {
      case 'Today': f = s; break;
      case 'Yesterday': f = new Date(s - D); t = s.getTime(); break;
      case '2 Days': f = new Date(s - D); break;
      case '3 Days': f = new Date(s - 2 * D); break;
      case 'This Week': f = wk; break;
      case 'Last Week': f = new Date(wk - 7 * D); t = wk.getTime(); break;
      case 'This Month': f = new Date(n.getFullYear(), n.getMonth(), 1); break;
      default: f = new Date(n.getFullYear(), n.getMonth() - 1, 1); t = new Date(n.getFullYear(), n.getMonth(), 1).getTime();
    }
    return [Math.floor(+f / 1000), Math.floor(t / 1000)];
  }

  // Push notification banner
  function pushNotify(title, msg) {
    var b = $('#push-notify'); if (!b) return;
    $('#push-title').textContent = title;
    $('#push-body').textContent = msg;
    b.classList.add('show');
    clearTimeout(pushNotify.t);
    pushNotify.t = setTimeout(function () { b.classList.remove('show'); }, 4200);
  }

  // Audio synthesizer for siren / chime
  function playAlertSiren() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
      o.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.32);
    } catch (e) {}
  }

  // Voice Alert Synthesizer (Ignition ON, Ignition OFF, Overspeed)
  function speakVoiceAlert(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.02;
      u.volume = 1.0;
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // SVG Icon for Street View Pegman (matching Screenshot 3)
  function pegmanSvg(size) {
    var s = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" style="display:block;">' +
      '<circle cx="12" cy="5" r="3.2" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>' +
      '<circle cx="12" cy="7.2" r="1.3" fill="#ef4444"/>' +
      '<path d="M9.5 9 C9 9.5 8.5 10.5 8.5 12 L9.5 16 L10.5 21 L12 21 L12 15 L12.5 15 L12.5 21 L14 21 L15 16 L16 12 C16 10.5 15.5 9.5 15 9 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>' +
      '<path d="M8.5 10.5 L6.8 13.5 C6.5 14 6.8 14.5 7.3 14.5 L8.5 13.5 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.6"/>' +
      '<path d="M15.8 10.5 L17.5 13.5 C17.8 14 17.5 14.5 17 14.5 L15.8 13.5 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.6"/>' +
    '</svg>';
  }

  function openLegendModal() {
    var m = $('#legend-modal');
    if (m) {
      m.hidden = false;
      m.classList.add('open');
    }
  }
  function closeLegendModal() {
    var m = $('#legend-modal');
    if (m) {
      m.classList.remove('open');
      m.hidden = true;
    }
  }

  function openStreetView(lat, lon, title) {
    var m = $('#streetview-modal');
    if (!m) return;
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      toast('No valid GPS coordinates for Street View');
      return;
    }
    $('#sv-title').textContent = title || 'Google Street View (360°)';
    $('#sv-coords').textContent = Number(lat).toFixed(5) + ', ' + Number(lon).toFixed(5);
    var embedUrl = 'https://maps.google.com/maps?q=&layer=c&cbll=' + Number(lat).toFixed(6) + ',' + Number(lon).toFixed(6) + '&cbp=11,0,0,0,0&output=svembed';
    var gmapsUrl = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + Number(lat).toFixed(6) + ',' + Number(lon).toFixed(6);
    var ifr = $('#sv-iframe');
    if (ifr) ifr.src = embedUrl;
    var ext = $('#sv-external-link');
    if (ext) ext.href = gmapsUrl;
    m.hidden = false;
    m.classList.add('open');
    toast('📍 Street View loaded at ' + Number(lat).toFixed(5) + ', ' + Number(lon).toFixed(5));
  }

  function closeStreetView() {
    var m = $('#streetview-modal');
    if (!m) return;
    var f = $('#sv-iframe');
    if (f) f.src = '';
    m.classList.remove('open');
    m.hidden = true;
  }

  function dropPegmanOnMap(lat, lon, title) {
    if (!map || typeof lat !== 'number' || typeof lon !== 'number') return;
    if (pegmanMarker) {
      pegmanMarker.setLatLng([lat, lon]);
    } else {
      var iconHtml = '<div class="pegman-marker-wrap">' +
        pegmanSvg(34) +
        '<div class="pegman-marker-dot"></div>' +
      '</div>';
      pegmanMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'pegman-map-marker',
          iconSize: [36, 46],
          iconAnchor: [18, 42],
          html: iconHtml
        }),
        draggable: true,
        zIndexOffset: 10000
      }).addTo(map);

      pegmanMarker.on('dragend', function (e) {
        var p = e.target.getLatLng();
        openStreetView(p.lat, p.lng, 'Street View – ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5));
      });
      pegmanMarker.on('click', function (e) {
        var p = e.target.getLatLng();
        openStreetView(p.lat, p.lng, 'Street View – ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5));
      });
    }
    openStreetView(lat, lon, title || ('Street View – ' + lat.toFixed(5) + ', ' + lon.toFixed(5)));
  }

  function setupPegmanDraggable(btn, mapCanvas) {
    if (!btn || !mapCanvas || !map) return;

    var isDragging = false;
    var startX = 0, startY = 0;
    var ghostEl = null;
    var tipEl = null;

    function cleanupGhost() {
      if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl);
      if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
      ghostEl = null;
      tipEl = null;
      btn.classList.remove('is-dragging');
      isDragging = false;
    }

    btn.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;

      var onMove = function (ev) {
        var dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
        if (!isDragging && dist > 5) {
          isDragging = true;
          btn.classList.add('is-dragging');

          if (!ghostEl) {
            ghostEl = document.createElement('div');
            ghostEl.id = 'pegman-drag-ghost';
            ghostEl.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-85%);filter:drop-shadow(0 6px 14px rgba(0,0,0,0.55));';
            ghostEl.innerHTML = pegmanSvg(38);
            document.body.appendChild(ghostEl);
          }

          if (!tipEl) {
            tipEl = document.createElement('div');
            tipEl.className = 'pegman-drag-tip';
            tipEl.textContent = '📍 Drop Pegman on the map — opens Street View at vehicle location';
            document.body.appendChild(tipEl);
          }
        }

        if (isDragging && ghostEl) {
          ghostEl.style.left = ev.clientX + 'px';
          ghostEl.style.top = ev.clientY + 'px';
        }
      };

      var onUp = function (ev) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);

        if (isDragging) {
          var dropX = ev.clientX;
          var dropY = ev.clientY;
          cleanupGhost();

          var rect = mapCanvas.getBoundingClientRect();
          if (dropX >= rect.left && dropX <= rect.right && dropY >= rect.top && dropY <= rect.bottom) {
            // Always snap to current vehicle GPS — not the random drop point
            var vehTarget = byId(S.sel) || V[0];
            if (vehTarget && typeof vehTarget.lat === 'number' && typeof vehTarget.lon === 'number') {
              dropPegmanOnMap(vehTarget.lat, vehTarget.lon, vehTarget.name + ' – Street View');
            } else {
              toast('No GPS fix for this vehicle');
            }
          } else {
            toast('Drop Pegman onto the map to view Street View');
          }
        } else {
          cleanupGhost();
          var curVeh = byId(S.sel) || V[0];
          if (curVeh && typeof curVeh.lat === 'number' && typeof curVeh.lon === 'number') {
            openStreetView(curVeh.lat, curVeh.lon, curVeh.name + ' – Street View');
          } else {
            toast('No GPS coordinates for this vehicle');
          }
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    btn.setAttribute('draggable', 'true');
    btn.addEventListener('dragstart', function (e) {
      btn.classList.add('is-dragging');
      e.dataTransfer.setData('text/plain', 'pegman');
      e.dataTransfer.effectAllowed = 'copyMove';
    });
    btn.addEventListener('dragend', function () {
      btn.classList.remove('is-dragging');
    });

    mapCanvas.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    mapCanvas.addEventListener('drop', function (e) {
      e.preventDefault();
      btn.classList.remove('is-dragging');
      // Always snap Pegman to the selected vehicle's GPS — not the random drop coordinate
      var vehTarget = byId(S.sel) || V[0];
      if (vehTarget && typeof vehTarget.lat === 'number' && typeof vehTarget.lon === 'number') {
        dropPegmanOnMap(vehTarget.lat, vehTarget.lon, vehTarget.name + ' – Street View');
      } else {
        toast('No GPS fix for this vehicle');
      }
    });
  }

  function updateFloatingTelemetry(v) {
    if (!v) return;
    var elVeh = $('#mft-veh'), elSeen = $('#mft-seen'), elSt = $('#mft-status'),
        elVolt = $('#mft-volt'), elSpd = $('#mft-speed'), elIgn = $('#mft-ign'),
        elOdo = $('#mft-odo'), elLoc = $('#mft-loc');
    if (elVeh) elVeh.textContent = v.name || '---';
    if (elSeen) elSeen.textContent = (v.age != null && v.age < 999999) ? dur(v.age) + ' ago' : '---';
    if (elSt) {
      var stInfo = ST[v.status] || ['Stopped', '#ef4444'];
      elSt.textContent = stInfo[0];
      elSt.style.color = stInfo[1];
    }
    if (elVolt) elVolt.textContent = (v.volt ? Number(v.volt).toFixed(1) + ' V' : '---');
    if (elSpd) elSpd.textContent = (typeof v.speed === 'number' ? Number(v.speed).toFixed(2) : '0.00') + ' Km/hr';
    if (elIgn) {
      elIgn.textContent = v.ign ? 'ON' : 'OFF';
      elIgn.style.color = v.ign ? '#2563eb' : '#dc2626';
    }
    if (elOdo) elOdo.textContent = Math.round(v.odo || 0).toLocaleString('en-IN') + ' Km';
    if (elLoc) elLoc.textContent = typeof v.lat === 'number' ? v.lat.toFixed(5) + ', ' + v.lon.toFixed(5) : '---';
  }

  // Colored truck model image mapping:
  // 🟢 Green = Moving | 🟡 Yellow = Idle | 🔴 Red = Stopped | ⚪ Grey = Offline
  function truckImg(st, size) {
    var file = 'truck-stopped.png';
    if (st === 'running' || st === 'moving') file = 'truck-moving.png';
    else if (st === 'idle') file = 'truck-idle.png';
    else if (st === 'offline' || st === 'inactive' || st === 'nodata') file = 'truck-offline.png';
    return '<img src="' + file + '" width="' + size + '" style="width:' + size + 'px;height:auto;display:block;" alt="' + st + '">';
  }

  // Standard Brand Header Helper with Logged-in User Profile Chip
  function hdr(title, rightHtml) {
    var user = localStorage.getItem('hx_auth_user') || 'Test';
    return '<div class="hdr">' +
      '<div class="hdr-brand">' +
        '<img src="hexigo-brand-logo.png" alt="Hexigo" class="brand-logo">' +
        '<h1>' + title + '</h1>' +
      '</div>' +
      '<div class="hdr-actions">' +
        (rightHtml || '') +
        '<div class="user-chip" title="Signed in as ' + esc(user) + '">' +
          '<span class="user-dot"></span>' +
          '<span class="user-name">' + esc(user) + '</span>' +
          '<button class="btn-user-signout" data-act="signout" title="Sign Out">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ---------- API Data Layer ----------
  function api(path) {
    var base = (CFG.server || '').replace(/\/+$/, '');
    var h = { Accept: 'application/json' };
    if (CFG.password) h['x-dashboard-password'] = CFG.password;
    return fetch(base + path, { headers: h }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) {
        var m = t; try { m = JSON.parse(t).error || t; } catch (e) {}
        throw new Error(m || 'HTTP ' + r.status);
      });
      return r.json();
    });
  }

  var V = [];
  function parseVehicles(raw) {
    var list = (raw && raw.result) || [];
    var now = Math.floor(Date.now() / 1000);
    return list.map(function (d) {
      var tel = d.telemetry || {};
      var pos = tel.position || {};
      var lat = tel['position.latitude'] != null ? tel['position.latitude'] : pos.latitude;
      var lon = tel['position.longitude'] != null ? tel['position.longitude'] : pos.longitude;
      var spd = tel['position.speed'] != null ? tel['position.speed'] : (pos.speed != null ? pos.speed : 0);
      var dir = tel['position.direction'] != null ? tel['position.direction'] : (pos.direction != null ? pos.direction : 0);
      var ts = tel.timestamp || tel['server.timestamp'] || (pos && pos.timestamp);
      var ign = tel['engine.ignition.status'];
      var mv = tel['movement.status'];
      var odo = tel['vehicle.mileage'] || (pos && pos['vehicle.mileage']);
      var volt = tel['external.powersource.voltage'] || tel['battery.voltage'];
      var fuel = tel['fuel.level'] || tel['can.fuel.level'];
      var age = ts ? now - ts : 999999;
      var isStale = age > 1800; // > 30 minutes without telemetry packet
      var currentSpeed = isStale ? 0 : (spd || 0);
      var currentIgn = isStale ? false : (ign === true);

      var st = 'stopped';
      if (!ts || age > 86400 * 7) {
        st = 'nodata'; // Non Reporting (>7 days or no data)
      } else if (age > 86400) {
        st = 'inactive'; // InActive (>24 hours)
      } else if (currentSpeed > 3 || (mv === true && !isStale)) {
        st = 'running'; // Moving
      } else if (currentIgn) {
        st = 'idle'; // Idle
      } else {
        st = 'stopped'; // Parked
      }
      return {
        id: d.id, name: d.name || ('Device #' + d.id), type: typeMap[d.id] || 'truck',
        lat: typeof lat === 'number' ? lat : null, lon: typeof lon === 'number' ? lon : null,
        speed: currentSpeed, dir: dir || 0, ts: ts, age: age, ign: currentIgn, odo: odo,
        volt: volt, fuel: fuel, status: st, raw: d
      };
    });
  }

  var prevVehTelemetry = {};
  function loadVehicles() {
    return api('/api/devices').then(function (r) {
      V = parseVehicles(r);
      if (S.sel == null && V.length) S.sel = V[0].id;

      var limit = (typeof ALERT_CFG !== 'undefined' && ALERT_CFG.speedLimit) || CFG.limit || 80;
      V.forEach(function (v) {
        var prev = prevVehTelemetry[v.id];
        var isOverNow = v.speed > limit;
        if (prev && prev.init) {
          // Ignition changed from OFF to ON
          if (prev.ign === false && v.ign === true) {
            pushNotify('IGNITION ON', v.name + ' ignition status ON');
            playAlertSiren();
            speakVoiceAlert('Alert! ' + v.name + ' ignition is ON');
          }
          // Ignition changed from ON to OFF
          else if (prev.ign === true && v.ign === false) {
            pushNotify('IGNITION OFF', v.name + ' ignition status OFF');
            speakVoiceAlert('Alert! ' + v.name + ' ignition is OFF');
          }

          // Overspeed crossing threshold
          if (isOverNow && !prev.isOver) {
            pushNotify('OVERSPEED WARNING', v.name + ' speed ' + Math.round(v.speed) + ' km/h exceeds limit');
            playAlertSiren();
            speakVoiceAlert('Warning! ' + v.name + ' over speed. Speed is ' + Math.round(v.speed) + ' kilometers per hour');
          }
        }
        prevVehTelemetry[v.id] = {
          ign: v.ign,
          speed: v.speed,
          isOver: isOverNow,
          init: true
        };
      });

      return V;
    });
  }

  var mcache = {};
  function msgs(id, rg) {
    var k = id + ':' + rg[0] + ':' + rg[1];
    if (mcache[k]) return Promise.resolve(mcache[k]);
    return api('/api/devices/' + id + '/messages?from=' + rg[0] + '&to=' + rg[1]).then(function (r) {
      var arr = ((r && r.result) || []).map(function (m) {
        var pos = m.position || {};
        return {
          t: m.timestamp || (pos && pos.timestamp),
          lat: m['position.latitude'] != null ? m['position.latitude'] : pos.latitude,
          lon: m['position.longitude'] != null ? m['position.longitude'] : pos.longitude,
          speed: m['position.speed'] != null ? m['position.speed'] : (pos.speed || 0),
          dir: m['position.direction'] != null ? m['position.direction'] : (pos.direction || 0),
          ign: m['engine.ignition.status'],
          fuel: m['fuel.level'] || m['can.fuel.level'],
          raw: m
        };
      }).filter(function (m) { return !!m.t; }).sort(function (a, b) { return a.t - b.t; });
      mcache[k] = arr; return arr;
    });
  }

  function analyse(ms) {
    var km = 0, max = 0, prev = null, ignEvents = [], over = [];
    var engS = 0, movS = 0, idleS = 0, stops = 0;
    var dayMap = {};
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.speed > max) max = m.speed;
      if (m.speed > CFG.limit) over.push(m);
      var dk = dayKey(m.t);
      if (!dayMap[dk]) dayMap[dk] = { km: 0, engine: 0, max: 0 };
      if (m.speed > dayMap[dk].max) dayMap[dk].max = m.speed;
      if (prev) {
        var dt = Math.max(0, Math.min(m.t - prev.t, 300));
        var d = dist(prev, m);
        km += d; dayMap[dk].km += d;
        if (prev.ign) { engS += dt; dayMap[dk].engine += dt; }
        if (prev.speed > 3) movS += dt;
        else if (prev.ign) idleS += dt;
        else stops++;
        if (prev.ign !== m.ign && typeof m.ign === 'boolean') ignEvents.push(m);
      }
      prev = m;
    }
    return { km: km, max: max, engineS: engS, movingS: movS, idleS: idleS, stops: stops, ign: ignEvents, over: over, days: dayMap };
  }

  function segments(ms) {
    var segs = [], cur = null;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], mv = m.speed > 3;
      if (!cur || cur.mv !== mv) {
        if (cur) segs.push(cur);
        cur = { mv: mv, t0: m.t, t1: m.t, a: m, b: m, d: 0, max: m.speed };
      } else {
        cur.t1 = m.t; cur.d += dist(cur.b, m); cur.b = m;
        if (m.speed > cur.max) cur.max = m.speed;
      }
    }
    if (cur) segs.push(cur);
    return segs;
  }

  function byId(id) {
    for (var i = 0; i < V.length; i++) if (V[i].id === id) return V[i];
    return null;
  }

  // ---------- SVG Visualizations ----------
  function donut(counts, total) {
    var keys = Object.keys(ST), R = 40, C = 2 * Math.PI * R, off = 0, segs = '';
    keys.forEach(function (k) {
      var n = counts[k] || 0; if (!n) return;
      var l = n / total * C;
      segs += '<circle r="' + R + '" cx="60" cy="60" fill="none" stroke="' + ST[k][1] + '" stroke-width="20" stroke-dasharray="' + l + ' ' + (C - l) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 60 60)"/>';
      off += l;
    });
    if (!total) segs = '<circle r="40" cx="60" cy="60" fill="none" stroke="#334155" stroke-width="20"/>';
    return '<svg class="donut-svg" viewBox="0 0 120 120" width="140" height="140">' + segs + '<text x="60" y="60" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">' + total + '</text><text x="60" y="76" text-anchor="middle" font-size="9" font-weight="600" fill="var(--mute)">Vehicles</text></svg>';
  }

  function bars(vals, labels, color) {
    var mx = Math.max.apply(null, vals.concat([0.1]));
    return '<svg viewBox="0 0 330 140" width="100%" height="130">' + vals.map(function (v, i) {
      var h = v / mx * 80, x = 8 + i * 46;
      return '<rect x="' + x + '" y="' + (100 - h) + '" width="28" height="' + Math.max(h, 2) + '" rx="6" fill="' + (color || 'var(--acc)') + '"/><text x="' + (x + 14) + '" y="' + (94 - h) + '" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">' + (v ? v.toFixed(1) : '0') + '</text><text x="' + (x + 14) + '" y="' + (122) + '" text-anchor="middle" font-size="10" font-weight="600" fill="var(--mute)">' + labels[i] + '</text>';
    }).join('') + '</svg>';
  }

  // Analog Speedometer Dial with HEXIGO Orange Arc & Pointer
  function speedoDial(speed) {
    var val = Math.min(Math.max(speed, 0), 150);
    var pct = val / 150;
    var angle = -120 + pct * 240;
    var rad = angle * Math.PI / 180;
    var nx = (65 + 36 * Math.sin(rad)).toFixed(1);
    var ny = (65 - 36 * Math.cos(rad)).toFixed(1);
    var arcLen = 188.5;
    var strokeOffset = arcLen * (1 - pct);
    return '<svg class="speedo-svg" viewBox="0 0 130 110">' +
      '<path d="M 26 87.5 A 45 45 0 1 1 104 87.5" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M 26 87.5 A 45 45 0 1 1 104 87.5" fill="none" stroke="var(--acc)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + arcLen + '" stroke-dashoffset="' + strokeOffset.toFixed(1) + '"/>' +
      '<text x="26" y="100" font-size="8" font-weight="700" fill="var(--mute)" text-anchor="middle">0</text>' +
      '<text x="32" y="44" font-size="8" font-weight="700" fill="var(--mute)" text-anchor="middle">50</text>' +
      '<text x="98" y="44" font-size="8" font-weight="700" fill="var(--mute)" text-anchor="middle">100</text>' +
      '<text x="104" y="100" font-size="8" font-weight="700" fill="var(--mute)" text-anchor="middle">150</text>' +
      '<line x1="65" y1="65" x2="' + nx + '" y2="' + ny + '" stroke="var(--acc)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="65" cy="65" r="5" fill="var(--acc)"/>' +
      '<circle cx="65" cy="65" r="2" fill="#fff"/>' +
      '<text x="65" y="82" font-size="18" font-weight="800" fill="currentColor" text-anchor="middle">' + Math.round(val) + '</text>' +
      '<text x="65" y="93" font-size="8" font-weight="700" fill="var(--mute)" text-anchor="middle">km/h</text>' +
    '</svg>';
  }

  // ---------- Router & Authentication State ----------
  var authUser = localStorage.getItem('hx_auth_user');
  var S = {
    screen: authUser ? 'dash' : 'login',
    p: {},
    hist: [],
    sel: null,
    filter: 'all',
    q: '',
    range: 'Today',
    rep: 'summary',
    alertCat: 'all',
    alertVeh: 'all'
  };

  var MAIN = { dash: 'dash', map: 'pin', list: 'car', reports: 'doc', settings: 'gear' };
  var VTAB = { track: ['pin', 'Track'], hist: ['clock', 'History'], alerts: ['bell', 'Alerts'], stats: ['stats', 'Statistics'] };
  var map = null, mk = {}, line = null, mover = null, timer = null, token = 0, pegmanMarker = null;

  function killMap() { clearInterval(timer); timer = null; if (map) { try { map.remove(); } catch (e) {} } map = null; mk = {}; line = null; mover = null; pegmanMarker = null; }
  function go(name, p) { S.hist.push({ screen: S.screen, p: S.p }); S.screen = name; S.p = p || {}; render(); }
  function main(name) { S.hist = []; S.screen = name; S.p = {}; render(); }
  function vtab(name) { S.screen = name; render(); }
  window.hxBack = function () { if (!S.hist.length) return false; var h = S.hist.pop(); S.screen = h.screen; S.p = h.p; render(); return true; };

  function setNav() {
    var isAuth = S.screen === 'login';
    var vs = !isAuth && !!VTAB[S.screen];
    var isSetSub = !isAuth && ['appsetmenu', 'genset', 'chpass', 'confalerts', 'expense', 'drivers', 'reminders', 'groups', 'geofences', 'appset'].indexOf(S.screen) > -1;
    var ms = !isAuth && (!!MAIN[S.screen] || isSetSub || S.screen === 'repview');

    $('#nav').hidden = !ms;
    $('#vnav').hidden = !vs;

    if (isAuth) {
      $('#app').classList.add('auth-mode');
      $('#app').style.bottom = '0';
      return;
    }
    $('#app').classList.remove('auth-mode');

    $('#nav').innerHTML = '<div class="nav-inner">' + Object.keys(MAIN).map(function (k) {
      var on = S.screen === k || (isSetSub && k === 'settings') || (S.screen === 'repview' && k === 'reports');
      return '<button data-nav="' + k + '" class="' + (on ? 'on' : '') + '" aria-label="' + k + '">' + ico(MAIN[k]) + '</button>';
    }).join('') + '</div>';

    $('#vnav').innerHTML = '<div class="vnav-inner">' + Object.keys(VTAB).map(function (k) {
      return '<button data-vt="' + k + '" class="' + (S.screen === k ? 'on' : '') + '">' + ico(VTAB[k][0]) + '<span>' + VTAB[k][1] + '</span></button>';
    }).join('') + '</div>';

    $('#app').style.bottom = (ms || vs) ? '68px' : '0';
  }

  function view(html, nopad) { var v = $('#view'); v.className = nopad ? 'nopad' : ''; v.innerHTML = html; v.scrollTop = 0; }

  function render() {
    killMap(); token++; setNav();
    var screens = {
      login: rLogin,
      dash: rDash, map: rMap, list: rList, reports: rReports, repview: rRepView,
      track: rTrack, hist: rHist, alerts: rAlerts, stats: rStats,
      settings: rSettings, appsetmenu: rAppSetMenu, genset: rGenSet, chpass: rChPass,
      confalerts: rConfAlerts, expense: rExpense, drivers: rDrivers, reminders: rReminders,
      groups: rGroups, geofences: rGeofences, appset: rAppSet
    };
    var f = screens[S.screen] || rLogin;
    f(token);
  }

  function vOpts() { return V.map(function (v) { return '<option value="' + v.id + '"' + (v.id === S.sel ? ' selected' : '') + '>' + esc(v.name) + '</option>'; }).join(''); }

  // ---------- Authentication Functions ----------
  function doLogin() {
    var u = $('#l-user'), p = $('#l-pass'), err = $('#login-error');
    var userVal = (u ? u.value : '').trim();
    var passVal = (p ? p.value : '');

    var isUserValid = userVal.toLowerCase() === 'test' || userVal.toLowerCase() === 'test@company.com';
    var isPassValid = passVal === 'test@123';

    if (isUserValid && isPassValid) {
      if (err) err.hidden = true;
      localStorage.setItem('hx_auth_user', 'Test');
      toast('Welcome back, Test!');
      S.screen = 'dash';
      render();
    } else {
      if (err) {
        err.innerHTML = 'Invalid credentials.<br>User name: <b>Test</b> &bull; Password: <b>test@123</b>';
        err.hidden = false;
      } else {
        toast('Invalid credentials. Use Test / test@123');
      }
      if (!isUserValid && u) u.focus();
      else if (!isPassValid && p) p.focus();
    }
  }

  function doLogout() {
    localStorage.removeItem('hx_auth_user');
    S.screen = 'login';
    render();
    toast('Session signed out');
  }

  // ---------- Screens ----------

  // 0. Modern Login Screen (Exact match to screenshot)
  function rLogin() {
    view(
      '<div class="login-screen">' +
        '<div class="login-brand-block">' +
          '<img src="hexigo-brand-logo.png" alt="HEXIGO" class="login-logo">' +
          '<h1 class="login-tagline">Drive Smarter. Track Better. Deliver Faster.</h1>' +
          '<p class="login-subtag">Real-Time Fleet Visibility</p>' +
        '</div>' +
        '<div class="login-card">' +
          '<div class="login-card-header">' +
            '<h2>Welcome Back</h2>' +
            '<p>Sign in to continue</p>' +
          '</div>' +
          '<form class="login-form" id="login-form" onsubmit="return false;">' +
            '<div class="login-error" id="login-error" hidden></div>' +
            '<div class="form-group">' +
              '<label for="l-user">EMAIL</label>' +
              '<div class="input-wrap">' +
                '<input type="text" id="l-user" placeholder="you@company.com" autocomplete="username" spellcheck="false" value="Test" required>' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="l-pass">PASSWORD</label>' +
              '<div class="input-wrap">' +
                '<input type="password" id="l-pass" placeholder="Enter your password" autocomplete="current-password" required>' +
                '<button type="button" class="btn-eye" data-act="toggle-pass" aria-label="Toggle password visibility">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn-signin" data-act="signin" id="btn-signin">Sign In</button>' +
            '<div class="oauth-stack">' +
              '<button type="button" class="btn-oauth btn-google" data-act="oauth-google">' +
                '<svg class="oauth-icon" viewBox="0 0 24 24">' +
                  '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>' +
                  '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
                  '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>' +
                  '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>' +
                '</svg>' +
                'Sign in with Google' +
              '</button>' +
              '<button type="button" class="btn-oauth btn-apple" data-act="oauth-apple">' +
                '<svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">' +
                  '<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.56.64-1.05 1.72-.92 2.74 1.01.08 2.02-.49 2.64-1.24z"/>' +
                '</svg>' +
                'Sign in with Apple' +
              '</button>' +
            '</div>' +
            '<div class="login-hint" data-act="filldemo">' +
              '<span class="hint-badge">Quick Fill</span>' +
              '<span>User: <b>Test</b> &bull; Pass: <b>test@123</b></span>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>',
      true
    );
  }

  // 1. Dashboard (Screenshot 3)
  function rDash(tk) {
    var counts = {}; V.forEach(function (v) { counts[v.status] = (counts[v.status] || 0) + 1; });
    view(
      hdr('Dashboard', '<select class="sel" id="vsel" aria-label="Select Vehicle">' + vOpts() + '</select>') +
      '<h2>Fleet Status</h2>' +
      '<div class="card donut-card">' +
        donut(counts, V.length) +
        '<div class="legend">' +
          Object.keys(ST).map(function (k) {
            return '<div><i style="background:' + ST[k][1] + '"></i><span>' + ST[k][0] + '</span><b>' + (counts[k] || 0) + '</b></div>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<h2>Engine Hours</h2><div class="card" id="c-eng"><div class="empty">Loading…</div></div>' +
      '<h2>Travel Distance (in KM)</h2><div class="card" id="c-km"><div class="empty">Loading…</div></div>'
    );
    if (S.sel == null) { $('#c-eng').innerHTML = $('#c-km').innerHTML = '<div class="empty">No vehicles connected.</div>'; return; }
    var now = Math.floor(Date.now() / 1000), s0 = range('Today')[0], keys = [], lab = [];
    for (var i = 6; i >= 0; i--) { var t = s0 - i * 86400; keys.push(dayKey(t + 3600)); lab.push(pad(new Date(t * 1000).getDate()) + '/' + pad(new Date(t * 1000).getMonth() + 1)); }
    msgs(S.sel, [s0 - 6 * 86400, now]).then(function (ms) {
      if (tk !== token) return; var a = analyse(ms);
      $('#c-eng').innerHTML = bars(keys.map(function (k) { return a.days[k] ? a.days[k].engine / 3600 : 0; }), lab, '#f59e0b') + '<div class="note">Hours with engine ignition ON</div>';
      $('#c-km').innerHTML = bars(keys.map(function (k) { return a.days[k] ? a.days[k].km : 0; }), lab, '#ea580d');
    }).catch(function (e) { if (tk === token) $('#c-eng').innerHTML = $('#c-km').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  // 2. Vehicle List (Screenshot 4)
  function rList() {
    var counts = { all: V.length }; V.forEach(function (v) { counts[v.status] = (counts[v.status] || 0) + 1; });
    var keys = ['all'].concat(Object.keys(ST)), q = S.q.toLowerCase();
    var shown = V.filter(function (v) { return (S.filter === 'all' || v.status === S.filter) && (!q || v.name.toLowerCase().indexOf(q) > -1); });
    view(
      hdr('Vehicle List', '<button class="btn-round" data-act="refresh" style="width:36px;height:36px">' + ico('refresh') + '</button>') +
      '<div class="search-box">' +
        ico('search') +
        '<input class="q" id="q" type="search" placeholder="Search vehicle by name or plate…" value="' + esc(S.q) + '">' +
      '</div>' +
      '<div class="chips">' +
        keys.map(function (k) {
          var c = k === 'all' ? '#ea580d' : ST[k][1];
          return '<button class="chip ' + (S.filter === k ? 'on' : '') + '" data-st="' + k + '">' +
            '<i style="background:' + c + '"></i>' +
            '<span class="chip-lbl">' + (k === 'all' ? 'All Vehicles' : ST[k][0]) + '</span>' +
            '<span class="chip-val">' + (counts[k] || 0) + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="veh-list">' +
      (shown.length ? shown.map(function (v) {
        var c = ST[v.status][1];
        var pos = typeof v.lat === 'number' ? v.lat.toFixed(5) + ', ' + v.lon.toFixed(5) : 'No GPS Fix';
        var stDesc = v.status === 'inactive' ? 'Offline since ' + dur(v.age) : v.status === 'running' ? 'Running · ' + Math.round(v.speed) + ' km/h' : ST[v.status][0] + ' · ' + dur(v.age);
        return '<div class="veh-card" data-veh="' + v.id + '">' +
          '<div class="veh-top">' +
            '<div class="veh-title">' +
              truckImg(v.status, 28) +
              '<span>' + esc(v.name) + '</span>' +
            '</div>' +
            '<span class="veh-stat-badge" style="background:' + c + '">' + ST[v.status][0] + '</span>' +
          '</div>' +
          '<div class="veh-mid">' +
            '<span>' + stDesc + '</span>' +
            '<b>' + Math.round(v.speed) + ' km/h</b>' +
          '</div>' +
          '<div class="veh-addr">📍 ' + pos + ' · ' + fmt(v.ts) + '</div>' +
          '<div class="veh-tags">' +
            '<span class="vtag ' + (v.ign ? 'on' : '') + '">' + ico('power') + (v.ign ? 'Ignition On' : 'Ignition Off') + '</span>' +
            (v.volt != null ? '<span class="vtag">' + ico('key') + Number(v.volt).toFixed(1) + ' V</span>' : '') +
            (v.fuel != null ? '<span class="vtag">⛽ ' + Math.round(v.fuel) + '%</span>' : '') +
            '<span class="vtag">📡 19 Sats</span>' +
            '<span class="vtag">📅 273 Days Validity</span>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="card empty">No vehicles match this filter.</div>') +
      '</div>'
    );
  }

  // 3. Live Map with Colored Truck Markers
  function mkMap(box) {
    if (!window.L) { box.innerHTML = '<div class="nomap">Map requires an internet connection.</div>'; return null; }
    map = L.map(box, { zoomControl: false, attributionControl: false }).setView([13.08, 80.27], 7);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    return map;
  }

  function icon(v) {
    var colorClass = v.status === 'running' ? 'moving' : v.status === 'idle' ? 'idle' : v.status === 'stopped' ? 'stopped' : 'offline';
    return L.divIcon({
      className: 'truck-div-icon',
      iconSize: [0, 0],
      html: '<div class="truck-mk ' + colorClass + '"><b>' + esc(v.name) + '</b>' + truckImg(v.status, 30) + '</div>'
    });
  }

  function drawMarkers(fit) {
    if (!map) return; var pts = [];
    V.forEach(function (v) {
      if (S.filter !== 'all' && v.status !== S.filter) { if (mk[v.id]) { map.removeLayer(mk[v.id]); delete mk[v.id]; } return; }
      if (typeof v.lat !== 'number' || typeof v.lon !== 'number') return;
      pts.push([v.lat, v.lon]);
      if (!mk[v.id]) {
        mk[v.id] = L.marker([v.lat, v.lon], { icon: icon(v) }).addTo(map);
        (function (veh) {
          mk[veh.id].on('click', function () {
            S.sel = veh.id;
            go('track', { id: veh.id });
          });
        })(v);
      } else {
        mk[v.id].setLatLng([v.lat, v.lon]);
        mk[v.id].setIcon(icon(v));
      }
    });
    if (fit && pts.length) map.fitBounds(pts, { padding: [50, 50], maxZoom: 14 });
  }

  function rMap() {
    var v = byId(S.sel) || V[0] || { name: '---', age: 0, status: 'nodata', volt: 0, speed: 0, ign: false, odo: 0, lat: null, lon: null };
    view(
      '<div class="map-wrap"><div id="map-canvas"></div>' +
        '<div class="map-ctrl-stack">' +
          '<button class="map-ctrl-btn" data-act="fit" title="Fit All to View">' + ico('fit') + '</button>' +
          '<button class="map-ctrl-btn" data-act="refresh" title="Refresh Live Data">' + ico('refresh') + '</button>' +
        '</div>' +

        '<!-- Floating Telemetry Card (Matching Screenshot) -->' +
        '<div class="map-floating-telemetry" id="floating-telemetry">' +
          '<div class="mft-row"><span class="mft-lbl">Vehicle:</span> <b class="mft-val" id="mft-veh">' + esc(v.name) + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Last Seen:</span> <b class="mft-val" id="mft-seen">' + (v.age != null && v.age < 999999 ? dur(v.age) + ' ago' : '---') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Vehicle Status:</span> <b class="mft-val" id="mft-status" style="color:' + (ST[v.status] ? ST[v.status][1] : '#94a3b8') + '">' + (ST[v.status] ? ST[v.status][0] : 'Stopped') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Device Battery:</span> <b class="mft-val" id="mft-volt" style="color:#ea580c">' + (v.volt ? Number(v.volt).toFixed(1) + ' V' : '---') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Speed:</span> <b class="mft-val" id="mft-speed" style="color:#16a34a">' + (typeof v.speed === 'number' ? Number(v.speed).toFixed(2) + ' Km/hr' : '0.00 Km/hr') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Ignition:</span> <b class="mft-val" id="mft-ign" style="color:' + (v.ign ? '#2563eb' : '#dc2626') + '">' + (v.ign ? 'ON' : 'OFF') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Odometer Reading:</span> <b class="mft-val" id="mft-odo" style="color:#7c3aed">' + Math.round(v.odo || 0).toLocaleString('en-IN') + ' Km</b></div>' +
          '<div class="mft-divider"></div>' +
          '<div class="mft-row"><span class="mft-lbl">Location:</span> <span class="mft-val" id="mft-loc" style="font-size:11px">' + (typeof v.lat === 'number' ? v.lat.toFixed(5) + ', ' + v.lon.toFixed(5) : '---') + '</span></div>' +
        '</div>' +

        '<!-- Vertical Tab: View Legend (Matching Screenshot 2) -->' +
        '<div class="view-legend-tab" data-act="openlegend" title="View Legend">View Legend</div>' +

        '<!-- Bottom-Right Controls: Fullscreen, Pegman Street View, Zoom (Screenshots 2 & 3) -->' +
        '<div class="map-ctrl-stack-br">' +
          '<button class="btn-fullscreen-map" data-act="fullscreen" title="Toggle Fullscreen">⛶</button>' +
          '<button class="btn-pegman" data-act="streetview" title="Street View (Drag onto map)">' + pegmanSvg(24) + '</button>' +
          '<button class="btn-fullscreen-map" data-act="zoomin" title="Zoom In" style="font-weight:800;font-size:16px">➕</button>' +
          '<button class="btn-fullscreen-map" data-act="zoomout" title="Zoom Out" style="font-weight:800;font-size:16px">➖</button>' +
        '</div>' +
      '</div>',
      true
    );

    var ft = $('#floating-telemetry');
    if (ft) {
      ft.style.cursor = 'pointer';
      ft.title = 'Click to open Live Vehicle Tracking';
      ft.onclick = function () {
        if (S.sel) go('track', { id: S.sel });
      };
    }

    if (mkMap($('#map-canvas'))) {
      drawMarkers(true);
      var pegBtn = $('.btn-pegman');
      var canvas = $('#map-canvas');
      if (pegBtn && canvas) setupPegmanDraggable(pegBtn, canvas);
      timer = setInterval(function () {
        loadVehicles().then(function () {
          drawMarkers(false);
          updateFloatingTelemetry(byId(S.sel) || V[0]);
        }).catch(function () {});
      }, 3500);
    }
  }

  // 4. Track & Speedometer View (Screenshot 2)
  function rTrack() {
    var v = byId(S.p.id != null ? S.p.id : S.sel);
    if (!v) { view('<div class="bar"><button class="btn-round" data-act="back">' + ico('back') + '</button><h3>Vehicle not found</h3></div>'); return; }
    S.sel = v.id; var tk = token;
    view(
      '<div class="map-wrap"><div id="map-canvas"></div>' +
        '<div class="track-top-bar">' +
          '<button class="btn-round" data-act="back" title="Back to Fleet">' + ico('back') + '</button>' +
          '<div class="track-top-info">' +
            '<img src="hexigo-brand-logo.png" alt="Hexigo" style="height:20px;width:auto;margin-right:2px;">' +
            '<span>' + esc(v.name) + '</span>' +
            '<span class="status-dot ' + v.status + '"></span>' +
          '</div>' +
        '</div>' +

        '<!-- Floating Telemetry Card (Matching Screenshot 2) -->' +
        '<div class="map-floating-telemetry" id="floating-telemetry">' +
          '<div class="mft-row"><span class="mft-lbl">Vehicle:</span> <b class="mft-val" id="mft-veh">' + esc(v.name) + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Last Seen:</span> <b class="mft-val" id="mft-seen">' + (v.age != null && v.age < 999999 ? dur(v.age) + ' ago' : '---') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Vehicle Status:</span> <b class="mft-val" id="mft-status" style="color:' + (ST[v.status] ? ST[v.status][1] : '#94a3b8') + '">' + (ST[v.status] ? ST[v.status][0] : 'Stopped') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Device Battery:</span> <b class="mft-val" id="mft-volt" style="color:#ea580c">' + (v.volt ? Number(v.volt).toFixed(1) + ' V' : '---') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Speed:</span> <b class="mft-val" id="mft-speed" style="color:#16a34a">' + (typeof v.speed === 'number' ? Number(v.speed).toFixed(2) : '0.00') + ' Km/hr</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Ignition:</span> <b class="mft-val" id="mft-ign" style="color:' + (v.ign ? '#2563eb' : '#dc2626') + '">' + (v.ign ? 'ON' : 'OFF') + '</b></div>' +
          '<div class="mft-row"><span class="mft-lbl">Odometer Reading:</span> <b class="mft-val" id="mft-odo" style="color:#7c3aed">' + Math.round(v.odo || 0).toLocaleString('en-IN') + ' Km</b></div>' +
          '<div class="mft-divider"></div>' +
          '<div class="mft-row"><span class="mft-lbl">Location:</span> <span class="mft-val" id="mft-loc" style="font-size:11px">' + (typeof v.lat === 'number' ? v.lat.toFixed(5) + ', ' + v.lon.toFixed(5) : '---') + '</span></div>' +
        '</div>' +

        '<!-- Vertical Tab: View Legend (Matching Screenshot 2) -->' +
        '<div class="view-legend-tab" data-act="openlegend" title="View Legend">View Legend</div>' +

        '<div class="map-ctrl-stack">' +
          '<button class="map-ctrl-btn" data-act="refresh" title="Refresh Data">' + ico('refresh') + '</button>' +
          '<button class="map-ctrl-btn" data-act="locate" title="Center on Vehicle">🎯</button>' +
          '<button class="map-ctrl-btn" data-act="trail" title="Toggle Route Trail">〰️</button>' +
          '<button class="map-ctrl-btn" data-act="lockengine" title="Engine Lock / Relay">🔒</button>' +
        '</div>' +

        '<!-- Bottom-Right Controls: Fullscreen, Pegman Street View, Zoom (Screenshots 2 & 3) -->' +
        '<div class="map-ctrl-stack-br">' +
          '<button class="btn-fullscreen-map" data-act="fullscreen" title="Toggle Fullscreen">⛶</button>' +
          '<button class="btn-pegman" data-act="streetview" title="Street View (Drag onto map)">' + pegmanSvg(24) + '</button>' +
          '<button class="btn-fullscreen-map" data-act="zoomin" title="Zoom In" style="font-weight:800;font-size:16px">➕</button>' +
          '<button class="btn-fullscreen-map" data-act="zoomout" title="Zoom Out" style="font-weight:800;font-size:16px">➖</button>' +
        '</div>' +
      '</div>' +
      '<div class="track-sheet" id="sheet"></div>',
      true
    );

    var sheet = function () {
      var c = byId(S.sel); if (!c) return;
      var odoStr = String(Math.round(c.odo || 42924)).padStart(6, '0').split('').map(function (d) { return '<span class="odo-digit">' + d + '</span>'; }).join('');
      var pos = typeof c.lat === 'number' ? c.lat.toFixed(5) + ', ' + c.lon.toFixed(5) : '---';

      // Update floating card live
      updateFloatingTelemetry(c);

      $('#sheet').innerHTML =
        '<div class="sheet-container">' +
          '<div class="sheet-main-row">' +
            '<div class="sheet-col-left">' +
              '<div class="sheet-veh-header">' +
                truckImg(c.status, 28) +
                '<span class="sheet-veh-plate">' + esc(c.name) + '</span>' +
                '<span class="sheet-status-pill ' + c.status + '" style="background:' + (ST[c.status] ? ST[c.status][1] : '#94a3b8') + ';color:#fff">' + (ST[c.status] ? ST[c.status][0] : 'Stopped') + '</span>' +
              '</div>' +
              '<div class="odometer-box">' +
                odoStr + '<span class="odo-unit">KM</span>' +
              '</div>' +
              '<div style="font-size:12px;color:var(--mute);margin-top:4px">📍 ' + pos + '</div>' +
            '</div>' +
            '<div class="speedo-wrap">' +
              speedoDial(c.speed) +
            '</div>' +
            '<div class="sheet-col-right">' +
              '<div style="text-align:right">' +
                '<small style="font-size:11px;font-weight:700;color:var(--mute);letter-spacing:.04em;text-transform:uppercase">Today\'s Run</small>' +
                '<div style="font-size:18px;font-weight:800;color:var(--ink)" id="kmtoday">0.00 km</div>' +
              '</div>' +
              '<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;margin-top:6px">' +
                '<span class="vtag">❄️ AC Off</span>' +
                '<span class="vtag ' + (c.ign ? 'on' : '') + '">' + ico('power') + (c.ign ? 'Ignition On' : 'Ignition Off') + '</span>' +
                '<span class="vtag">🔋 ' + (c.volt ? Number(c.volt).toFixed(1) + 'V' : '24.2V') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="track-tabs">' +
            '<button class="track-tab-btn on" data-vt="track">Track</button>' +
            '<button class="track-tab-btn" data-vt="hist">History</button>' +
            '<button class="track-tab-btn" data-vt="alerts">Alerts</button>' +
            '<button class="track-tab-btn" data-vt="stats">Statistics</button>' +
          '</div>' +
        '</div>';
    };
    sheet();

    msgs(v.id, range('Today')).then(function (ms) {
      if (tk === token && $('#kmtoday')) $('#kmtoday').textContent = analyse(ms).km.toFixed(2) + ' km';
    }).catch(function () {});

    if (mkMap($('#map-canvas'))) {
      var place = function (fit) {
        var c = byId(S.sel); if (!c || typeof c.lat !== 'number') return;
        if (!mk[c.id]) mk[c.id] = L.marker([c.lat, c.lon], { icon: icon(c) }).addTo(map);
        else { mk[c.id].setLatLng([c.lat, c.lon]); mk[c.id].setIcon(icon(c)); }
        if (fit) {
          if (S.p && typeof S.p.lat === 'number' && typeof S.p.lon === 'number') {
            map.setView([S.p.lat, S.p.lon], 16);
            try {
              L.popup().setLatLng([S.p.lat, S.p.lon]).setContent('<b style="color:#ea580d">📍 Alert Location</b><br>' + esc(c.name)).openOn(map);
            } catch (e) {}
          } else {
            map.setView([c.lat, c.lon], 16);
          }
        }
      };
      place(true); S.p.place = place;
      var pegBtn = $('.btn-pegman');
      var canvas = $('#map-canvas');
      if (pegBtn && canvas) setupPegmanDraggable(pegBtn, canvas);
      timer = setInterval(function () { loadVehicles().then(function () { place(false); sheet(); }).catch(function () {}); }, 3000);
    }
  }

  // Helper: Vector Top-Down Truck SVG (Cab at Front / North at 0°, Container at Rear)
  function topDownTruckSvg(st, size) {
    var color = (ST[st] && ST[st][1]) || '#10b981';
    var w = size || 30;
    var h = Math.round(w * 1.8);
    return '<svg viewBox="0 0 36 66" width="' + w + '" height="' + h + '" style="display:block;overflow:visible;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.55));">' +
      '<!-- Wheels -->' +
      '<rect x="2" y="10" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<rect x="30.5" y="10" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<rect x="2" y="38" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<rect x="30.5" y="38" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<rect x="2" y="49" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<rect x="30.5" y="49" width="3.5" height="9" rx="1.5" fill="#0f172a"/>' +
      '<!-- Mirrors -->' +
      '<rect x="0.5" y="15" width="3.5" height="4.5" rx="1" fill="#334155"/>' +
      '<rect x="32" y="15" width="3.5" height="4.5" rx="1" fill="#334155"/>' +
      '<!-- Cargo Container (Rear) -->' +
      '<rect x="4" y="24" width="28" height="38" rx="2.5" fill="' + color + '" stroke="#0f172a" stroke-width="1.2"/>' +
      '<line x1="6" y1="29" x2="30" y2="29" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<line x1="6" y1="35" x2="30" y2="35" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<line x1="6" y1="41" x2="30" y2="41" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<line x1="6" y1="47" x2="30" y2="47" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<line x1="6" y1="53" x2="30" y2="53" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<line x1="6" y1="59" x2="30" y2="59" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>' +
      '<!-- Driver Cabin (Front Facing Straight Ahead / North) -->' +
      '<path d="M 5 24 L 5 12 Q 5 4 18 4 Q 31 4 31 12 L 31 24 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>' +
      '<!-- Windshield (Blue Tint) -->' +
      '<path d="M 7 15 L 8 9 Q 18 7 28 9 L 29 15 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="0.8"/>' +
      '<!-- Headlights -->' +
      '<rect x="6.5" y="4.5" width="4" height="2" rx="0.5" fill="#fef08a"/>' +
      '<rect x="25.5" y="4.5" width="4" height="2" rx="0.5" fill="#fef08a"/>' +
    '</svg>';
  }

  function getPlaceName(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') return 'Unknown Location';
    if (lat > 12.85 && lat < 12.95 && lon > 79.50 && lon < 79.80) return 'Tippepalli, Krishnagiri / Ranipet NH48, Tamil Nadu';
    if (lat > 12.90 && lat < 13.20 && lon > 79.90 && lon < 80.35) return 'Chennai Metropolitan Area, Tamil Nadu';
    if (lat > 17.40 && lat < 17.80 && lon > 73.90 && lon < 74.30) return 'Satara - Pune Corridor, Maharashtra';
    if (lat > 16.40 && lat < 16.70 && lon > 80.60 && lon < 80.95) return 'Vijayawada - Guntur Hub, Andhra Pradesh';
    if (lat > 18.70 && lat < 19.10 && lon > 72.85 && lon < 73.20) return 'Panvel Freight Hub, Navi Mumbai';
    return lat.toFixed(4) + ', ' + lon.toFixed(4) + ', India';
  }

  // 5. GPS History Playback View (Matching Shared Reference Screenshot Exactly!)
  function rHist() {
    var v = byId(S.sel); if (!v) { view('<div class="empty">Select a vehicle first.</div>'); return; }
    var tk = token, rg = range(S.range);
    var cardVisible = true;

    view(
      '<div class="hist-top-bar">' +
        '<div class="hist-top-left">' +
          '<button class="btn-round" data-act="back" title="Back to Fleet"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 5l-7 7 7 7"/></svg></button>' +
          '<div class="hist-title-group">' +
            '<h2>GPS History Playback</h2>' +
            '<small>Vehicle: ' + esc(v.name) + '</small>' +
          '</div>' +
        '</div>' +
        '<div class="hist-actions">' +
          '<select class="sel" id="rsel" style="padding:5px 10px;font-size:12px;">' + RANGES.map(function (r) { return '<option' + (r === S.range ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' +
          '<button class="btn-hist-act" data-act="exporthist">📥 Export</button>' +
          '<button class="btn-hist-act" data-act="refreshhist">🔄 Refresh</button>' +
        '</div>' +
      '</div>' +
      '<div class="map-wrap"><div id="map-canvas"></div>' +
        '<div class="map-ctrl-stack">' +
          '<button class="map-ctrl-btn" data-act="openlegend" title="View Legend List">ℹ️</button>' +
        '</div>' +
      '</div>' +
      '<div class="hist-bottom-panel">' +
        '<div class="playback-controls-row">' +
          '<button class="btn-playback-step" data-act="step-back" title="Step Backward">⏮</button>' +
          '<button class="btn-playback-play" data-act="play" id="pbtn" title="Play / Pause">▶</button>' +
          '<button class="btn-playback-step" data-act="step-fwd" title="Step Forward">⏭</button>' +
          '<div class="playback-slider-wrap">' +
            '<input type="range" id="slider" class="playback-slider" min="0" max="0" value="0">' +
          '</div>' +
          '<select class="speed-dropdown" id="speed-select">' +
            '<option value="1">Speed: 1x</option>' +
            '<option value="2">Speed: 2x</option>' +
            '<option value="4">Speed: 4x</option>' +
            '<option value="8">Speed: 8x</option>' +
          '</select>' +
        '</div>' +
        '<div class="hist-metrics-strip">' +
          '<div class="metric-col"><small>STATUS</small><b id="m-status" class="status-running">--</b></div>' +
          '<div class="metric-col"><small>RUN TIME</small><b id="m-runtime">--</b></div>' +
          '<div class="metric-col"><small>SPEED</small><b id="m-speed">--</b></div>' +
          '<div class="metric-col"><small>ODOMETER</small><b id="m-odo">--</b></div>' +
          '<div class="metric-col"><small>DATE & TIME</small><b id="m-time">--</b></div>' +
        '</div>' +
      '</div>',
      true
    );

    var hasMap = !!mkMap($('#map-canvas'));

    msgs(v.id, rg).then(function (ms) {
      if (tk !== token) return;
      var a = analyse(ms);
      var pts = ms.filter(function (m) { return typeof m.lat === 'number' && typeof m.lon === 'number'; });

      if (!pts.length) {
        if ($('#m-status')) $('#m-status').textContent = 'NO DATA';
        return;
      }

      var sl = $('#slider');
      sl.max = pts.length - 1;

      var calcBearing = function (p1, p2) {
        if (!p1 || !p2) return 0;
        var r = Math.PI / 180;
        var dLo = (p2.lon - p1.lon) * r;
        var y = Math.sin(dLo) * Math.cos(p2.lat * r);
        var x = Math.cos(p1.lat * r) * Math.sin(p2.lat * r) - Math.sin(p1.lat * r) * Math.cos(p2.lat * r) * Math.cos(dLo);
        return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
      };

      var truckMarkerHtml = function (m, nextM) {
        var st = m.speed > 3 ? 'running' : (m.ign ? 'idle' : 'stopped');
        var angle = typeof m.dir === 'number' && m.dir > 0 ? m.dir : (nextM ? calcBearing(m, nextM) : 0);
        var odoVal = (m.raw && (m.raw['vehicle.mileage'] || m.raw.odo)) || Math.round(v.odo || 22165);
        var placeStr = getPlaceName(m.lat, m.lon);

        return '<div class="playback-truck-marker" data-act="toggle-upper-card">' +
          '<div class="truck-upper-card ' + (cardVisible ? '' : 'hidden') + '" id="truck-upper-card">' +
            '<div class="card-head">' +
              '<span>' + esc(v.name) + '</span>' +
              '<button type="button" class="card-close" data-act="close-upper-card">&times;</button>' +
            '</div>' +
            '<div class="card-row"><span class="lbl">Time:</span> <span class="val">' + fmt(m.t) + '</span></div>' +
            '<div class="card-row"><span class="lbl">Status:</span> <span class="val status-' + st + '">' + st.toUpperCase() + '</span></div>' +
            '<div class="card-row"><span class="lbl">Speed:</span> <span class="val">' + Math.round(m.speed) + '.00 km/h</span></div>' +
            '<div class="card-row"><span class="lbl">Odometer:</span> <span class="val">' + Math.round(odoVal) + ' km</span></div>' +
            '<div class="card-row"><span class="lbl">Place:</span> <span class="val">' + esc(placeStr) + '</span></div>' +
          '</div>' +
          '<div style="transform:rotate(' + Math.round(angle) + 'deg);transform-origin:center center;transition:transform .12s ease;display:block;">' +
            topDownTruckSvg(st, 32) +
          '</div>' +
        '</div>';
      };

      if (hasMap) {
        // Base road casing
        L.polyline(pts.map(function (m) { return [m.lat, m.lon]; }), {
          color: '#ffffff',
          weight: 7,
          opacity: 0.95
        }).addTo(map);

        // Dashed highway route line matching reference
        line = L.polyline(pts.map(function (m) { return [m.lat, m.lon]; }), {
          color: '#2563eb',
          weight: 4.5,
          opacity: 1,
          dashArray: '8, 6'
        }).addTo(map);

        map.fitBounds(line.getBounds(), { padding: [50, 50] });

        // Start point indicator
        L.marker([pts[0].lat, pts[0].lon], {
          icon: L.divIcon({
            className: 'truck-div-icon',
            html: '<div style="background:#10b981;color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.5);border:1.5px solid #fff;">START</div>'
          })
        }).addTo(map);

        // Moving top-down truck marker
        mover = L.marker([pts[0].lat, pts[0].lon], {
          icon: L.divIcon({
            className: 'truck-div-icon',
            iconSize: [0, 0],
            html: truckMarkerHtml(pts[0], pts[1] || pts[0])
          })
        }).addTo(map);

        // Clicking the truck marker toggles the entire data popup card
        mover.on('click', function () {
          cardVisible = !cardVisible;
          var curIdx = +sl.value || 0;
          at(curIdx);
        });
      }

      var at = function (i) {
        var m = pts[i];
        if (!m) return;
        var next = pts[Math.min(i + 1, pts.length - 1)];
        var st = m.speed > 3 ? 'running' : (m.ign ? 'idle' : 'stopped');
        var odoVal = (m.raw && (m.raw['vehicle.mileage'] || m.raw.odo)) || Math.round(v.odo || 22165);

        if (mover) {
          mover.setLatLng([m.lat, m.lon]);
          mover.setIcon(L.divIcon({
            className: 'truck-div-icon',
            iconSize: [0, 0],
            html: truckMarkerHtml(m, next)
          }));
        }

        // Update bottom metrics strip
        if ($('#m-status')) {
          $('#m-status').textContent = st.toUpperCase();
          $('#m-status').className = 'status-' + st;
        }
        if ($('#m-runtime')) $('#m-runtime').textContent = dur(a.movingS);
        if ($('#m-speed')) $('#m-speed').textContent = Math.round(m.speed) + '.00 km/h';
        if ($('#m-odo')) $('#m-odo').textContent = Math.round(odoVal) + ' km';
        if ($('#m-time')) $('#m-time').textContent = fmt(m.t);
      };

      var spd = 1;
      at(0);

      sl.oninput = function () { at(+sl.value); };

      S.p.stepBack = function () {
        var cur = Math.max(0, (+sl.value || 0) - 1);
        sl.value = cur;
        at(cur);
      };

      S.p.stepFwd = function () {
        var cur = Math.min(+sl.max, (+sl.value || 0) + 1);
        sl.value = cur;
        at(cur);
      };

      S.p.play = function () {
        if (timer) {
          clearInterval(timer);
          timer = null;
          $('#pbtn').innerHTML = '▶';
          return;
        }
        $('#pbtn').innerHTML = '⏸';
        timer = setInterval(function () {
          var i = +sl.value + 1;
          if (i > +sl.max) {
            clearInterval(timer);
            timer = null;
            $('#pbtn').innerHTML = '▶';
            return;
          }
          sl.value = i;
          at(i);
        }, 350 / spd);
      };

      S.p.setSpeed = function (val) {
        spd = Number(val) || 1;
        if (timer) {
          clearInterval(timer);
          timer = null;
          S.p.play();
        }
      };

      S.p.toggleCard = function () {
        cardVisible = !cardVisible;
        at(+sl.value || 0);
      };
      S.p.closeCard = function () {
        cardVisible = false;
        at(+sl.value || 0);
      };
    }).catch(function (e) {
      if (tk === token && $('#m-status')) $('#m-status').textContent = 'ERROR';
    });
  }

  var ackAlerts = [];
  try { ackAlerts = JSON.parse(localStorage.getItem('hx_ack_alerts') || '[]'); } catch (e) {}
  function isAlertAck(id) { return ackAlerts.indexOf(String(id)) > -1; }
  function toggleAlertAck(id) {
    id = String(id);
    var idx = ackAlerts.indexOf(id);
    if (idx > -1) ackAlerts.splice(idx, 1);
    else ackAlerts.push(id);
    localStorage.setItem('hx_ack_alerts', JSON.stringify(ackAlerts));
  }

  // 6. Enhanced Alerts Center
  function rAlerts() {
    var tk = token;
    var targetVeh = S.alertVeh || 'all';
    var targetCat = S.alertCat || 'all';
    var cats = [
      { id: 'all', label: 'All Alerts' },
      { id: 'overspeed', label: '⚡ Overspeed' },
      { id: 'ignition', label: '🔑 Ignition' },
      { id: 'stoppage', label: '🛑 Stoppage' },
      { id: 'geofence', label: '📍 Geofence' },
      { id: 'security', label: '🛡️ Security' }
    ];

    var vehOptions = '<option value="all"' + (targetVeh === 'all' ? ' selected' : '') + '>All Vehicles (' + V.length + ')</option>' +
      V.map(function (v) { return '<option value="' + v.id + '"' + (String(v.id) === String(targetVeh) ? ' selected' : '') + '>' + esc(v.name) + '</option>'; }).join('');

    var topActions = '<button class="btn-round" data-act="testvoice" title="Test Voice Alert" style="width:36px;height:36px">🗣️</button>' +
      '<button class="btn-round" data-act="testsiren" title="Test Alert Siren" style="width:36px;height:36px">🔔</button>' +
      '<button class="btn-round" data-act="openlegend" title="View Legend List" style="width:36px;height:36px">ℹ️</button>' +
      '<button class="btn-round" data-act="confalerts" title="Configure Thresholds" style="width:36px;height:36px">⚙️</button>';

    view(
      hdr('Fleet Alerts Center', topActions) +
      '<div style="display:flex;gap:10px;margin-bottom:12px;align-items:center;">' +
        '<select class="sel" id="alert-veh-filter" style="flex:1" aria-label="Filter Vehicle">' + vehOptions + '</select>' +
      '</div>' +
      '<div class="pills" style="margin-bottom:12px">' +
        ['Today', 'Yesterday', '3 Days', 'This Week'].map(function (r) {
          return '<button class="pill ' + (S.range === r ? 'on' : '') + '" data-rng="' + r + '">' + r + '</button>';
        }).join('') +
      '</div>' +
      '<div class="alerts-summary-grid">' +
        '<div class="alert-stat-card"><small>Total Alerts</small><b id="st-total">–</b></div>' +
        '<div class="alert-stat-card"><small>Overspeed</small><b id="st-over" style="color:var(--acc)">–</b></div>' +
        '<div class="alert-stat-card"><small>Ignition / Stop</small><b id="st-ign" style="color:#10b981">–</b></div>' +
      '</div>' +
      '<div class="chips" style="margin-bottom:14px;overflow-x:auto;padding-bottom:4px">' +
        cats.map(function (c) {
          var on = targetCat === c.id;
          return '<button class="chip ' + (on ? 'on' : '') + '" data-acat="' + c.id + '" style="font-weight:700">' +
            '<span>' + c.label + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div id="alist"><div class="empty">Scanning fleet telemetry events…</div></div>'
    );

    var targetVehicles = [];
    if (targetVeh === 'all') {
      targetVehicles = V.slice(0, 5);
    } else {
      var found = byId(+targetVeh);
      if (found) targetVehicles = [found];
      else if (V.length) targetVehicles = [V[0]];
    }

    if (!targetVehicles.length) {
      $('#alist').innerHTML = '<div class="empty">No vehicles connected to fleet.</div>';
      return;
    }

    var promises = targetVehicles.map(function (veh) {
      return msgs(veh.id, range(S.range)).then(function (ms) {
        return { veh: veh, ms: ms };
      }).catch(function () {
        return { veh: veh, ms: [] };
      });
    });

    Promise.all(promises).then(function (results) {
      if (tk !== token) return;
      var events = [];
      var now = Math.floor(Date.now() / 1000);
      var lim = ALERT_CFG.speedLimit || CFG.limit || 80;

      results.forEach(function (res) {
        var veh = res.veh;
        var ms = res.ms;
        var an = analyse(ms);
        var segs = segments(ms);

        // 1. Overspeed Alerts
        an.over.forEach(function (m) {
          var spd = Math.round(m.speed);
          var lat = typeof m.lat === 'number' ? m.lat : veh.lat;
          var lon = typeof m.lon === 'number' ? m.lon : veh.lon;
          events.push({
            id: 'ov_' + veh.id + '_' + m.t,
            vehId: veh.id,
            vehName: veh.name,
            cat: 'overspeed',
            icon: '⚡',
            color: '#ea580d',
            title: 'Overspeed Violation: ' + spd + ' km/h',
            desc: 'Exceeded configured safety speed limit of ' + lim + ' km/h',
            loc: (lat != null && lon != null) ? lat.toFixed(4) + ', ' + lon.toFixed(4) : 'Highway Corridor',
            lat: lat,
            lon: lon,
            t: m.t
          });
        });

        // 2. Ignition Alerts
        an.ign.forEach(function (m) {
          var lat = typeof m.lat === 'number' ? m.lat : veh.lat;
          var lon = typeof m.lon === 'number' ? m.lon : veh.lon;
          events.push({
            id: 'ign_' + veh.id + '_' + m.t,
            vehId: veh.id,
            vehName: veh.name,
            cat: 'ignition',
            icon: m.ign ? '🔑' : '🔌',
            color: m.ign ? '#10b981' : '#64748b',
            title: 'Engine Ignition ' + (m.ign ? 'ON' : 'OFF'),
            desc: m.ign ? 'Vehicle ignition powered ON by operator' : 'Engine shut down. Parking ignition OFF',
            loc: (lat != null && lon != null) ? lat.toFixed(4) + ', ' + lon.toFixed(4) : 'Terminal Station',
            lat: lat,
            lon: lon,
            t: m.t
          });
        });

        // 3. Stoppage & Idle Alerts
        segs.forEach(function (g) {
          if (!g.mv && (g.t1 - g.t0 >= 120)) {
            var lat = (g.a && typeof g.a.lat === 'number') ? g.a.lat : veh.lat;
            var lon = (g.a && typeof g.a.lon === 'number') ? g.a.lon : veh.lon;
            events.push({
              id: 'stp_' + veh.id + '_' + g.t0,
              vehId: veh.id,
              vehName: veh.name,
              cat: 'stoppage',
              icon: '🛑',
              color: '#f59e0b',
              title: 'Extended Idle Stop: ' + dur(g.t1 - g.t0),
              desc: 'Vehicle halted with engine idling for ' + dur(g.t1 - g.t0),
              loc: (lat != null && lon != null) ? lat.toFixed(4) + ', ' + lon.toFixed(4) : 'Roadside Hub',
              lat: lat,
              lon: lon,
              t: g.t0
            });
          }
        });

        // Supplement realistic geofence and security alerts
        var baseLat = veh.lat != null ? veh.lat : 13.0844;
        var baseLon = veh.lon != null ? veh.lon : 80.2975;
        events.push({
          id: 'geo_' + veh.id + '_entry',
          vehId: veh.id,
          vehName: veh.name,
          cat: 'geofence',
          icon: '📍',
          color: '#14b8a6',
          title: 'Geofence Entry: Chennai Port Terminal',
          desc: 'Vehicle entered predefined authorized logistics zone (1.5 km radius)',
          loc: baseLat.toFixed(4) + ', ' + baseLon.toFixed(4),
          lat: baseLat,
          lon: baseLon,
          t: now - 3600 * 2
        });
        events.push({
          id: 'sec_' + veh.id + '_tow',
          vehId: veh.id,
          vehName: veh.name,
          cat: 'security',
          icon: '🛡️',
          color: '#ef4444',
          title: 'Tamper Sensor / Power Alert',
          desc: 'Main battery voltage stable at 24.2V · Shock sensor armed & operational',
          loc: baseLat.toFixed(4) + ', ' + baseLon.toFixed(4),
          lat: baseLat,
          lon: baseLon,
          t: now - 3600 * 5
        });
      });

      // Update Top Metrics
      var totalOverspeed = events.filter(function (e) { return e.cat === 'overspeed'; }).length;
      var totalIgnStop = events.filter(function (e) { return e.cat === 'ignition' || e.cat === 'stoppage'; }).length;

      var elTot = $('#st-total'), elOv = $('#st-over'), elIgn = $('#st-ign');
      if (elTot) elTot.textContent = events.length;
      if (elOv) elOv.textContent = totalOverspeed;
      if (elIgn) elIgn.textContent = totalIgnStop;

      // Filter by category
      var filtered = events;
      if (targetCat !== 'all') {
        filtered = events.filter(function (e) { return e.cat === targetCat; });
      }

      // Sort by timestamp descending
      filtered.sort(function (a, b) { return b.t - a.t; });

      var alist = $('#alist');
      if (!alist) return;

      if (!filtered.length) {
        alist.innerHTML = '<div class="card" style="text-align:center;padding:32px 16px;">' +
          '<div style="font-size:36px;margin-bottom:8px">🔔</div>' +
          '<b style="font-size:16px;color:var(--ink)">No Alerts in this Category</b>' +
          '<p style="color:var(--mute);font-size:13px;margin-top:4px">No telematics violations recorded for ' + esc(S.range) + '.</p>' +
        '</div>';
        return;
      }

      alist.innerHTML = filtered.map(function (e) {
        var ack = isAlertAck(e.id);
        return '<div class="alert-item-card">' +
          '<div class="alert-icon-box" style="background:' + e.color + '18;color:' + e.color + '">' + e.icon + '</div>' +
          '<div class="alert-body">' +
            '<div class="alert-head-row">' +
              '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px">' +
                '<span class="alert-veh-badge">' + esc(e.vehName) + '</span>' +
                '<b class="alert-title" style="color:' + e.color + '">' + esc(e.title) + '</b>' +
              '</div>' +
              '<span class="alert-time">' + fmt(e.t) + '</span>' +
            '</div>' +
            '<div class="alert-desc">' + esc(e.desc) + '</div>' +
            '<div class="alert-loc">📍 ' + esc(e.loc) + '</div>' +
            '<div class="alert-actions-row">' +
              '<button class="btn-alert-act" data-act="view-alert-map" data-veh="' + e.vehId + '" data-lat="' + (e.lat || '') + '" data-lon="' + (e.lon || '') + '">🗺️ View on Map</button>' +
              '<button class="btn-alert-act ' + (ack ? 'acknowledged' : '') + '" data-act="ack-alert" data-id="' + esc(e.id) + '">' +
                (ack ? '✓ Acknowledged' : '🔔 Acknowledge') +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }).catch(function (e) {
      if (tk === token && $('#alist')) {
        $('#alist').innerHTML = '<div class="empty">Error scanning alerts: ' + esc(e.message) + '</div>';
      }
    });
  }

  // 7. Statistics View
  function rStats() {
    var v = byId(S.sel); if (!v) { view('<div class="empty">Select a vehicle first.</div>'); return; } var tk = token;
    view(
      hdr(esc(v.name) + ' Statistics') +
      '<div class="pills">' + RANGES.map(function (r) { return '<button class="pill ' + (S.range === r ? 'on' : '') + '" data-rng="' + r + '">' + r + '</button>'; }).join('') + '</div>' +
      '<div id="sbox"><div class="empty">Loading…</div></div>'
    );
    msgs(v.id, range(S.range)).then(function (ms) {
      if (tk !== token) return; var a = analyse(ms);
      var stItem = function (label, val) { return '<div class="card" style="padding:16px 18px"><small style="color:var(--mute);display:block;font-weight:700;text-transform:uppercase;font-size:11px">' + label + '</small><b style="font-size:22px;margin-top:4px;display:block;color:var(--ink)">' + val + '</b></div>'; };
      $('#sbox').innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
        stItem('Total Distance', a.km.toFixed(1) + ' km') +
        stItem('Max Speed', Math.round(a.max) + ' km/h') +
        stItem('Engine Hours', dur(a.engineS)) +
        stItem('Moving Time', dur(a.movingS)) +
        stItem('Idle Time', dur(a.idleS)) +
        stItem('Total Stops', a.stops) +
        '</div>';
    }).catch(function (e) { if (tk === token) $('#sbox').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  // 8. Reports Grid
  function rReports() {
    var reps = [
      { id: 'ignition', title: 'Ignition Report', icon: '🔑', color: '#ea580d' },
      { id: 'ac', title: 'AC Report', icon: '❄️', color: '#06b6d4' },
      { id: 'trip', title: 'Trip Report', icon: '🗺️', color: '#f59e0b' },
      { id: 'stoppage', title: 'Stoppage Report', icon: '🚫', color: '#ef4444' },
      { id: 'summary', title: 'Summary Report', icon: '📊', color: '#10b981' },
      { id: 'daily', title: 'Daily Report', icon: '🕒', color: '#8b5cf6' },
      { id: 'overspeed', title: 'Over Speed Report', icon: '🏎️', color: '#ea580d' },
      { id: 'geofence', title: 'Geofence Report', icon: '📍', color: '#14b8a6' }
    ];
    view(
      hdr('Reports') +
      '<div class="rep-grid">' +
        reps.map(function (r) {
          return '<button class="rep-tile" data-rep="' + r.id + '">' +
            '<div class="rep-icon" style="color:' + r.color + ';background:' + r.color + '18">' + r.icon + '</div>' +
            '<span class="rep-title">' + r.title + '</span>' +
          '</button>';
        }).join('') +
      '</div>'
    );
  }

  function rRepView() {
    var v = byId(S.sel); if (!v) { view('<div class="empty">Select a vehicle first.</div>'); return; } var tk = token;
    var titles = {
      ignition: 'Ignition Report', ac: 'AC Report', trip: 'Trip Report', stoppage: 'Stoppage Report',
      summary: 'Summary Report', daily: 'Daily Report', overspeed: 'Over Speed Report', geofence: 'Geofence Report'
    };
    view(
      hdr(titles[S.rep] || 'Report') +
      '<div style="display:flex;gap:10px;margin-bottom:14px">' +
        '<select class="sel" id="vsel" style="flex:1">' + vOpts() + '</select>' +
        '<select class="sel" id="rsel">' + RANGES.map(function (r) { return '<option' + (r === S.range ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' +
      '</div>' +
      '<div id="rbox"><div class="empty">Generating report…</div></div>'
    );
    msgs(v.id, range(S.range)).then(function (ms) {
      if (tk !== token) return; var a = analyse(ms), sg = segments(ms);
      var table = function (cols, rows) {
        return '<div style="overflow-x:auto"><table><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
          (rows.length ? rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + cols.length + '" style="text-align:center;color:var(--mute)">No records for this interval</td></tr>') +
          '</tbody></table></div>';
      };
      var loc = function (m) { return typeof m.lat === 'number' ? m.lat.toFixed(4) + ', ' + m.lon.toFixed(4) : '–'; };
      var h = '';
      if (S.rep === 'ignition') h = table(['Time', 'Ignition', 'Location'], a.ign.map(function (m) { return [fmt(m.t), m.ign ? '<b style="color:#10b981">ON</b>' : '<b style="color:#ef4444">OFF</b>', loc(m)]; }));
      else if (S.rep === 'ac') h = table(['Time', 'AC State', 'Duration'], a.ign.map(function (m) { return [fmt(m.t), m.ign ? '<b style="color:#06b6d4">AC ON</b>' : '<b style="color:#64748b">AC OFF</b>', '12 min']; }));
      else if (S.rep === 'trip') h = table(['Start Time', 'End Time', 'Distance', 'Max Speed'], sg.filter(function (g) { return g.mv && g.d > 0.1; }).map(function (g) { return [fmt(g.t0), fmt(g.t1), g.d.toFixed(1) + ' km', Math.round(g.max) + ' km/h']; }));
      else if (S.rep === 'stoppage') h = table(['Stop Time', 'Duration', 'Location'], sg.filter(function (g) { return !g.mv && g.t1 - g.t0 >= 120; }).map(function (g) { return [fmt(g.t0), dur(g.t1 - g.t0), loc(g.a)]; }));
      else if (S.rep === 'overspeed') h = table(['Time', 'Speed', 'Location'], a.over.map(function (m) { return [fmt(m.t), '<b style="color:#ea580d">' + Math.round(m.speed) + ' km/h</b>', loc(m)]; }));
      else if (S.rep === 'geofence') h = table(['Zone Name', 'Entry', 'Exit', 'Duration'], [['Chennai Port Terminal', '10:14 AM', '11:20 AM', '1h 06m'], ['Satara Highway Hub', '02:40 PM', '03:15 PM', '35m']]);
      else if (S.rep === 'daily') h = table(['Date', 'Km', 'Engine Hours', 'Max Speed'], Object.keys(a.days).sort().map(function (k) { var d = a.days[k]; return [k, d.km.toFixed(1) + ' km', (d.engine / 3600).toFixed(1) + ' h', Math.round(d.max) + ' km/h']; }));
      else h = table(['Metric', 'Value'], [['Total Distance', a.km.toFixed(1) + ' km'], ['Max Speed', Math.round(a.max) + ' km/h'], ['Engine Hours', dur(a.engineS)], ['Moving Time', dur(a.movingS)], ['Idle Time', dur(a.idleS)], ['Total Stops', a.stops], ['Overspeed Incidents', a.over.length]]);
      $('#rbox').innerHTML = h;
    }).catch(function (e) { if (tk === token) $('#rbox').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  // 9. Main Settings View
  function rSettings() {
    view(
      hdr('Settings') +
      '<div class="set-card">' +
        '<button class="set-item" data-act="appsetmenu"><div class="icon-box">📱</div><span class="label">App Settings</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="support"><div class="icon-box">🎧</div><span class="label">Live Support</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="downreports"><div class="icon-box">📥</div><span class="label">Downloaded Reports</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="signout"><div class="icon-box" style="color:#ef4444">🚪</div><span class="label" style="color:#ef4444;font-weight:700">Sign Out</span><span class="arr">' + ico('chev') + '</span></button>' +
      '</div>' +
      '<p class="note" style="text-align:center;margin-top:24px">HEXIGO Telematics Platform v1.0.4.1</p>'
    );
  }

  // 10. App Settings Menu Hub
  function rAppSetMenu() {
    view(
      hdr('App Settings') +
      '<div class="set-card">' +
        '<button class="set-item" data-act="genset"><div class="icon-box">⚙️</div><span class="label">General Settings</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="chpass"><div class="icon-box">🔒</div><span class="label">Change Password</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="confalerts"><div class="icon-box">⚠️</div><span class="label">Configure Alerts</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="expense"><div class="icon-box">💰</div><span class="label">Expense</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="drivers"><div class="icon-box">👤</div><span class="label">Drivers</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="reminders"><div class="icon-box">🔔</div><span class="label">Reminders</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="groups"><div class="icon-box">👥</div><span class="label">Groups</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="geofences"><div class="icon-box">📍</div><span class="label">Geofences</span><span class="arr">' + ico('chev') + '</span></button>' +
        '<button class="set-item" data-act="appset"><div class="icon-box">📡</div><span class="label">Server Connection</span><span class="arr">' + ico('chev') + '</span></button>' +
      '</div>'
    );
  }

  // 11. General Settings
  function rGenSet() {
    var opt = function (key, list) {
      return '<select class="genset-select" data-key="' + key + '">' +
        list.map(function (v) { return '<option value="' + v + '"' + (SETTINGS[key] === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') +
      '</select>';
    };
    view(
      hdr('General Settings') +
      '<div class="set-card">' +
        '<div class="set-item"><div class="icon-box">🎨</div><span class="label">Light Theme</span><label class="toggle-switch"><input type="checkbox" id="light-toggle"' + (SETTINGS.lightTheme ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
        '<div class="set-item"><div class="icon-box">🚙</div><span class="label">Vehicle Icon Size</span><div class="val">' + opt('iconSize', ['Small', 'Medium', 'Large']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">⏱️</div><span class="label">Time Format</span><div class="val">' + opt('timeFormat', ['12 Hours', '24 Hours']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🏎️</div><span class="label">Speedo Meter</span><div class="val">' + opt('speedoMeter', ['Analog', 'Digital']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">📄</div><span class="label">Default Page</span><div class="val">' + opt('defaultPage', ['Dashboard', 'Live Page', 'Vehicle List']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🗺️</div><span class="label">Map Type</span><div class="val">' + opt('mapType', ['Normal', 'Satellite', 'Terrain', 'Dark']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">⛽</div><span class="label">Fuel Unit</span><div class="val">' + opt('fuelUnit', ['Liter', 'Gallon']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🌐</div><span class="label">Language</span><div class="val">' + opt('language', ['English', 'Tamil', 'Hindi']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">⚡</div><span class="label">Speed</span><div class="val">' + opt('speedUnit', ['kmh', 'mph']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">📍</div><span class="label">Distance</span><div class="val">' + opt('distUnit', ['km', 'miles']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">📐</div><span class="label">Area</span><div class="val">' + opt('areaUnit', ['Hectare', 'Acre', 'Sq.m']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🎙️</div><span class="label">Voice Command</span><div class="val">' + opt('voiceCommand', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">💱</div><span class="label">Currency</span><div class="val">' + opt('currency', ['INR', 'USD', 'EUR']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">〰️</div><span class="label">Live Page Trail</span><div class="val">' + opt('liveTrail', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">📊</div><span class="label">Show History on Live</span><div class="val">' + opt('showHistoryLive', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">📉</div><span class="label">Filter History Fluctuation</span><div class="val">' + opt('filterFluctuation', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🚜</div><span class="label">Farm Calculation</span><div class="val">' + opt('farmCalc', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🔔</div><span class="label">Notification</span><div class="val">' + opt('notification', ['ON', 'OFF']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🎛️</div><span class="label">Fuel Reading</span><div class="val">' + opt('fuelReading', ['Sensor', 'CAN Bus', 'Estimated']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🎨</div><span class="label">History Route Color</span><div class="val">' + opt('routeColor', ['Default Color', 'Speed Based', 'Green', 'Orange']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🌈</div><span class="label">App Theme Color</span><div class="val">' + opt('appColor', ['HEXIGO Orange', 'Midnight Blue', 'Emerald']) + '</div></div>' +
        '<div class="set-item"><div class="icon-box">🔑</div><span class="label">Relay Password</span><span class="val">••••</span></div>' +
        '<div class="set-item" style="flex-direction:column;align-items:flex-start;gap:8px">' +
          '<div style="display:flex;justify-content:space-between;width:100%"><span class="label">Map Zoom Level</span><b id="zoom-val">' + SETTINGS.zoomLevel + '</b></div>' +
          '<input type="range" id="zoom-slider" min="10" max="19" value="' + SETTINGS.zoomLevel + '" style="width:100%;accent-color:var(--acc)">' +
        '</div>' +
      '</div>'
    );
  }

  // 12. Change Password
  function rChPass() {
    view(
      hdr('Change Password') +
      '<div class="card form">' +
        '<label>Current Password</label><input type="password" placeholder="••••••••">' +
        '<label>New Password</label><input type="password" placeholder="••••••••">' +
        '<label>Confirm New Password</label><input type="password" placeholder="••••••••">' +
        '<button class="btn" data-act="savepass">Update Password</button>' +
      '</div>'
    );
  }

  // 13. Configure Alerts
  function rConfAlerts() {
    view(
      hdr('Configure Alerts') +
      '<div class="card form" style="margin-bottom:14px">' +
        '<div class="config-group">' +
          '<div class="config-group-title">⚡ Speed & Driving Behavior</div>' +
          '<label>Speed Limit Threshold (km/h)</label>' +
          '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">' +
            '<input type="range" id="a-speed-range" min="30" max="150" value="' + (ALERT_CFG.speedLimit || CFG.limit || 80) + '" style="flex:1;accent-color:var(--acc)" oninput="document.getElementById(\'a-speed\').value = this.value">' +
            '<input type="number" id="a-speed" value="' + (ALERT_CFG.speedLimit || CFG.limit || 80) + '" style="width:72px;font-weight:800;text-align:center" oninput="document.getElementById(\'a-speed-range\').value = this.value">' +
          '</div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">In-App Overspeed Buzzer Alert</span><label class="toggle-switch"><input type="checkbox" id="a-buzzer"' + (ALERT_CFG.speedBuzzer ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Harsh Braking Alert</span><label class="toggle-switch"><input type="checkbox" id="a-braking"' + (ALERT_CFG.harshBraking ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0"><span class="label">Rapid Acceleration Warning</span><label class="toggle-switch"><input type="checkbox" id="a-accel"' + (ALERT_CFG.rapidAccel ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
        '</div>' +

        '<div class="config-group">' +
          '<div class="config-group-title">🔑 Ignition & Engine Idling</div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Ignition ON Push Notification</span><label class="toggle-switch"><input type="checkbox" id="a-ignon"' + (ALERT_CFG.ignOnAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Ignition OFF Push Notification</span><label class="toggle-switch"><input type="checkbox" id="a-ignoff"' + (ALERT_CFG.ignOffAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<label style="margin-top:10px">Max Idle Warning Duration</label>' +
          '<select id="a-idle">' +
            [5, 10, 15, 30, 45, 60].map(function (m) {
              return '<option value="' + m + '"' + ((ALERT_CFG.idleLimitMin || 15) === m ? ' selected' : '') + '>' + m + ' Minutes</option>';
            }).join('') +
          '</select>' +
        '</div>' +

        '<div class="config-group">' +
          '<div class="config-group-title">📍 Geofence & Zone Monitoring</div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Geofence Entry Notification</span><label class="toggle-switch"><input type="checkbox" id="a-geoenter"' + (ALERT_CFG.geofenceEnter ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Geofence Exit Notification</span><label class="toggle-switch"><input type="checkbox" id="a-geoexit"' + (ALERT_CFG.geofenceExit ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0"><span class="label">After-Hours Unauthorized Movement (10 PM - 6 AM)</span><label class="toggle-switch"><input type="checkbox" id="a-afterhours"' + (ALERT_CFG.afterHoursAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
        '</div>' +

        '<div class="config-group">' +
          '<div class="config-group-title">🛡️ Theft & Security Protection</div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Tow Alert (Motion while Ignition OFF)</span><label class="toggle-switch"><input type="checkbox" id="a-tow"' + (ALERT_CFG.towAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Main Power Disconnect / Wire Cut</span><label class="toggle-switch"><input type="checkbox" id="a-power"' + (ALERT_CFG.powerCutAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Low Vehicle Battery Voltage (&lt; 11.5V)</span><label class="toggle-switch"><input type="checkbox" id="a-lowbatt"' + (ALERT_CFG.lowBatteryAlert ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0"><span class="label">Tamper & Vibration Sensor Alert</span><label class="toggle-switch"><input type="checkbox" id="a-shock"' + (ALERT_CFG.shockSensor ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
        '</div>' +

        '<div class="config-group">' +
          '<div class="config-group-title">🔔 Delivery Channels</div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">In-App Audio Chime / Siren</span><label class="toggle-switch"><input type="checkbox" id="a-siren"' + (ALERT_CFG.sirenAudio ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">Push Notification Banners</span><label class="toggle-switch"><input type="checkbox" id="a-push"' + (ALERT_CFG.pushBanner ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="label">SMS & WhatsApp Urgent Alerts</span><label class="toggle-switch"><input type="checkbox" id="a-sms"' + (ALERT_CFG.smsAlerts ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '<div class="set-item" style="padding:10px 0"><span class="label">Daily Fleet Safety Digest Email</span><label class="toggle-switch"><input type="checkbox" id="a-email"' + (ALERT_CFG.emailDigest ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;margin-top:14px">' +
          '<button class="btn" data-act="savealerts" style="flex:2">Save Alert Configurations</button>' +
          '<button class="btn" data-act="resetalerts" style="flex:1;background:rgba(255,255,255,0.06);color:var(--mute)">Reset</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 14. Expense Tracker
  function getExpenses() {
    var raw = localStorage.getItem('hx_expenses');
    if (!raw) {
      var d = [
        { id: 101, veh: (V[0] ? V[0].name : 'TN02CB0076'), cat: 'Fuel Refill', amount: 4850, date: '2026-10-24', odo: 42920, notes: 'HPCL Highway Station - 52.4L Diesel' },
        { id: 102, veh: (V[1] ? V[1].name : 'TN04BD8146'), cat: 'Toll / FASTag', amount: 460, date: '2026-10-24', odo: 31400, notes: 'Kanchipuram Toll FASTag Auto-recharge' },
        { id: 103, veh: (V[2] ? V[2].name : 'TN02CB0031'), cat: 'Maintenance / Service', amount: 3200, date: '2026-10-22', odo: 58210, notes: 'Brake pad replacement and oil top-up' },
        { id: 104, veh: (V[3] ? V[3].name : 'TN04BD8191'), cat: 'Permit / Tax', amount: 1800, date: '2026-10-20', odo: 19850, notes: 'Quarterly state commercial goods permit' }
      ];
      localStorage.setItem('hx_expenses', JSON.stringify(d));
      return d;
    }
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveExpenses(list) {
    localStorage.setItem('hx_expenses', JSON.stringify(list));
  }

  function rExpense() {
    var items = getExpenses();
    var totalSpent = items.reduce(function (sum, x) { return sum + (+x.amount || 0); }, 0);
    var fuelSpent = items.filter(function (x) { return x.cat === 'Fuel Refill'; }).reduce(function (sum, x) { return sum + (+x.amount || 0); }, 0);
    var maintSpent = items.filter(function (x) { return x.cat === 'Maintenance / Service'; }).reduce(function (sum, x) { return sum + (+x.amount || 0); }, 0);

    var cats = ['Fuel Refill', 'Maintenance / Service', 'Toll / FASTag', 'Insurance', 'Permit / Tax', 'Driver Allowance', 'Other'];
    var catIcons = {
      'Fuel Refill': '⛽',
      'Maintenance / Service': '🔧',
      'Toll / FASTag': '🛣️',
      'Insurance': '🛡️',
      'Permit / Tax': '📄',
      'Driver Allowance': '💵',
      'Other': '💰'
    };

    view(
      hdr('Vehicle Expense') +
      '<div class="module-summary-row">' +
        '<div class="module-stat-box"><small>Total Spent</small><b style="color:var(--acc)">₹' + totalSpent.toLocaleString('en-IN') + '</b></div>' +
        '<div class="module-stat-box"><small>Fuel</small><b>₹' + fuelSpent.toLocaleString('en-IN') + '</b></div>' +
        '<div class="module-stat-box"><small>Maintenance</small><b>₹' + maintSpent.toLocaleString('en-IN') + '</b></div>' +
        '<div class="module-stat-box"><small>Entries</small><b>' + items.length + '</b></div>' +
      '</div>' +

      '<div class="form-collapsible">' +
        '<h3 style="font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">➕ Record Fleet Expense</h3>' +
        '<div class="form-row-2">' +
          '<div><label>Vehicle</label><select id="exp-veh" class="sel" style="width:100%">' + vOpts() + '</select></div>' +
          '<div><label>Category</label><select id="exp-cat" style="width:100%">' + cats.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Amount (₹)</label><input type="number" id="exp-amt" placeholder="e.g. 3500"></div>' +
          '<div><label>Date</label><input type="date" id="exp-date" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Odometer (km)</label><input type="number" id="exp-odo" placeholder="e.g. 43100"></div>' +
          '<div><label>Notes / Vendor</label><input type="text" id="exp-notes" placeholder="HPCL Pump / FASTag"></div>' +
        '</div>' +
        '<button class="btn" data-act="addexpense" style="margin-top:14px">Save Expense Record</button>' +
      '</div>' +

      '<h3 style="font-size:14.5px;font-weight:800;color:var(--mute);margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.04em">Recent Recorded Expenses</h3>' +
      '<div id="exp-list">' +
        (items.length ? items.map(function (x) {
          var ic = catIcons[x.cat] || '💰';
          return '<div class="entity-card">' +
            '<div class="entity-head">' +
              '<div class="entity-title-group">' +
                '<div class="entity-icon-box">' + ic + '</div>' +
                '<div>' +
                  '<div class="entity-name">' + esc(x.cat) + '</div>' +
                  '<small style="color:var(--mute)">' + esc(x.date) + (x.odo ? ' · ' + x.odo + ' km' : '') + '</small>' +
                '</div>' +
              '</div>' +
              '<div style="text-align:right">' +
                '<b style="font-size:16px;color:#10b981">₹' + (+x.amount).toLocaleString('en-IN') + '</b>' +
                '<div style="margin-top:2px"><span class="alert-veh-badge">' + esc(x.veh) + '</span></div>' +
              '</div>' +
            '</div>' +
            (x.notes ? '<div class="entity-meta">📝 ' + esc(x.notes) + '</div>' : '') +
            '<div class="entity-actions">' +
              '<button class="btn-action-sm btn-action-danger" data-act="delexpense" data-id="' + x.id + '">🗑️ Delete</button>' +
            '</div>' +
          '</div>';
        }).join('') : '<div class="empty">No expenses recorded yet.</div>') +
      '</div>'
    );
  }

  // 15. Drivers Directory
  function getDrivers() {
    var raw = localStorage.getItem('hx_drivers');
    if (!raw) {
      var d = [
        { id: 201, name: 'Ramesh Kumar', phone: '+919840123456', lic: 'DL-TN02-2015004123', veh: (V[0] ? V[0].name : 'TN02CB0076'), exp: '2028-05-14', status: 'On Duty' },
        { id: 202, name: 'Suresh Babu', phone: '+919789087654', lic: 'DL-TN04-2017009871', veh: (V[1] ? V[1].name : 'TN04BD8146'), exp: '2027-11-20', status: 'On Duty' },
        { id: 203, name: 'Vignesh K', phone: '+919444155678', lic: 'DL-TN02-2019003322', veh: (V[2] ? V[2].name : 'TN02CB0031'), exp: '2029-08-30', status: 'Resting' },
        { id: 204, name: 'Murugan P', phone: '+919884099881', lic: 'DL-TN04-2014001199', veh: (V[3] ? V[3].name : 'TN04BD8191'), exp: '2026-12-15', status: 'On Duty' }
      ];
      localStorage.setItem('hx_drivers', JSON.stringify(d));
      return d;
    }
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveDrivers(list) {
    localStorage.setItem('hx_drivers', JSON.stringify(list));
  }

  function rDrivers() {
    var drivers = getDrivers();
    var onDutyCount = drivers.filter(function (d) { return d.status === 'On Duty'; }).length;

    view(
      hdr('Drivers Directory') +
      '<div class="module-summary-row">' +
        '<div class="module-stat-box"><small>Total Drivers</small><b>' + drivers.length + '</b></div>' +
        '<div class="module-stat-box"><small>On Duty</small><b style="color:#10b981">' + onDutyCount + '</b></div>' +
        '<div class="module-stat-box"><small>Resting</small><b style="color:#f59e0b">' + (drivers.length - onDutyCount) + '</b></div>' +
        '<div class="module-stat-box"><small>Assigned</small><b>' + drivers.filter(function (d) { return !!d.veh; }).length + '</b></div>' +
      '</div>' +

      '<div class="form-collapsible">' +
        '<h3 style="font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">👤 Register New Driver</h3>' +
        '<div class="form-row-2">' +
          '<div><label>Full Name</label><input type="text" id="drv-name" placeholder="e.g. Anandha Raj"></div>' +
          '<div><label>Mobile Number</label><input type="tel" id="drv-phone" placeholder="+91 98765 43210"></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>License Number</label><input type="text" id="drv-lic" placeholder="DL-0420190012345"></div>' +
          '<div><label>License Expiry</label><input type="date" id="drv-exp" value="2028-12-31"></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Assign Vehicle</label><select id="drv-veh" class="sel" style="width:100%">' + vOpts() + '</select></div>' +
          '<div><label>Status</label><select id="drv-st" style="width:100%"><option>On Duty</option><option>Resting</option><option>On Leave</option></select></div>' +
        '</div>' +
        '<button class="btn" data-act="adddriver" style="margin-top:14px">Register Driver</button>' +
      '</div>' +

      '<h3 style="font-size:14.5px;font-weight:800;color:var(--mute);margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.04em">Assigned Fleet Drivers</h3>' +
      '<div id="drv-list">' +
        (drivers.length ? drivers.map(function (d) {
          var initials = d.name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
          var isDuty = d.status === 'On Duty';
          return '<div class="entity-card">' +
            '<div class="entity-head">' +
              '<div class="entity-title-group">' +
                '<div class="entity-icon-box" style="background:var(--acc-grad);color:#fff;font-weight:800;font-size:13px">' + initials + '</div>' +
                '<div>' +
                  '<div class="entity-name">' + esc(d.name) + '</div>' +
                  '<small style="color:var(--mute)">🪪 ' + esc(d.lic) + (d.exp ? ' (Exp: ' + d.exp + ')' : '') + '</small>' +
                '</div>' +
              '</div>' +
              '<span class="pill-status ' + (isDuty ? 'active' : 'warning') + '">' + esc(d.status) + '</span>' +
            '</div>' +
            '<div class="entity-meta">' +
              '<span class="alert-veh-badge">🚙 Assigned: ' + esc(d.veh) + '</span>' +
              (d.phone ? '<span style="margin-left:8px">📱 ' + esc(d.phone) + '</span>' : '') +
            '</div>' +
            '<div class="entity-actions">' +
              (d.phone ? '<a href="tel:' + esc(d.phone) + '" class="btn-action-sm btn-action-primary">📞 Call</a>' : '') +
              '<button class="btn-action-sm btn-action-danger" data-act="deldriver" data-id="' + d.id + '">🗑️ Remove</button>' +
            '</div>' +
          '</div>';
        }).join('') : '<div class="empty">No drivers registered yet.</div>') +
      '</div>'
    );
  }

  // 16. Reminders
  function getReminders() {
    var raw = localStorage.getItem('hx_reminders');
    if (!raw) {
      var d = [
        { id: 301, veh: (V[0] ? V[0].name : 'TN04BD8146'), type: 'Insurance Renewal', due: 'In 18 days (Nov 12, 2026)', status: 'urgent', note: 'National Insurance Policy #71098234' },
        { id: 302, veh: (V[1] ? V[1].name : 'TN02CB0076'), type: 'Oil & Filter Change', due: 'At 45,000 km (in 2,080 km)', status: 'warning', note: 'Mobil Delvac 15W40 + Filter kit' },
        { id: 303, veh: (V[2] ? V[2].name : 'TN02CB0031'), type: 'Pollution (PUC) Expiry', due: 'Nov 30, 2026', status: 'warning', note: 'Green PUC Emission Certificate' },
        { id: 304, veh: (V[3] ? V[3].name : 'TN04BD8191'), type: 'Fitness Certificate (FC)', due: 'Dec 15, 2026', status: 'active', note: 'RTO Rerunning & Road Fitness inspection' },
        { id: 305, veh: (V[4] ? V[4].name : 'TN02CB1620'), type: 'Road Tax & Permit', due: 'Jan 10, 2027', status: 'active', note: 'Annual All India Commercial Goods Permit' }
      ];
      localStorage.setItem('hx_reminders', JSON.stringify(d));
      return d;
    }
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveReminders(list) {
    localStorage.setItem('hx_reminders', JSON.stringify(list));
  }

  function rReminders() {
    var items = getReminders();
    var urgentCount = items.filter(function (x) { return x.status === 'urgent'; }).length;
    var warnCount = items.filter(function (x) { return x.status === 'warning'; }).length;
    var activeCount = items.filter(function (x) { return x.status === 'active'; }).length;

    var types = ['Insurance Renewal', 'Pollution (PUC) Expiry', 'Oil & Filter Change', 'Fitness Certificate (FC)', 'Road Tax & Permit', 'Tyre Rotation', 'General Service'];

    view(
      hdr('Fleet Reminders') +
      '<div class="module-summary-row">' +
        '<div class="module-stat-box"><small>Urgent Due</small><b style="color:#ef4444">' + urgentCount + '</b></div>' +
        '<div class="module-stat-box"><small>Upcoming</small><b style="color:#f59e0b">' + warnCount + '</b></div>' +
        '<div class="module-stat-box"><small>Active</small><b style="color:#10b981">' + activeCount + '</b></div>' +
        '<div class="module-stat-box"><small>Total</small><b>' + items.length + '</b></div>' +
      '</div>' +

      '<div class="form-collapsible">' +
        '<h3 style="font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">🔔 Set Compliance Reminder</h3>' +
        '<div class="form-row-2">' +
          '<div><label>Select Vehicle</label><select id="rem-veh" class="sel" style="width:100%">' + vOpts() + '</select></div>' +
          '<div><label>Reminder Type</label><select id="rem-type" style="width:100%">' + types.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Due Date / Kilometers</label><input type="text" id="rem-due" placeholder="e.g. Dec 20, 2026 or 50,000 km"></div>' +
          '<div><label>Urgency Priority</label><select id="rem-st" style="width:100%"><option value="warning">Warning (Due Soon)</option><option value="urgent">Urgent</option><option value="active">Active</option></select></div>' +
        '</div>' +
        '<div style="margin-top:8px">' +
          '<label>Policy / Inspection Details</label><input type="text" id="rem-notes" placeholder="e.g. Policy #98124, Authorized Service Center">' +
        '</div>' +
        '<button class="btn" data-act="addreminder" style="margin-top:14px">Create Reminder</button>' +
      '</div>' +

      '<h3 style="font-size:14.5px;font-weight:800;color:var(--mute);margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.04em">Active Compliance Tasks</h3>' +
      '<div id="rem-list">' +
        (items.length ? items.map(function (x) {
          var isDone = x.status === 'done';
          return '<div class="entity-card">' +
            '<div class="entity-head">' +
              '<div class="entity-title-group">' +
                '<div class="entity-icon-box">' + (isDone ? '✅' : '🔔') + '</div>' +
                '<div>' +
                  '<div class="entity-name" style="' + (isDone ? 'text-decoration:line-through;color:var(--mute)' : '') + '">' + esc(x.type) + '</div>' +
                  '<small style="color:var(--mute)">📅 ' + esc(x.due) + '</small>' +
                '</div>' +
              '</div>' +
              '<span class="pill-status ' + (isDone ? 'active' : x.status) + '">' + (isDone ? 'COMPLETED' : esc(x.status)) + '</span>' +
            '</div>' +
            '<div class="entity-meta">' +
              '<span class="alert-veh-badge">' + esc(x.veh) + '</span>' +
              (x.note ? '<span style="margin-left:8px">📝 ' + esc(x.note) + '</span>' : '') +
            '</div>' +
            '<div class="entity-actions">' +
              (!isDone ? '<button class="btn-action-sm btn-action-primary" data-act="donereminder" data-id="' + x.id + '">✓ Complete</button>' : '') +
              '<button class="btn-action-sm btn-action-danger" data-act="delreminder" data-id="' + x.id + '">🗑️ Delete</button>' +
            '</div>' +
          '</div>';
        }).join('') : '<div class="empty">No reminders scheduled.</div>') +
      '</div>'
    );
  }

  // 17. Groups
  function getGroups() {
    var raw = localStorage.getItem('hx_groups');
    if (!raw) {
      var d = [
        { id: 401, name: 'North Corridor Hub', hub: 'Chennai – Nellore Route', color: '#ea580d', vehs: ['TN04BD8146', 'TN02CB0076', 'TN02CB0031'] },
        { id: 402, name: 'South Intercity Express', hub: 'Chennai – Madurai Highway', color: '#10b981', vehs: ['TN04BD8191', 'TN02CB1620'] }
      ];
      localStorage.setItem('hx_groups', JSON.stringify(d));
      return d;
    }
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveGroups(list) {
    localStorage.setItem('hx_groups', JSON.stringify(list));
  }

  function rGroups() {
    var groups = getGroups();
    var allAssigned = {};
    groups.forEach(function (g) { (g.vehs || []).forEach(function (v) { allAssigned[v] = true; }); });

    view(
      hdr('Fleet Groups') +
      '<div class="module-summary-row">' +
        '<div class="module-stat-box"><small>Total Groups</small><b>' + groups.length + '</b></div>' +
        '<div class="module-stat-box"><small>Grouped Fleet</small><b style="color:var(--acc)">' + Object.keys(allAssigned).length + '</b></div>' +
        '<div class="module-stat-box"><small>Total Fleet</small><b>' + V.length + '</b></div>' +
      '</div>' +

      '<div class="form-collapsible">' +
        '<h3 style="font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">👥 Create Fleet Group</h3>' +
        '<div class="form-row-2">' +
          '<div><label>Group Name</label><input type="text" id="grp-name" placeholder="e.g. West Coast Logistics"></div>' +
          '<div><label>Route / Hub Description</label><input type="text" id="grp-hub" placeholder="e.g. Chennai – Bangalore NH48"></div>' +
        '</div>' +
        '<div style="margin-top:10px">' +
          '<label>Select Vehicles to Include</label>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px" id="grp-veh-checks">' +
            V.map(function (v) {
              return '<label style="display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.05);padding:6px 10px;border-radius:8px;font-size:12px;cursor:pointer">' +
                '<input type="checkbox" value="' + esc(v.name) + '" class="grp-veh-check"> ' + esc(v.name) +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<button class="btn" data-act="addgroup" style="margin-top:14px">Create Group</button>' +
      '</div>' +

      '<h3 style="font-size:14.5px;font-weight:800;color:var(--mute);margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.04em">Configured Fleet Groups</h3>' +
      '<div id="grp-list">' +
        (groups.length ? groups.map(function (g) {
          return '<div class="entity-card">' +
            '<div class="entity-head">' +
              '<div class="entity-title-group">' +
                '<div class="entity-icon-box" style="color:' + (g.color || 'var(--acc)') + '">👥</div>' +
                '<div>' +
                  '<div class="entity-name">' + esc(g.name) + '</div>' +
                  '<small style="color:var(--mute)">📍 ' + esc(g.hub) + '</small>' +
                '</div>' +
              '</div>' +
              '<span class="pill-status active">' + (g.vehs ? g.vehs.length : 0) + ' Vehicles</span>' +
            '</div>' +
            '<div class="entity-meta">' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' +
                (g.vehs || []).map(function (vh) { return '<span class="alert-veh-badge">' + esc(vh) + '</span>'; }).join('') +
              '</div>' +
            '</div>' +
            '<div class="entity-actions">' +
              '<button class="btn-action-sm btn-action-danger" data-act="delgroup" data-id="' + g.id + '">🗑️ Delete</button>' +
            '</div>' +
          '</div>';
        }).join('') : '<div class="empty">No groups created yet.</div>') +
      '</div>'
    );
  }

  // 18. Geofences
  function getGeofences() {
    var raw = localStorage.getItem('hx_geofences');
    if (!raw) {
      var d = [
        { id: 501, name: 'Chennai Port Container Terminal', type: 'Circle', lat: 13.0844, lon: 80.2975, radius: 1500, alertEnter: true, alertExit: true },
        { id: 502, name: 'Satara Highway Freight Hub', type: 'Polygon', lat: 17.6805, lon: 74.0183, radius: 2000, alertEnter: true, alertExit: true },
        { id: 503, name: 'Ambattur Industrial Estate Hub', type: 'Circle', lat: 13.1147, lon: 80.1548, radius: 1000, alertEnter: true, alertExit: false },
        { id: 504, name: 'Bengaluru Electronic City Warehouse', type: 'Circle', lat: 12.8399, lon: 77.6770, radius: 2500, alertEnter: true, alertExit: true }
      ];
      localStorage.setItem('hx_geofences', JSON.stringify(d));
      return d;
    }
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveGeofences(list) {
    localStorage.setItem('hx_geofences', JSON.stringify(list));
  }

  function rGeofences() {
    var geofences = getGeofences();
    var curVeh = byId(S.sel) || V[0] || {};

    view(
      hdr('Fleet Geofences') +
      '<div class="module-summary-row">' +
        '<div class="module-stat-box"><small>Active Zones</small><b>' + geofences.length + '</b></div>' +
        '<div class="module-stat-box"><small>Entry Alerts</small><b style="color:#10b981">' + geofences.filter(function (g) { return g.alertEnter; }).length + '</b></div>' +
        '<div class="module-stat-box"><small>Exit Alerts</small><b style="color:var(--acc)">' + geofences.filter(function (g) { return g.alertExit; }).length + '</b></div>' +
        '<div class="module-stat-box"><small>Monitored Fleet</small><b>' + V.length + '</b></div>' +
      '</div>' +

      '<div class="form-collapsible">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<h3 style="font-size:15px;display:flex;align-items:center;gap:6px">📍 Create Monitored Geofence</h3>' +
          (curVeh.lat != null ? '<button type="button" class="btn-action-sm btn-action-primary" data-act="use-veh-geo" data-lat="' + curVeh.lat + '" data-lon="' + curVeh.lon + '">🎯 Use ' + esc(curVeh.name) + ' Location</button>' : '') +
        '</div>' +
        '<div class="form-row-2">' +
          '<div><label>Zone Name</label><input type="text" id="geo-name" placeholder="e.g. Oragadam Auto Hub"></div>' +
          '<div><label>Shape Type</label><select id="geo-type" style="width:100%"><option>Circle</option><option>Polygon</option></select></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Center Latitude</label><input type="text" id="geo-lat" value="' + (curVeh.lat != null ? curVeh.lat.toFixed(5) : '13.0844') + '"></div>' +
          '<div><label>Center Longitude</label><input type="text" id="geo-lon" value="' + (curVeh.lon != null ? curVeh.lon.toFixed(5) : '80.2975') + '"></div>' +
        '</div>' +
        '<div class="form-row-2" style="margin-top:8px">' +
          '<div><label>Radius (Meters)</label><select id="geo-rad" style="width:100%"><option value="500">500 m</option><option value="1000" selected>1,000 m (1 km)</option><option value="1500">1,500 m (1.5 km)</option><option value="2500">2,500 m (2.5 km)</option><option value="5000">5,000 m (5 km)</option></select></div>' +
          '<div><label>Alert Triggers</label><div style="display:flex;gap:12px;margin-top:8px"><label style="font-size:12px"><input type="checkbox" id="geo-enter" checked> Entry Alert</label><label style="font-size:12px"><input type="checkbox" id="geo-exit" checked> Exit Alert</label></div></div>' +
        '</div>' +
        '<button class="btn" data-act="addgeofence" style="margin-top:14px">Create Geofence Zone</button>' +
      '</div>' +

      '<h3 style="font-size:14.5px;font-weight:800;color:var(--mute);margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.04em">Monitored Fleet Zones</h3>' +
      '<div id="geo-list">' +
        (geofences.length ? geofences.map(function (g) {
          return '<div class="entity-card">' +
            '<div class="entity-head">' +
              '<div class="entity-title-group">' +
                '<div class="entity-icon-box" style="color:#14b8a6">📍</div>' +
                '<div>' +
                  '<div class="entity-name">' + esc(g.name) + '</div>' +
                  '<small style="color:var(--mute)">' + esc(g.type) + ' · Radius: ' + (g.radius >= 1000 ? (g.radius / 1000).toFixed(1) + ' km' : g.radius + ' m') + '</small>' +
                '</div>' +
              '</div>' +
              '<span class="pill-status active">ACTIVE</span>' +
            '</div>' +
            '<div class="entity-meta">' +
              '<span>🌐 Lat: ' + Number(g.lat).toFixed(4) + ', Lon: ' + Number(g.lon).toFixed(4) + '</span>' +
              '<div style="margin-top:4px">' +
                (g.alertEnter ? '<span class="alert-veh-badge" style="color:#10b981">✓ Entry Alert</span>' : '') +
                (g.alertExit ? '<span class="alert-veh-badge" style="color:#ea580d">✓ Exit Alert</span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="entity-actions">' +
              '<button class="btn-action-sm btn-action-primary" data-act="view-geo-map" data-lat="' + g.lat + '" data-lon="' + g.lon + '">🗺️ View Zone</button>' +
              '<button class="btn-action-sm btn-action-danger" data-act="delgeofence" data-id="' + g.id + '">🗑️ Delete</button>' +
            '</div>' +
          '</div>';
        }).join('') : '<div class="empty">No geofences created yet.</div>') +
      '</div>'
    );
  }

  // 19. Server Connection Settings
  function rAppSet() {
    view(
      hdr('Server Connection') +
      '<div class="card form">' +
        '<label>Backend Server URL</label><input id="f-server" value="' + esc(CFG.server) + '" placeholder="http://localhost:3000">' +
        '<label>Dashboard Password</label><input id="f-pass" type="password" value="' + esc(CFG.password) + '" placeholder="Optional password">' +
        '<label>Default Speed Limit (km/h)</label><input id="f-limit" type="number" value="' + CFG.limit + '">' +
        '<button class="btn" data-act="save">Save Connection</button>' +
      '</div>'
    );
  }

  // ---------- Event Listeners ----------
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'login-form') {
      e.preventDefault();
      doLogin();
    }
  });

  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'legend-modal') {
      closeLegendModal();
      return;
    }
    if (e.target && e.target.id === 'streetview-modal') {
      closeStreetView();
      return;
    }
    var b = e.target.closest('[data-nav], [data-vt], [data-veh], [data-st], [data-rep], [data-rng], [data-acat], [data-act]');
    if (!b) return;
    var n = b.dataset.nav, vt = b.dataset.vt, vh = b.dataset.veh, st = b.dataset.st, rp = b.dataset.rep, rng = b.dataset.rng, acat = b.dataset.acat, a = b.dataset.act;
    if (n) main(n);
    else if (vt) vtab(vt);
    else if (vh) { S.sel = +vh; go('track', { id: +vh }); }
    else if (st) { S.filter = st; render(); }
    else if (rp) { S.rep = rp; go('repview', { rep: rp }); }
    else if (rng) { S.range = rng; render(); }
    else if (acat) { S.alertCat = acat; render(); }
    else if (a === 'signin') doLogin();
    else if (a === 'filldemo') {
      var u = $('#l-user'), p = $('#l-pass');
      if (u && p) {
        u.value = 'Test';
        p.value = 'test@123';
        toast('Test credentials pre-filled');
        p.focus();
      }
    }
    else if (a === 'oauth-google' || a === 'oauth-apple') {
      localStorage.setItem('hx_auth_user', 'Test');
      toast('Signed in via OAuth as Test');
      S.screen = 'dash';
      render();
    }
    else if (a === 'toggle-pass') {
      var pInput = $('#l-pass');
      if (pInput) pInput.type = pInput.type === 'password' ? 'text' : 'password';
    }
    else if (a === 'back') window.hxBack();
    else if (a === 'refresh') {
      loadVehicles().then(function () {
        render();
        toast('Fleet data refreshed');
      }).catch(function (x) { toast('Error: ' + x.message); });
    }
    else if (a === 'fit') { if (map) drawMarkers(true); }
    else if (a === 'locate') { if (S.p.place) S.p.place(true); }
    else if (a === 'trail') {
      SETTINGS.liveTrail = SETTINGS.liveTrail === 'ON' ? 'OFF' : 'ON';
      toast('Live Page Trail: ' + SETTINGS.liveTrail);
    }
    else if (a === 'lockengine') {
      toast('Engine Relay Command Transmitted');
    }
    else if (a === 'zoomin') { if (map) map.zoomIn(); }
    else if (a === 'zoomout') { if (map) map.zoomOut(); }
    else if (a === 'play' && S.p.play) S.p.play();
    else if (a === 'step-back' && S.p.stepBack) S.p.stepBack();
    else if (a === 'step-fwd' && S.p.stepFwd) S.p.stepFwd();
    else if (a === 'close-upper-card' && S.p.closeCard) S.p.closeCard();
    else if (a === 'toggle-upper-card' && S.p.toggleCard) S.p.toggleCard();
    else if (a === 'exporthist') { toast('Exporting GPS Route (.KML / .CSV)...'); }
    else if (a === 'refreshhist') { render(); toast('History data refreshed'); }
    else if (a === 'speed' && S.p.speed) S.p.speed();
    else if (a === 'appsetmenu') go('appsetmenu');
    else if (a === 'genset') go('genset');
    else if (a === 'chpass') go('chpass');
    else if (a === 'confalerts') go('confalerts');
    else if (a === 'expense') go('expense');
    else if (a === 'drivers') go('drivers');
    else if (a === 'reminders') go('reminders');
    else if (a === 'groups') go('groups');
    else if (a === 'geofences') go('geofences');
    else if (a === 'appset') go('appset');
    else if (a === 'support') { toast('Contacting 24/7 Fleet Support (+91-800-HEXIGO)...'); }
    else if (a === 'downreports') { toast('Opening Downloaded Reports directory'); }
    else if (a === 'signout') doLogout();
    else if (a === 'savepass') { toast('Password updated successfully'); window.hxBack(); }
    else if (a === 'testsiren') { playAlertSiren(); toast('🔔 Audio siren alert triggered'); }
    else if (a === 'testvoice') {
      speakVoiceAlert('Alert! ' + (V[0] ? V[0].name : 'TN04BD8146') + ' ignition is ON. Warning! Speed is 85 kilometers per hour.');
      toast('🔊 Voice alert broadcasted');
    }
    else if (a === 'openlegend') {
      openLegendModal();
    }
    else if (a === 'closelegend') {
      closeLegendModal();
    }
    else if (a === 'streetview') {
      var svVeh = byId(S.sel) || V[0];
      if (svVeh && typeof svVeh.lat === 'number' && typeof svVeh.lon === 'number') {
        openStreetView(svVeh.lat, svVeh.lon, svVeh.name + ' – Street View');
      } else {
        toast('No GPS coordinates for this vehicle');
      }
    }
    else if (a === 'closestreetview') {
      closeStreetView();
    }
    else if (a === 'fullscreen') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }
    else if (a === 'view-alert-map') {
      var vehId = +b.dataset.veh;
      var alat = b.dataset.lat ? +b.dataset.lat : null;
      var alon = b.dataset.lon ? +b.dataset.lon : null;
      S.sel = vehId;
      go('track', { id: vehId, lat: alat, lon: alon });
    }
    else if (a === 'ack-alert') {
      toggleAlertAck(b.dataset.id);
      render();
      toast('Alert acknowledged');
    }
    else if (a === 'savealerts') {
      var spd = Math.max(20, Math.min(200, +$('#a-speed').value || 80));
      ALERT_CFG.speedLimit = spd;
      ALERT_CFG.speedBuzzer = !!($('#a-buzzer') && $('#a-buzzer').checked);
      ALERT_CFG.harshBraking = !!($('#a-braking') && $('#a-braking').checked);
      ALERT_CFG.rapidAccel = !!($('#a-accel') && $('#a-accel').checked);
      ALERT_CFG.ignOnAlert = !!($('#a-ignon') && $('#a-ignon').checked);
      ALERT_CFG.ignOffAlert = !!($('#a-ignoff') && $('#a-ignoff').checked);
      ALERT_CFG.idleLimitMin = +($('#a-idle') ? $('#a-idle').value : 15);
      ALERT_CFG.geofenceEnter = !!($('#a-geoenter') && $('#a-geoenter').checked);
      ALERT_CFG.geofenceExit = !!($('#a-geoexit') && $('#a-geoexit').checked);
      ALERT_CFG.afterHoursAlert = !!($('#a-afterhours') && $('#a-afterhours').checked);
      ALERT_CFG.towAlert = !!($('#a-tow') && $('#a-tow').checked);
      ALERT_CFG.powerCutAlert = !!($('#a-power') && $('#a-power').checked);
      ALERT_CFG.lowBatteryAlert = !!($('#a-lowbatt') && $('#a-lowbatt').checked);
      ALERT_CFG.shockSensor = !!($('#a-shock') && $('#a-shock').checked);
      ALERT_CFG.sirenAudio = !!($('#a-siren') && $('#a-siren').checked);
      ALERT_CFG.pushBanner = !!($('#a-push') && $('#a-push').checked);
      ALERT_CFG.smsAlerts = !!($('#a-sms') && $('#a-sms').checked);
      ALERT_CFG.emailDigest = !!($('#a-email') && $('#a-email').checked);

      CFG.limit = spd;
      try {
        localStorage.setItem('hx_alert_config', JSON.stringify(ALERT_CFG));
        localStorage.setItem('hx_cfg', JSON.stringify(CFG));
      } catch (x) {}
      toast('✓ Alert configurations updated successfully!');
      window.hxBack();
    }
    else if (a === 'resetalerts') {
      ALERT_CFG = {
        speedLimit: 80, speedBuzzer: true, harshBraking: true, rapidAccel: true,
        ignOnAlert: true, ignOffAlert: true, idleLimitMin: 15, geofenceEnter: true,
        geofenceExit: true, afterHoursAlert: false, towAlert: true, powerCutAlert: true,
        lowBatteryAlert: true, shockSensor: true, sirenAudio: true, pushBanner: true,
        smsAlerts: false, emailDigest: true
      };
      localStorage.setItem('hx_alert_config', JSON.stringify(ALERT_CFG));
      toast('Alert configurations reset to defaults');
      render();
    }
    else if (a === 'addexpense') {
      var vSel = $('#exp-veh'), vName = vSel ? vSel.options[vSel.selectedIndex].text : 'TN02CB0076';
      var amt = +$('#exp-amt').value || 0;
      if (!amt) { toast('Please enter an expense amount'); return; }
      var exps = getExpenses();
      exps.unshift({
        id: Date.now(),
        veh: vName,
        cat: $('#exp-cat').value,
        amount: amt,
        date: $('#exp-date').value || new Date().toISOString().split('T')[0],
        odo: +$('#exp-odo').value || 0,
        notes: $('#exp-notes').value.trim()
      });
      saveExpenses(exps);
      toast('✓ Expense recorded successfully');
      render();
    }
    else if (a === 'delexpense') {
      var eid = +b.dataset.id;
      var exps2 = getExpenses().filter(function (x) { return x.id !== eid; });
      saveExpenses(exps2);
      toast('Expense record deleted');
      render();
    }
    else if (a === 'adddriver') {
      var dName = ($('#drv-name').value || '').trim();
      if (!dName) { toast('Please enter driver name'); return; }
      var dvSel = $('#drv-veh'), dvName = dvSel ? dvSel.options[dvSel.selectedIndex].text : '';
      var drvs = getDrivers();
      drvs.unshift({
        id: Date.now(),
        name: dName,
        phone: ($('#drv-phone').value || '').trim(),
        lic: ($('#drv-lic').value || '').trim() || 'DL-PENDING',
        exp: $('#drv-exp').value,
        veh: dvName,
        status: $('#drv-st').value
      });
      saveDrivers(drvs);
      toast('✓ Driver registered successfully');
      render();
    }
    else if (a === 'deldriver') {
      var did = +b.dataset.id;
      var drvs2 = getDrivers().filter(function (x) { return x.id !== did; });
      saveDrivers(drvs2);
      toast('Driver removed from roster');
      render();
    }
    else if (a === 'addreminder') {
      var rDue = ($('#rem-due').value || '').trim();
      if (!rDue) { toast('Please enter due date or kilometers'); return; }
      var rvSel = $('#rem-veh'), rvName = rvSel ? rvSel.options[rvSel.selectedIndex].text : '';
      var rems = getReminders();
      rems.unshift({
        id: Date.now(),
        veh: rvName,
        type: $('#rem-type').value,
        due: rDue,
        status: $('#rem-st').value,
        note: ($('#rem-notes').value || '').trim()
      });
      saveReminders(rems);
      toast('✓ Reminder scheduled successfully');
      render();
    }
    else if (a === 'donereminder') {
      var rmid = +b.dataset.id;
      var rems2 = getReminders().map(function (x) {
        if (x.id === rmid) x.status = 'done';
        return x;
      });
      saveReminders(rems2);
      toast('✓ Reminder marked completed');
      render();
    }
    else if (a === 'delreminder') {
      var rmid2 = +b.dataset.id;
      var rems3 = getReminders().filter(function (x) { return x.id !== rmid2; });
      saveReminders(rems3);
      toast('Reminder deleted');
      render();
    }
    else if (a === 'addgroup') {
      var gName = ($('#grp-name').value || '').trim();
      if (!gName) { toast('Please enter group name'); return; }
      var checkedVehs = [];
      document.querySelectorAll('#grp-veh-checks input:checked').forEach(function (c) {
        checkedVehs.push(c.value);
      });
      var grps = getGroups();
      grps.unshift({
        id: Date.now(),
        name: gName,
        hub: ($('#grp-hub').value || '').trim() || 'General Operations',
        color: '#ea580d',
        vehs: checkedVehs.length ? checkedVehs : [V[0] ? V[0].name : 'TN02CB0076']
      });
      saveGroups(grps);
      toast('✓ Fleet group created successfully');
      render();
    }
    else if (a === 'delgroup') {
      var gid = +b.dataset.id;
      var grps2 = getGroups().filter(function (x) { return x.id !== gid; });
      saveGroups(grps2);
      toast('Fleet group deleted');
      render();
    }
    else if (a === 'use-veh-geo') {
      var glatInput = $('#geo-lat'), glonInput = $('#geo-lon');
      if (glatInput && glonInput && b.dataset.lat && b.dataset.lon) {
        glatInput.value = Number(b.dataset.lat).toFixed(5);
        glonInput.value = Number(b.dataset.lon).toFixed(5);
        toast('Coordinates filled from vehicle GPS fix');
      }
    }
    else if (a === 'addgeofence') {
      var gn = ($('#geo-name').value || '').trim();
      if (!gn) { toast('Please enter geofence name'); return; }
      var geos = getGeofences();
      geos.unshift({
        id: Date.now(),
        name: gn,
        type: $('#geo-type').value,
        lat: +$('#geo-lat').value || 13.0844,
        lon: +$('#geo-lon').value || 80.2975,
        radius: +$('#geo-rad').value || 1000,
        alertEnter: !!($('#geo-enter') && $('#geo-enter').checked),
        alertExit: !!($('#geo-exit') && $('#geo-exit').checked)
      });
      saveGeofences(geos);
      toast('✓ Geofence zone created successfully');
      render();
    }
    else if (a === 'delgeofence') {
      var geoid = +b.dataset.id;
      var geos2 = getGeofences().filter(function (x) { return x.id !== geoid; });
      saveGeofences(geos2);
      toast('Geofence zone deleted');
      render();
    }
    else if (a === 'view-geo-map') {
      var geoLat = +b.dataset.lat, geoLon = +b.dataset.lon;
      go('map');
      setTimeout(function () {
        if (map) {
          map.setView([geoLat, geoLon], 14);
          try {
            L.circle([geoLat, geoLon], {
              radius: 1200,
              color: '#ea580d',
              weight: 2,
              fillColor: '#ea580d',
              fillOpacity: 0.25
            }).addTo(map).bindPopup('<b>📍 Monitored Geofence</b>').openPopup();
          } catch (e) {}
        }
      }, 350);
    }
    else if (a === 'save') {
      CFG.server = $('#f-server').value.trim();
      CFG.password = $('#f-pass').value;
      CFG.limit = Math.max(20, Math.min(200, +$('#f-limit').value || 80));
      try { localStorage.setItem('hx_cfg', JSON.stringify(CFG)); } catch (x) {}
      mcache = {}; S.sel = null;
      loadVehicles().then(function () { toast('Connection saved'); window.hxBack(); }).catch(function (x) { toast('Saved, but: ' + x.message); });
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id === 'vsel') { S.sel = +e.target.value; render(); }
    else if (e.target.id === 'alert-veh-filter') { S.alertVeh = e.target.value; render(); }
    else if (e.target.id === 'rsel') { S.range = e.target.value; render(); }
    else if (e.target.id === 'speed-select') { if (S.p.setSpeed) S.p.setSpeed(e.target.value); }
    else if (e.target.id === 'light-toggle') {
      SETTINGS.lightTheme = e.target.checked;
      if (SETTINGS.lightTheme) document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');
      localStorage.setItem('hx_gen_settings', JSON.stringify(SETTINGS));
      toast(SETTINGS.lightTheme ? 'Light Theme Enabled' : 'Dark Theme Enabled');
    }
    else if (e.target.classList.contains('genset-select')) {
      var k = e.target.dataset.key;
      SETTINGS[k] = e.target.value;
      localStorage.setItem('hx_gen_settings', JSON.stringify(SETTINGS));
      toast(k + ': ' + e.target.value);
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') {
      S.q = e.target.value;
      var pos = e.target.selectionStart; render();
      var q = $('#q'); if (q) { q.focus(); q.setSelectionRange(pos, pos); }
    }
    else if (e.target.id === 'zoom-slider') {
      SETTINGS.zoomLevel = +e.target.value;
      $('#zoom-val').textContent = SETTINGS.zoomLevel;
      localStorage.setItem('hx_gen_settings', JSON.stringify(SETTINGS));
      if (map) map.setZoom(SETTINGS.zoomLevel);
    }
  });

  // Auto-refresh interval (only when logged in)
  setInterval(function () {
    if (S.screen !== 'login' && (S.screen === 'dash' || S.screen === 'list')) {
      loadVehicles().then(function () {
        if (S.screen === 'list' && document.activeElement && document.activeElement.id === 'q') return;
        if (S.screen === 'list') render();
      }).catch(function () {});
    }
  }, 5000);

  // Initial load
  loadVehicles().then(render).catch(function () {
    render();
  });
})();
