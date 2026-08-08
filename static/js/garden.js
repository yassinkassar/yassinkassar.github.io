(function () {
  'use strict';
  var DENSITY = 2;            // simultaneous growing stems
  var BLOOM = '#43926b';      // flower colour
  var SLOW = true;            // half-speed growth; false for full speed

  var root = document.documentElement;
  var css = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');

  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    readColours(); boot(); drawRail();
  });

  var paper, stem;
  function readColours() {
    paper = css('--bg') || '#f8f5ef';
    stem = css('--moss') || '#43926b';
    var veil = document.querySelector('.hero-veil');
    if (veil) veil.style.background = 'linear-gradient(96deg, ' + paper + ' 20%, color-mix(in oklab, ' + paper + ' 82%, transparent) 44%, transparent 74%)';
  }

  var cv = document.getElementById('garden'), ctx, W, H, tips = [], blooms = [], raf;
  function seed(x) {
    if (tips.length > 90) return;
    tips.push({ x: x == null ? (0.25 + Math.random() * 0.73) * W : x, y: H + 6,
      a: -Math.PI / 2 + (Math.random() - 0.5) * 0.45, t: 1.4 + Math.random() * 1.2,
      life: 120 + Math.random() * 160, curl: (Math.random() - 0.5) * 0.022, gen: 0 });
  }
  function boot() {
    if (!cv) return;
    cancelAnimationFrame(raf);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || 1200; H = cv.clientHeight || 700;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
    tips = []; blooms = [];
    for (var i = 0; i < DENSITY; i++) seed(0.3 * W + Math.random() * 0.68 * W);
    if (reduced) { for (var j = 0; j < 1100; j++) step(); return; }
    var f = 0;
    (function loop() { if (!(SLOW && f++ % 2)) step(); raf = requestAnimationFrame(loop); })();
  }
  function step() {
    if (!ctx) return;
    ctx.fillStyle = paper; ctx.globalAlpha = 0.05; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    var next = []; ctx.lineCap = 'round';
    for (var i = 0; i < tips.length; i++) {
      var t = tips[i], px = t.x, py = t.y;
      t.a += t.curl + (Math.random() - 0.5) * 0.055;
      var sp = 1.4 + t.t * 0.55;
      t.x += Math.cos(t.a) * sp; t.y += Math.sin(t.a) * sp; t.life--; t.t *= 0.9965;
      ctx.strokeStyle = stem; ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.35, t.t);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(t.x, t.y); ctx.stroke(); ctx.globalAlpha = 1;
      if (t.life > 0 && t.y > -30 && t.x > -40 && t.x < W + 40) {
        if (t.gen < 3 && Math.random() < 0.013) next.push({ x: t.x, y: t.y,
          a: t.a + (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.5),
          t: t.t * 0.6, life: t.life * 0.55, curl: (Math.random() - 0.5) * 0.03, gen: t.gen + 1 });
        next.push(t);
      } else if (t.y > -30 && blooms.length < 70) {
        blooms.push({ x: t.x, y: t.y, r: 0.5, max: 3 + Math.random() * 7,
          n: 4 + ((Math.random() * 4) | 0), rot: Math.random() * 6.283, age: 0 });
      }
    }
    tips = next;
    blooms = blooms.filter(function (b) {
      b.age++; b.r += (b.max - b.r) * 0.07;
      ctx.fillStyle = BLOOM; ctx.globalAlpha = 0.48;
      for (var i = 0; i < b.n; i++) {
        var ang = b.rot + i * (6.283 / b.n);
        ctx.beginPath();
        ctx.ellipse(b.x + Math.cos(ang) * b.r * 0.72, b.y + Math.sin(ang) * b.r * 0.72, b.r * 0.6, b.r * 0.34, ang, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return b.age < 70;
    });
    if (tips.length < DENSITY * 2 && Math.random() < 0.032) seed();
  }
  var hero = document.querySelector('.hero');
  if (cv && hero) {
    hero.style.cursor = 'crosshair';
    hero.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.closest && e.target.closest('a,button')) return;
      var r = cv.getBoundingClientRect();
      seed(e.clientX - r.left); seed(e.clientX - r.left + (Math.random() - 0.5) * 44);
    });
  }

  var rail = document.getElementById('rail'), rcv = document.getElementById('rail-canvas'), rctx, RW, RH;
  function railBoot() {
    if (!rail || !rcv || getComputedStyle(rail).display === 'none') return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    RW = rcv.clientWidth || 30; RH = rcv.clientHeight || 600;
    rcv.width = Math.round(RW * dpr); rcv.height = Math.round(RH * dpr);
    rctx = rcv.getContext('2d'); rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawRail();
  }
  function drawRail() {
    if (!rctx || !rail || getComputedStyle(rail).display === 'none') return;
    var doc = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var prog = Math.min(1, Math.max(0, window.scrollY / doc));
    var cx = RW * 0.5, tip = prog * RH;
    rctx.clearRect(0, 0, RW, RH);
    rctx.strokeStyle = stem; rctx.globalAlpha = 0.2; rctx.lineWidth = 1;
    rctx.beginPath(); rctx.moveTo(cx, 0); rctx.lineTo(cx, RH); rctx.stroke();
    rctx.globalAlpha = 0.85; rctx.lineWidth = 1.6; rctx.lineCap = 'round';
    rctx.beginPath();
    for (var y = 0; y <= tip; y += 3) {
      var x = cx + Math.sin(y * 0.035) * 3.2;
      if (y === 0) rctx.moveTo(x, y); else rctx.lineTo(x, y);
    }
    rctx.stroke();
    for (var ly = 34; ly < tip - 8; ly += 76) {
      var lx = cx + Math.sin(ly * 0.035) * 3.2, dir = (Math.floor(ly / 76) % 2) ? 1 : -1;
      rctx.beginPath(); rctx.ellipse(lx + dir * 5, ly, 6, 2.4, dir * 0.55, 0, 6.283); rctx.stroke();
    }
    rctx.globalAlpha = 1;
    var doch = Math.max(1, document.documentElement.scrollHeight);
    rctx.fillStyle = BLOOM;
    ['writing', 'projects', 'about'].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      var my = (el.getBoundingClientRect().top + window.scrollY) / doch * RH;
      var grow = Math.min(1, Math.max(0, (tip - my) / 46));
      if (grow <= 0) return;
      var r = grow * 5.4, x = cx + Math.sin(my * 0.035) * 3.2;
      rctx.globalAlpha = 0.55 * grow + 0.25;
      for (var i = 0; i < 5; i++) {
        var ang = i * (6.283 / 5) + my;
        rctx.beginPath();
        rctx.ellipse(x + Math.cos(ang) * r * 0.72, my + Math.sin(ang) * r * 0.72, r * 0.62, r * 0.36, ang, 0, 6.283);
        rctx.fill();
      }
      rctx.globalAlpha = 1;
    });
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; drawRail(); });
  }, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { boot(); railBoot(); }, 250);
  });

  readColours(); boot(); railBoot();
})();
