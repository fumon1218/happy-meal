/* 행복한 급식 · 공통 도구 (설정, 소리, 읽어주기, 저장, 작은 도우미) */
(function (g) {
  'use strict';
  var HM = g.HM = g.HM || {};
  HM.FAST = /[?&]dev=fast/.test(location.search);
  HM.el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  HM.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  HM.rand = function (n) { return Math.random() * n | 0; };
  HM.pick = function (a) { return a[HM.rand(a.length)]; };
  HM.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  HM.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = HM.rand(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  /* 은/는 · 이/가 */
  HM.josa = function (w, a, b) { var c = String(w).charCodeAt(String(w).length - 1); var has = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 > 0; return w + (has ? a : b); };
  HM.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms / (HM.FAST ? 4 : 1)); }); };

  /* 저장 (이 기기에만) */
  HM.jget = function (k, d) { try { var v = localStorage.getItem('hm_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  HM.jset = function (k, v) { try { localStorage.setItem('hm_' + k, JSON.stringify(v)); } catch (e) { } };

  /* 설정 */
  var DEF = { sound: true, voice: true, calm: false, slow: false, scan: false };
  HM.settings = function () { var s = HM.jget('settings', {}); var o = {}; for (var k in DEF) o[k] = s[k] == null ? DEF[k] : s[k]; if (!o.calm && g.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) o.calm = true; return o; };
  HM.setSetting = function (k, v) { var s = HM.jget('settings', {}); s[k] = v; HM.jset('settings', s); HM.applySettings(); };
  HM.applySettings = function () { var s = HM.settings(); document.body.classList.toggle('calm', !!s.calm); document.body.classList.toggle('scan', !!s.scan); };
  /* 보조 모드: 쉬운 수준이거나 느리게·스위치를 켰을 때 */
  HM.assisted = function (lv) { var s = HM.settings(); return lv <= 2 || s.scan || s.slow; };

  /* 소리 */
  var AC = null;
  function ctx() { if (!AC) { try { AC = new (g.AudioContext || g.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  var TONES = { ok: [[660, .09], [880, .12]], no: [[300, .12], [240, .14]], pop: [[520, .05], [700, .06]], tick: [[440, .04]], coin: [[880, .07], [1320, .1]], win: [[523, .1], [659, .1], [784, .1], [1046, .22]], splash: [[300, .08], [200, .1]], bell: [[988, .12], [1319, .2]] };
  HM.sfx = function (name) {
    if (!HM.settings().sound) return; var a = ctx(), t = TONES[name]; if (!a || !t) return;
    var at = a.currentTime;
    t.forEach(function (n) {
      var o = a.createOscillator(), gn = a.createGain(); o.type = name === 'no' ? 'triangle' : 'sine'; o.frequency.value = n[0];
      gn.gain.setValueAtTime(.0001, at); gn.gain.exponentialRampToValueAtTime(.18, at + .01); gn.gain.exponentialRampToValueAtTime(.0001, at + n[1]);
      o.connect(gn); gn.connect(a.destination); o.start(at); o.stop(at + n[1] + .02); at += n[1] * .9;
    });
  };
  HM.unlock = function () { ctx(); };

  /* 읽어 주기 */
  var lastSay = '';
  HM.say = function (text, o) {
    o = o || {}; if (!HM.settings().voice || !g.speechSynthesis) return;
    if (o.noRepeat && lastSay === text) return; lastSay = text;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = HM.settings().slow ? .8 : .95; speechSynthesis.speak(u); } catch (e) { }
  };
  HM.toast = function (t, ms) {
    var old = document.querySelector('.hm-toast'); if (old) old.remove();
    var e = HM.el('div', 'hm-toast', HM.esc(t)); document.body.appendChild(e); setTimeout(function () { e.remove(); }, ms || 1800);
  };
  /* 누르기 한 번 (화면·스페이스·엔터·↑) */
  var mainFn = null;
  HM.onMain = function (fn) { mainFn = fn; };
  HM.pressMain = function () { if (mainFn) mainFn(); };
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('.hm-modal')) return;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { if (e.target.tagName === 'BUTTON' && e.key !== 'ArrowUp') return; if (mainFn) { e.preventDefault(); if (!e.repeat) mainFn(); } }
  });
  /* 반짝이는 안내 표시 */
  HM.glow = function (el) { document.querySelectorAll('.hm-glow').forEach(function (x) { x.classList.remove('hm-glow'); }); if (el) el.classList.add('hm-glow'); };
})(window);
