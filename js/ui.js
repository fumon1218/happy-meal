/* 행복한 급식 · 식판, 주문 카드, 한 판의 공통 틀 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;

  /* ---------- 식판 ---------- */
  HM.Tray = function () {
    var root = E('div', 'hm-tray');
    root.innerHTML = '<div class="tray-plate"><div class="tray-slot rice" data-s="rice"><b>밥</b></div><div class="tray-slot soup" data-s="soup"><b>국</b></div>' +
      '<div class="tray-slot small s1" data-s="s1"><b>반찬</b></div><div class="tray-slot small s2" data-s="s2"><b>반찬</b></div>' +
      '<div class="tray-slot small s3" data-s="s3"><b>반찬</b></div><div class="tray-slot small s4" data-s="s4"><b>후식</b></div></div>' +
      '<div class="tray-slot drink" data-s="drink"><b>우유</b></div>';
    if (HM.art.has('ui:tray')) { root.classList.add('has-art'); root.querySelector('.tray-plate').style.backgroundImage = 'url(' + HM.art.path('ui:tray') + ')'; }
    var counts = {}, slotOfId = {};
    /* 종류별 칸: 밥=큰칸, 국=중간칸, 반찬=작은칸 3개(차례로), 과일·후식=작은칸 4번째, 우유=옆칸 */
    function slotOf(f) {
      var key = slotOfId[f.id];
      if (!key) {
        if (f.cat === 'rice' || f.cat === 'soup' || f.cat === 'drink') key = f.cat;
        else if (f.cat === 'fruit') key = 's4';
        else { key = 's1'; ['s1', 's2', 's3'].some(function (k) { var s = root.querySelector('[data-s="' + k + '"]'); if (!s.querySelector('.tray-food')) { key = k; return true; } return false; }); }
        slotOfId[f.id] = key;
      }
      return root.querySelector('.tray-slot[data-s="' + key + '"]');
    }
    var T = {
      el: root, counts: counts,
      add: function (f) {
        var s = slotOf(f), it = s.querySelector('[data-f="' + f.id + '"]');
        counts[f.id] = (counts[f.id] || 0) + 1;
        if (!it) { it = E('span', 'tray-food', HM.art.food(f)); it.dataset.f = f.id; s.appendChild(it); s.classList.add('filled'); }
        var badge = it.querySelector('.cnt'); if (counts[f.id] > 1) { if (!badge) { badge = E('i', 'cnt'); it.appendChild(badge); } badge.textContent = '×' + counts[f.id]; }
        it.classList.remove('drop'); void it.offsetWidth; it.classList.add('drop');
      },
      slotRect: function (f) { return slotOf(f).getBoundingClientRect(); },
      /* 날아가서 식판에 담기 */
      fly: function (f, from, done) {
        var fr = from && from.getBoundingClientRect ? from.getBoundingClientRect() : from;
        if (!fr || HM.settings().calm) { T.add(f); if (done) done(); return; }
        var to = T.slotRect(f), c = E('div', 'fly-food', HM.art.food(f));
        c.style.left = fr.left + fr.width / 2 + 'px'; c.style.top = fr.top + fr.height / 2 + 'px'; document.body.appendChild(c);
        void c.offsetWidth; c.style.transition = 'left .55s cubic-bezier(.3,.1,.3,1), top .55s cubic-bezier(.3,.1,.3,1), transform .55s';
        c.style.left = to.left + to.width / 2 + 'px'; c.style.top = to.top + to.height / 2 + 'px'; c.style.transform = 'translate(-50%,-50%) scale(.8)';
        setTimeout(function () { c.remove(); T.add(f); if (done) done(); }, 560 / (HM.FAST ? 4 : 1));
      }
    };
    return T;
  };

  /* ---------- 주문 카드 (남은 개수 표시) ---------- */
  HM.OrderPanel = function (order) {
    var root = E('div', 'hm-order'), got = {};
    var bub = E('div', 'ord-friend', '<span class="ord-av">' + HM.art.friend(order.friend, false) + '</span><b>' + HM.esc(order.friend.name) + '</b>');
    root.appendChild(bub);
    var row = E('div', 'ord-items'); root.appendChild(row);
    var chips = {};
    order.items.forEach(function (it) {
      var f = HM.food(it.id), c = E('div', 'ord-chip', '<span class="ord-ic">' + HM.art.food(f) + '</span><span class="ord-name">' + HM.esc(f.name) + '</span><span class="ord-n"></span>');
      chips[it.id] = c; row.appendChild(c);
    });
    if (order.avoid.length) {
      root.appendChild(E('div', 'ord-avoid', '🚫 ' + order.avoid.map(function (id) { return HM.esc(HM.food(id).name); }).join(', ') + ' 못 먹어요'));
    }
    var P = {
      el: root,
      got: function (id) { return got[id] || 0; },
      want: function (id) { for (var i = 0; i < order.items.length; i++) if (order.items[i].id === id) return order.items[i].n; return 0; },
      remain: function (id) { return Math.max(0, P.want(id) - P.got(id)); },
      draw: function () {
        order.items.forEach(function (it) {
          var c = chips[it.id], g0 = P.got(it.id), done = g0 >= it.n;
          c.classList.toggle('done', done); c.querySelector('.ord-n').textContent = done ? '✅' : (it.n > 1 ? g0 + '/' + it.n : '');
          if (!done && it.n === 1) c.querySelector('.ord-n').textContent = '';
        });
      },
      add: function (id) { got[id] = (got[id] || 0) + 1; P.draw(); var c = chips[id]; if (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } },
      isDone: function () { return order.items.every(function (it) { return P.got(it.id) >= it.n; }); },
      needIds: function () { return order.items.filter(function (it) { return P.remain(it.id) > 0; }).map(function (it) { return it.id; }); }
    };
    P.draw(); return P;
  };

  /* ---------- 재료 모으기 한 판의 공통 틀 ---------- */
  /* run: 게임에게 줄 ctx 를 만들고, 주문이 다 차면 끝나는 약속(Promise)을 돌려줘요 */
  HM.collect = function (host, order, level, game) {
    host.innerHTML = '';
    var assisted = HM.assisted(level), stats = { mistakes: 0, taken: 0 };
    var panel = HM.OrderPanel(order), tray = HM.Tray();
    var stage = E('div', 'hm-stage ' + game.id), banner = E('div', 'hm-banner'), main = E('button', 'hm-main', '');
    main.type = 'button'; main.hidden = true;
    var bottom = E('div', 'hm-bottom'); bottom.appendChild(tray.el); bottom.appendChild(main);
    host.appendChild(panel.el); host.appendChild(stage); stage.appendChild(banner); host.appendChild(bottom);
    HM.art.bg(stage, game.id);
    var timers = [], stopped = false, finish;
    var done = new Promise(function (r) { finish = r; });
    var ctx = {
      stage: stage, order: order, level: level, assisted: assisted, panel: panel, tray: tray, stats: stats,
      calm: HM.settings().calm, slowK: HM.settings().slow ? .7 : 1,
      W: function () { return stage.clientWidth; }, H: function () { return stage.clientHeight; },
      stopped: function () { return stopped; },
      need: function (id) { return panel.remain(id); },
      needIds: function () { return panel.needIds(); },
      decoys: function () {
        var need = panel.needIds(), pool = HM.FOODS.filter(function (f) { return need.indexOf(f.id) < 0; });
        order.avoid.forEach(function (id) { pool.push(HM.food(id), HM.food(id)); });
        return pool;
      },
      isDone: function () { return panel.isDone(); },
      say: function (t, ms) { banner.textContent = t; banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); clearTimeout(ctx._bt); ctx._bt = setTimeout(function () { banner.classList.remove('show'); }, (ms || 1400) / (HM.FAST ? 4 : 1)); },
      later: function (fn, ms) { var h = setTimeout(function () { if (!stopped) fn(); }, ms / (HM.FAST ? 4 : 1)); timers.push(h); return h; },
      /* 음식을 하나 잡았을 때: 알맞으면 식판에 담고 true, 아니면 부드럽게 알려 주고 false */
      take: function (id, from, soft) {
        var f = HM.food(id);
        if (panel.remain(id) > 0) {
          panel.add(id); stats.taken++; HM.sfx('ok'); HM.say(f.name, { noRepeat: false });
          tray.fly(f, from);
          if (panel.isDone()) { stopped = true; main.hidden = true; HM.onMain(null); setTimeout(function () { finish(stats); }, 900 / (HM.FAST ? 4 : 1)); }
          return true;
        }
        if (!soft) stats.mistakes++;
        HM.sfx('no');
        var why = order.avoid.indexOf(id) >= 0 ? HM.josa(f.name, '은', '는') + ' 못 먹어요!' : '이건 주문하지 않았어요';
        ctx.say(why, 1300); HM.say(why, { noRepeat: true });
        return false;
      },
      setMain: function (label, fn) {
        if (!fn) { main.hidden = true; HM.onMain(null); return; }
        main.hidden = false; main.textContent = label; main.onclick = function () { HM.unlock(); fn(); }; HM.onMain(function () { if (!stopped) fn(); });
      },
      glowMain: function (on) { main.classList.toggle('hm-glow', !!on); },
      stop: function () { stopped = true; timers.forEach(clearTimeout); HM.onMain(null); }
    };
    ctx.promise = done;
    ctx.raf = function (step) {   /* 매 프레임 호출 (빠른 모드에서는 4배) */
      var last = performance.now(), id = 0;
      function frame(t) {
        if (stopped) return; id = requestAnimationFrame(frame); var dt = Math.min(.05, (t - last) / 1000 || 0); last = t; if (document.hidden) return;
        for (var k = 0; k < (HM.FAST ? 4 : 1); k++) step(dt);
      }
      id = requestAnimationFrame(frame);
    };
    game.start(ctx);
    return { ctx: ctx, done: done, tray: tray, stop: ctx.stop };
  };
})(window);
