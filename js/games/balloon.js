/* 풍선 터트리기 — 풍선 속 음식 중 주문한 것만 터트려요 (옥쌤 풍선 터트리기 방식) */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  var COLORS = ['#ff6b8b', '#ffb703', '#4cc3ff', '#7bd88f', '#b58bff', '#ff9a5a'];
  var COUNT = [4, 5, 6, 7, 8], SPEED = [.085, .11, .15, .19, .23];
  HM.games = HM.games || {};
  HM.games.balloon = {
    id: 'balloon', skill: 'listen', name: '풍선 터트리기', emo: '🎈', desc: '주문한 음식이 든 풍선만 톡! 터트려요.',
    start: function (ctx) {
      var stage = ctx.stage, lv = ctx.level, bals = [], seq = 0;
      var speed = SPEED[lv - 1] * ctx.slowK * (ctx.assisted ? .85 : 1);
      ctx.say('주문한 음식이 든 풍선을 눌러요', 1800);
      function size() { return HM.clamp(ctx.W() * .15, 84, 132); }
      function has(id) { return bals.some(function (b) { return b.id === id && !b.dead; }); }
      function spawn(id) {
        var s = size(), el = E('div', 'hm-bal'), f;
        if (!id) { var need = ctx.needIds(), dec = ctx.decoys(); id = (Math.random() < .35 && need.length) ? HM.pick(need) : HM.pick(dec.concat(need.map(HM.food))).id; }
        if (typeof id === 'object') id = id.id; f = HM.food(id);
        var col = COLORS[seq++ % COLORS.length];
        el.style.width = s + 'px'; el.style.setProperty('--c', col); el.style.setProperty('--h', ((seq * 67) % 360) + 'deg');
        el.innerHTML = '<span class="bal-body' + (HM.art.has('ui:balloon') ? ' art' : '') + '">' + (HM.art.has('ui:balloon') ? HM.art.html('ui:balloon', '', 'bal-art') : '') + '<span class="bal-food">' + HM.art.food(f) + '</span></span><i class="bal-string"></i>';
        var b = { id: id, el: el, x: HM.rand(Math.max(1, ctx.W() - s)) , y: ctx.H() + 20 + HM.rand(80), ph: Math.random() * 6, s: s, sp: speed * (.85 + Math.random() * .3), dead: false };
        el.onpointerdown = function (e) { e.preventDefault(); e.stopPropagation(); HM.unlock(); hit(b); };
        stage.appendChild(el); bals.push(b); place(b); return b;
      }
      function place(b) { b.el.style.transform = 'translate(' + (b.x + Math.sin(b.ph) * 14) + 'px,' + b.y + 'px)'; }
      function hit(b) {
        if (b.dead || ctx.stopped()) return;
        if (ctx.take(b.id, b.el)) { b.dead = true; b.el.classList.add('pop'); HM.sfx('pop'); ctx.later(function () { b.el.remove(); }, 260); }
        else { b.el.classList.remove('shake'); void b.el.offsetWidth; b.el.classList.add('shake'); }
      }
      function target() {   /* 보조: 알맞은 풍선 중 가운데에 가장 가까운 것 */
        var H = ctx.H(), best = null, bd = 1e9;
        bals.forEach(function (b) { if (b.dead || ctx.need(b.id) <= 0 || b.y < 0 || b.y > H - b.s * .6) return; var d = Math.abs(b.y - H * .45); if (d < bd) { bd = d; best = b; } });
        return best;
      }
      for (var i = 0; i < COUNT[lv - 1]; i++) { var b0 = spawn(); b0.y = ctx.H() * (.2 + .7 * i / COUNT[lv - 1]); }
      ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
      if (ctx.assisted) ctx.setMain('🎈 톡!', function () { var b = target(); if (b) hit(b); else ctx.say('조금만 기다려요', 800); });
      ctx.raf(function (dt) {
        var H = ctx.H();
        bals.forEach(function (b) {
          if (b.dead) return; b.y -= b.sp * H * dt; b.ph += dt * 1.6; place(b);
          var need = ctx.need(b.id) > 0; b.el.classList.toggle('hm-glow', need && ctx.assisted);
          if (b.y < -b.s * 1.6) { b.dead = true; b.el.remove(); }
        });
        bals = bals.filter(function (b) { return !b.dead || b.el.isConnected; });
        var alive = bals.filter(function (b) { return !b.dead; });
        if (alive.length < COUNT[lv - 1]) spawn();
        ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
        if (ctx.assisted) { var t = target(); ctx.glowMain(!!t); }
      });
    }
  };
})(window);
