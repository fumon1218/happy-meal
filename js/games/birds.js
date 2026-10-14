/* 새 배달 — 새들이 음식을 물고 날아와요. 주문한 음식을 문 새를 잡아요 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  var COUNT = [3, 4, 4, 5, 6], SPEED = [.07, .09, .125, .16, .2];
  HM.games = HM.games || {};
  HM.games.birds = {
    id: 'birds', skill: 'sort', name: '새 배달', emo: '🐦', desc: '주문한 음식을 문 새를 눌러 잡아요.',
    start: function (ctx) {
      var stage = ctx.stage, lv = ctx.level, birds = [], seq = 0;
      var speed = SPEED[lv - 1] * ctx.slowK * (ctx.assisted ? .8 : 1);
      ctx.say('주문한 음식을 문 새를 눌러요', 1800);
      function size() { return HM.clamp(ctx.W() * .13, 78, 120); }
      function has(id) { return birds.some(function (b) { return b.id === id && !b.dead; }); }
      function spawn(id, startX) {
        if (!id) { var need = ctx.needIds(), dec = ctx.decoys(); id = (Math.random() < .35 && need.length) ? HM.pick(need) : HM.pick(dec.concat(need.map(HM.food))).id; }
        var f = HM.food(id), el = E('div', 'hm-bird'), s = size(), dir = Math.random() < .5 ? 1 : -1;
        el.style.width = s + 'px';
        el.innerHTML = '<span class="bird-body">' + HM.art.html('ui:bird', '🐦', 'bird-art') + '</span><span class="bird-food">' + HM.art.food(f) + '</span>';
        var row = (seq++ % 4) * .17 + .08 + Math.random() * .05;
        var b = { id: id, el: el, x: startX != null ? startX : (dir > 0 ? -.12 : 1.12), row: row, dir: dir, s: s, sp: speed * (.85 + Math.random() * .3), ph: Math.random() * 6, dead: false };
        el.onpointerdown = function (e) { e.preventDefault(); e.stopPropagation(); HM.unlock(); hit(b); };
        stage.appendChild(el); birds.push(b); return b;
      }
      function place(b) {
        var W = ctx.W(), H = ctx.H(); b.el.style.transform = 'translate(' + (b.x * W - b.s / 2) + 'px,' + (b.row * H + Math.sin(b.ph) * 12) + 'px) scaleX(' + (-b.dir) + ')';
        var food = b.el.querySelector('.bird-food'); if (food) food.style.transform = 'scaleX(' + (-b.dir) + ')';
      }
      function hit(b) {
        if (b.dead || ctx.stopped()) return;
        if (ctx.take(b.id, b.el)) { b.dead = true; b.el.classList.add('caught'); ctx.later(function () { b.el.remove(); }, 400); }
        else { b.escape = true; b.el.classList.add('flee'); b.sp *= 2.4; ctx.later(function () { b.el.classList.remove('flee'); }, 600); }
      }
      function target() {
        var W = ctx.W(), best = null, bd = 9; birds.forEach(function (b) { if (b.dead || ctx.need(b.id) <= 0 || b.x < .05 || b.x > .95) return; var d = Math.abs(b.x - .5); if (d < bd) { bd = d; best = b; } }); return best;
      }
      for (var i = 0; i < COUNT[lv - 1]; i++) spawn(null, .1 + .8 * i / COUNT[lv - 1]);
      ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
      if (ctx.assisted) ctx.setMain('🥅 잡아요!', function () { var b = target(); if (b) hit(b); else ctx.say('새가 가운데로 올 때까지 기다려요', 900); });
      ctx.raf(function (dt) {
        birds.forEach(function (b) {
          if (b.dead) return; b.x += b.dir * b.sp * dt; b.ph += dt * 4; place(b);
          b.el.classList.toggle('hm-glow', ctx.need(b.id) > 0 && ctx.assisted);
          if (b.x > 1.2 || b.x < -.2) { b.dead = true; b.el.remove(); }
        });
        birds = birds.filter(function (b) { return !b.dead || b.el.isConnected; });
        var alive = birds.filter(function (b) { return !b.dead; });
        if (alive.length < COUNT[lv - 1]) spawn();
        ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
        if (ctx.assisted) ctx.glowMain(!!target());
      });
    }
  };
})(window);
