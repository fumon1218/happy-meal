/* 급식 낚시 — 연못에서 주문한 음식을 낚아요. 낚싯줄이 좌우로 움직일 때 눌러서 내려요 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  var COUNT = [4, 5, 6, 6, 7], FSPEED = [.05, .065, .085, .1, .12], HSPEED = [.0, .32, .42, .55, .7];
  HM.games = HM.games || {};
  HM.games.fishing = {
    id: 'fishing', skill: 'count', name: '급식 낚시', emo: '🎣', desc: '낚싯줄을 내려 주문한 음식을 낚아요.',
    start: function (ctx) {
      var stage = ctx.stage, lv = ctx.level, fish = [], seq = 0, phase = 'sweep', hx = .5, hdir = 1, len = 0, carry = null, locked = null;
      var hookEl = E('div', 'hm-hook', '<i class="line"></i><span class="hk">' + (HM.art.has('ui:hook') ? HM.art.html('ui:hook', '') : '🪝') + '</span>');
      var water = E('div', 'hm-water'); stage.appendChild(water); stage.appendChild(hookEl);
      var LANES = [.5, .66, .82];
      ctx.say('낚싯줄이 오면 눌러서 내려요', 1800);
      function size() { return HM.clamp(ctx.W() * .12, 66, 104); }
      function has(id) { return fish.some(function (f) { return f.id === id; }); }
      function spawn(id) {
        if (!id) { var need = ctx.needIds(), dec = ctx.decoys(); id = (Math.random() < .35 && need.length) ? HM.pick(need) : HM.pick(dec.concat(need.map(HM.food))).id; }
        var f = HM.food(id), el = E('div', 'hm-fish', '<span class="fish-body">' + HM.art.food(f) + '</span>'), s = size();
        var dir = Math.random() < .5 ? -1 : 1, lane = LANES[HM.rand(3)];
        var o = { id: id, el: el, x: Math.random(), lane: lane, dir: dir, sp: FSPEED[lv - 1] * ctx.slowK * (.8 + Math.random() * .4) };
        el.style.width = s + 'px'; el.onpointerdown = function (e) { if (lv <= 2 && phase === 'sweep') { e.stopPropagation(); locked = o; hx = o.x; drop(); } };
        stage.appendChild(el); fish.push(o); return o;
      }
      function nearestNeeded() {
        var best = null, bd = 9; fish.forEach(function (f) { if (ctx.need(f.id) <= 0 || f.x < .08 || f.x > .92) return; var d = Math.abs(f.x - hx); if (d < bd) { bd = d; best = f; } }); return best;
      }
      function drop() { if (phase !== 'sweep' || ctx.stopped()) return; phase = 'drop'; HM.sfx('splash'); }
      function press() {
        if (phase !== 'sweep') return; HM.unlock();
        if (ctx.assisted) { var t = nearestNeeded(); if (t) { locked = t; hx = t.x; } }
        drop();
      }
      stage.addEventListener('pointerdown', function (e) { if (e.target.closest('.hm-fish')) return; press(); });
      ctx.setMain('🎣 낚아요!', press);
      for (var i = 0; i < COUNT[lv - 1]; i++) spawn();
      ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
      function render() {
        var W = ctx.W(), H = ctx.H(), top = H * .24, maxLen = H * .86 - top;
        hookEl.style.left = hx * W + 'px'; hookEl.style.top = '0px'; hookEl.querySelector('.line').style.height = (top + len * maxLen) + 'px';
        hookEl.querySelector('.hk').style.top = (top + len * maxLen) + 'px';
        fish.forEach(function (f) { f.el.style.transform = 'translate(' + (f.x * W - f.el.offsetWidth / 2) + 'px,' + (f.lane * H - f.el.offsetHeight / 2) + 'px) scaleX(' + (f.dir) + ')'; });
        if (carry) { carry.el.style.transform = 'translate(' + (hx * W - carry.el.offsetWidth / 2) + 'px,' + (top + len * maxLen - 6) + 'px)'; }
      }
      ctx.raf(function (dt) {
        var W = ctx.W(), H = ctx.H();
        fish.forEach(function (f) { if (f === carry) return; f.x += f.dir * f.sp * dt; if (f.x > 1.08) { f.x = -.08; } if (f.x < -.08) { f.x = 1.08; } });
        if (phase === 'sweep') {
          var spd = HSPEED[lv - 1] * ctx.slowK;
          if (ctx.assisted) { var t = nearestNeeded(); if (t) { hx += HM.clamp(t.x - hx, -.5 * dt, .5 * dt); ctx.glowMain(Math.abs(t.x - hx) < .03); } else hx += hdir * .2 * dt; if (hx > .92) hdir = -1; if (hx < .08) hdir = 1; }
          else { hx += hdir * spd * dt; if (hx > .92) { hx = .92; hdir = -1; } if (hx < .08) { hx = .08; hdir = 1; } }
          len = Math.max(0, len - 2.4 * dt);
        } else if (phase === 'drop') {
          len += 1.5 * dt; ctx.glowMain(false);
          var tipY = H * .24 + len * (H * .86 - H * .24), tipX = hx * W;
          for (var i = 0; i < fish.length; i++) {
            var f = fish[i]; if (f === carry) continue;
            if (ctx.assisted && ctx.need(f.id) <= 0) continue;   /* 도움 모드: 알맞은 음식만 걸려요 */
            var fx = f.x * W, fy = f.lane * H, hit = Math.abs(fx - tipX) < size() * .55 + (ctx.assisted ? 20 : 0) && Math.abs(fy - tipY) < size() * .6;
            if (hit) { carry = f; f.el.classList.add('caught'); phase = 'reel'; break; }
          }
          if (phase === 'drop' && len >= 1) phase = 'reel';
        } else if (phase === 'reel') {
          len -= 1.7 * dt;
          if (len <= 0.02) {
            len = 0; var c = carry; carry = null; phase = 'sweep'; locked = null;
            if (c) {
              c.el.classList.remove('caught');
              if (ctx.take(c.id, c.el)) { c.el.remove(); fish = fish.filter(function (x) { return x !== c; }); }
              else { c.x = hx; c.lane = LANES[HM.rand(3)]; c.dir = Math.random() < .5 ? -1 : 1; }  /* 돌려보내요 */
            } else if (!ctx.assisted) ctx.say('아쉬워요, 한 번 더!', 900);
          }
        }
        fish.forEach(function (f) { f.el.classList.toggle('hm-glow', ctx.need(f.id) > 0 && ctx.assisted); });
        ctx.needIds().forEach(function (id) { if (!has(id)) spawn(id); });
        while (fish.length < COUNT[lv - 1]) spawn();
        render();
      });
    }
  };
})(window);
