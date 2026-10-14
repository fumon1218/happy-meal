/* 급식 뽑기 — 뽑기 기계에서 나온 음식을 보고, 주문한 것만 식판에 담아요 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  HM.games = HM.games || {};
  HM.games.gacha = {
    id: 'gacha', name: '급식 뽑기', emo: '🎰', desc: '뽑기 기계에서 나온 음식을 담을지 돌려줄지 골라요.',
    start: function (ctx) {
      var stage = ctx.stage, lv = ctx.level, state = 'idle', cur = null, bag = [];
      var machine = E('div', 'hm-machine', '<div class="m-dome">' + (HM.art.has('ui:gacha') ? HM.art.html('ui:gacha', '') : '<span class="m-balls">🔴🟡🔵🟢🟣</span>') + '</div><div class="m-body"><button type="button" class="m-lever">뽑기!</button></div>');
      var cap = E('div', 'hm-capsule'), card = E('div', 'hm-gcard');
      var btns = E('div', 'hm-gbtns', '<button type="button" class="g-keep">🍽️ 담기</button><button type="button" class="g-back">↩️ 돌려주기</button>');
      stage.appendChild(machine); stage.appendChild(cap); stage.appendChild(card); stage.appendChild(btns);
      var lever = machine.querySelector('.m-lever'), keep = btns.querySelector('.g-keep'), back = btns.querySelector('.g-back');
      btns.hidden = true; card.hidden = true; cap.hidden = true;
      ctx.say('뽑기를 눌러 음식을 꺼내요', 1800);
      function nextFood() {
        if (!bag.length) {
          var need = ctx.needIds(), dec = HM.shuffle(ctx.decoys());
          var pNeed = lv <= 2 ? .7 : .45, n = 6; bag = [];
          for (var i = 0; i < n; i++) bag.push(Math.random() < pNeed && need.length ? HM.pick(need) : dec[i % dec.length].id);
          need.forEach(function (id) { if (bag.indexOf(id) < 0) bag[HM.rand(n)] = id; });
        }
        return bag.shift();
      }
      function pull() {
        if (state !== 'idle' || ctx.stopped()) return; HM.unlock(); state = 'rolling'; HM.sfx('tick');
        lever.classList.add('pulled'); ctx.setMain(null);
        cur = nextFood(); cap.hidden = false; cap.className = 'hm-capsule roll'; card.hidden = true; btns.hidden = true;
        ctx.later(function () {
          var f = HM.food(cur); cap.hidden = true; lever.classList.remove('pulled');
          card.innerHTML = '<span class="g-ic">' + HM.art.food(f, 'big') + '</span><b>' + HM.esc(f.name) + '</b>'; card.hidden = false; card.className = 'hm-gcard open'; HM.sfx('coin'); HM.say(f.name);
          btns.hidden = false; state = 'choose'; chooseHelp();
        }, 900);
      }
      function chooseHelp() {
        var needed = ctx.need(cur) > 0;
        if (ctx.assisted) {
          keep.classList.toggle('hm-glow', needed); back.classList.toggle('hm-glow', !needed);
          ctx.setMain(needed ? '🍽️ 담기!' : '↩️ 돌려주기!', function () { (needed ? doKeep : doBack)(); }); ctx.glowMain(true);
        }
      }
      function reset() { keep.classList.remove('hm-glow'); back.classList.remove('hm-glow'); card.hidden = true; btns.hidden = true; state = 'idle'; ctx.glowMain(false); if (!ctx.stopped()) ctx.setMain('🎰 뽑기!', pull); }
      function doKeep() {
        if (state !== 'choose') return; state = 'busy';
        var ok = ctx.take(cur, card); card.classList.add(ok ? 'gone' : 'no');
        ctx.later(function () { card.classList.remove('gone', 'no'); reset(); }, ok ? 500 : 900);
      }
      function doBack() {
        if (state !== 'choose') return; state = 'busy';
        if (ctx.need(cur) > 0) { if (lv >= 3) ctx.stats.mistakes++; ctx.say('필요한 음식이었어요. 다음에는 담아요!', 1400); HM.sfx('no'); }
        else { HM.sfx('ok'); ctx.say('잘 골랐어요! 주문하지 않은 음식이에요', 1100); }
        card.classList.add('back'); ctx.later(function () { card.classList.remove('back'); reset(); }, 700);
      }
      lever.onclick = pull; keep.onclick = doKeep; back.onclick = doBack;
      ctx.setMain('🎰 뽑기!', pull);
      ctx.later(function () { if (ctx.assisted && state === 'idle') ctx.glowMain(true); }, 600);
    }
  };
})(window);
