/* 행복한 급식 · 자유 급식 — 먹고 싶은 음식을 끌어서 식판 어디든 자유롭게 놓아요 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el, esc = HM.esc;
  HM.freeMode = function (s, onStar) {
    var cat = 'rice', placed = [], z = 1, drag = null;
    var tabs = E('div', 'fr-tabs'), pal = E('div', 'fr-pal'), tray = E('div', 'free-tray'), info = E('div', 'fr-info', '음식을 끌어서 식판에 놓아요'), ctl = E('div', 'fr-ctl');
    tray.innerHTML = '<div class="free-plate"></div>';
    var plate = tray.firstChild;
    if (HM.art.has('ui:tray')) plate.style.backgroundImage = 'url(' + HM.art.path('ui:tray') + ')'; else plate.classList.add('plain');
    var wrap = E('div', 'fr-main'); wrap.appendChild(tray); wrap.appendChild(info);
    var clear = E('button', 'hm-btn', '🗑 비우기'), done = E('button', 'hm-btn primary', '🍽 다 담았어요!');
    clear.type = done.type = 'button'; ctl.appendChild(clear); ctl.appendChild(done);
    s.appendChild(wrap); s.appendChild(ctl); s.appendChild(tabs); s.appendChild(pal);

    Object.keys(HM.CATS).forEach(function (k) {
      var b = E('button', 'fr-tab', HM.CATS[k].emo + ' ' + HM.CATS[k].name); b.type = 'button'; b.dataset.c = k;
      b.onclick = function () { HM.unlock(); HM.sfx('tick'); cat = k; fill(); }; tabs.appendChild(b);
    });
    function fill() {
      [].forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.dataset.c === cat); });
      pal.innerHTML = '';
      HM.FOODS.filter(function (f) { return f.cat === cat; }).forEach(function (f) {
        var c = E('div', 'fr-card', '<span>' + HM.art.food(f) + '</span><b>' + esc(f.name) + '</b>'); c.dataset.f = f.id;
        c.addEventListener('pointerdown', function (e) { start(e, f, null); }); pal.appendChild(c);
      });
    }
    function inPlate(x, y) { var r = plate.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom ? r : null; }
    function start(e, f, item) {
      if (e.button > 0) return; e.preventDefault(); HM.unlock();
      var sz = tray.getBoundingClientRect().width * .24, gh = E('div', 'fly-food fr-ghost', HM.art.food(f));
      gh.style.width = gh.style.height = sz + 'px'; document.body.appendChild(gh);
      drag = { f: f, item: item, gh: gh, sx: e.clientX, sy: e.clientY, moved: false };
      if (item) item.el.classList.add('lifted');
      mv(e); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    function mv(e) { if (!drag) return; if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 6) drag.moved = true; drag.gh.style.left = e.clientX + 'px'; drag.gh.style.top = e.clientY + 'px'; tray.classList.toggle('over', !!inPlate(e.clientX, e.clientY)); }
    function up(e) {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      if (!drag) return; var d = drag; drag = null; d.gh.remove(); tray.classList.remove('over');
      var r = inPlate(e.clientX, e.clientY);
      if (d.item) {
        d.item.el.classList.remove('lifted');
        if (!d.moved) { HM.say(d.f.name); return; }                 /* 톡 누르면 이름 말하기 */
        if (r) { put(d.item, e, r); HM.sfx('tick'); } else { remove(d.item); HM.sfx('no'); }
      } else if (r) { var it = { f: d.f, el: E('span', 'free-food', HM.art.food(d.f)) }; it.el.addEventListener('pointerdown', function (ev) { start(ev, it.f, it); }); plate.appendChild(it.el); placed.push(it); put(it, e, r); HM.sfx('coin'); HM.say(d.f.name); }
      else if (!d.moved) HM.say(d.f.name);
      refresh();
    }
    function put(it, e, r) {
      var x = HM.clamp((e.clientX - r.left) / r.width * 100, 12, 88), y = HM.clamp((e.clientY - r.top) / r.height * 100, 14, 86);
      it.el.style.left = x + '%'; it.el.style.top = y + '%'; it.el.style.zIndex = ++z; it.el.classList.remove('drop'); void it.el.offsetWidth; it.el.classList.add('drop');
    }
    function remove(it) { it.el.remove(); placed.splice(placed.indexOf(it), 1); refresh(); }
    function refresh() { info.textContent = placed.length ? placed.length + '가지를 담았어요' : '음식을 끌어서 식판에 놓아요'; }
    clear.onclick = function () { HM.unlock(); placed.slice().forEach(remove); HM.sfx('tick'); };
    done.onclick = function () {
      HM.unlock(); if (!placed.length) { HM.say('먼저 음식을 식판에 놓아요'); info.textContent = '먼저 음식을 식판에 놓아요'; HM.sfx('no'); return; }
      var cats = {}, names = []; placed.forEach(function (p) { cats[p.f.cat] = 1; names.push(p.f.name); });
      var n = Object.keys(cats).length, good = cats.rice && cats.soup && cats.side && cats.fruit, msg;
      msg = good ? '밥, 국, 반찬, 과일을 골고루 담았어요! 멋져요!' : '맛있게 담았어요! ' + (!cats.side ? '반찬도 담아 볼까요?' : !cats.rice ? '밥도 담아 볼까요?' : '골고루 담아 볼까요?');
      HM.sfx('win'); info.innerHTML = '<b>' + esc(names.join(', ')) + '</b><br>' + esc(msg) + (good ? ' ⭐' : ''); HM.say(msg);
      if (good && onStar) onStar();
    };
    fill();
  };
})(window);
