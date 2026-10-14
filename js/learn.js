/* 행복한 급식 · 급식 공부 3종 — 🔤 급식 글자 퀴즈 / 🧮 급식 계산대 / 🥕 재료 마트
   문제를 만드는 곳(HM.learn.*.make)과 문제를 푸는 틀(HM.quiz)이 나뉘어 있어요. */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el, esc = HM.esc, N = 5;

  /* ===== 재료 데이터 (그림은 img/ing/<key>.webp, 없으면 이모지) ===== */
  HM.ING = {
    pork: ['돼지고기', '🥩'], beef: ['소고기', '🥩'], chicken: ['닭고기', '🍗'], fish: ['생선', '🐟'], shrimp: ['새우', '🦐'], squid: ['오징어', '🦑'], anchovy: ['멸치', '🐟'],
    sausage: ['소시지', '🌭'], ham: ['햄', '🥓'], egg: ['계란', '🥚'], tofu: ['두부', '⬜'], cheese: ['치즈', '🧀'], milk: ['우유', '🥛'], rice: ['쌀', '🍚'], noodle: ['면', '🍜'],
    ricecake: ['떡', '🍡'], fishcake: ['어묵', '🍢'], bread: ['빵', '🍞'], seaweed: ['미역', '🌿'], kimchi: ['김치', '🌶️'], carrot: ['당근', '🥕'], onion: ['양파', '🧅'],
    potato: ['감자', '🥔'], garlic: ['마늘', '🧄'], pepper: ['고추', '🌶️'], scallion: ['대파', '🌱'], cabbage: ['배추', '🥬'], radish: ['무', '⚪'], spinach: ['시금치', '🥬'],
    cucumber: ['오이', '🥒'], zucchini: ['애호박', '🥒'], eggplant: ['가지', '🍆'], mushroom: ['버섯', '🍄'], corn: ['옥수수', '🌽'], tomato: ['토마토', '🍅'],
    pumpkin: ['단호박', '🎃'], 'bean-sprout': ['콩나물', '🌱'], broccoli: ['브로콜리', '🥦']
  };
  var D = {
    'kimchi-jjigae': 'kimchi pork tofu onion scallion', 'doenjang-jjigae': 'tofu zucchini potato onion', 'sundubu': 'tofu egg scallion pepper', 'budae': 'sausage tofu kimchi noodle scallion',
    'yukgaejang': 'beef scallion bean-sprout egg', 'miyeok-soup': 'seaweed beef garlic', 'tofu-miyeok-soup': 'tofu seaweed garlic', 'egg-soup': 'egg scallion onion', 'tteokguk': 'ricecake egg scallion beef',
    'beef-radish-soup': 'beef radish scallion', 'spinach-soup': 'spinach tofu garlic', 'tomato-soup': 'tomato onion carrot', 'cream-soup': 'potato onion milk', 'chicken-noodle-soup': 'chicken noodle scallion',
    'eomuk-guk': 'fishcake radish scallion', 'curry': 'carrot potato onion pork', 'hayashi': 'beef onion mushroom tomato', 'omurice': 'egg rice onion carrot', 'inari': 'tofu rice carrot',
    'jjajang': 'noodle pork onion zucchini', 'japchae': 'noodle spinach carrot onion beef', 'tteokbokki': 'ricecake fishcake scallion pepper', 'gyeran-mari': 'egg carrot scallion', 'gyeran-jjim': 'egg scallion carrot',
    'mandu': 'pork tofu cabbage', 'tonkatsu': 'pork egg cabbage', 'bulgogi': 'beef onion mushroom carrot', 'jeyuk': 'pork onion pepper scallion', 'dakdoritang': 'chicken potato carrot onion',
    'dakgangjeong': 'chicken garlic pepper', 'oi-muchim': 'cucumber pepper garlic', 'gamja-chae': 'potato carrot onion', 'gamja-jorim': 'potato carrot pepper', 'myeolchi': 'anchovy garlic pepper',
    'kongnamul': 'bean-sprout scallion garlic', 'sigeumchi': 'spinach garlic scallion', 'hobak': 'zucchini onion carrot', 'gaji': 'eggplant onion garlic', 'baechu-kimchi': 'cabbage radish pepper garlic',
    'kkakdugi': 'radish pepper garlic scallion', 'oisobagi': 'cucumber pepper garlic scallion', 'pa-kimchi': 'scallion pepper garlic', 'potato-salad': 'potato carrot cucumber egg', 'coleslaw': 'cabbage carrot corn',
    'corn-salad': 'corn carrot cucumber', 'pumpkin-salad': 'pumpkin carrot corn', 'sandwich': 'bread cheese ham egg', 'ojingeo': 'squid onion pepper carrot', 'shrimp-broccoli': 'shrimp broccoli garlic',
    'sausage-bokkeum': 'sausage onion carrot pepper', 'meatball': 'beef onion tomato'
  };
  HM.DISHES = {}; Object.keys(D).forEach(function (k) { HM.DISHES[k] = D[k].split(' '); });
  HM.ingArt = function (k, cls) { return HM.art.html('ing:' + k, HM.ING[k][1], cls); };
  var PRICE = { rice: 300, soup: 200, side: 400, fruit: 500, drink: 300 };
  HM.price = function (f) { return PRICE[f.cat] || 300; };

  /* ===== 문제 만들기 도우미 ===== */
  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split(''), CHO_USE = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('');
  function cho(ch) { var c = ch.charCodeAt(0) - 44032; return c < 0 || c > 11171 ? ch : CHO[Math.floor(c / 588)]; }
  function syl(n) { return Array.from(n); }
  function others(list, not, k) { return HM.shuffle(list.filter(function (x) { return not.indexOf(x) < 0; })).slice(0, k); }
  function opt(html, text, ok) { return { html: html, text: text, ok: !!ok }; }
  function mix(correct, wrongs) { return HM.shuffle([correct].concat(wrongs)); }
  function pic(f) { return '<span class="qz-pic">' + HM.art.food(f) + '</span>'; }
  function foods(n, min) { return HM.shuffle(HM.FOODS.filter(function (f) { return syl(f.name).length >= (min || 2); })).slice(0, n); }
  var NUM = function (n) { return '<b class="qz-num">' + n + '</b>'; };
  var WON = function (n) { return '<b class="qz-num won">' + n + '원</b>'; };

  HM.learn = {
    letters: {
      id: 'letters', name: '급식 글자 퀴즈', emo: '🔤', skill: '낱말 읽기·글자 만들기', desc: '음식 이름의 글자를 찾고 만들어요.',
      lv: ['그림을 보고 이름 고르기 (2장)', '그림을 보고 이름 고르기 (3장)', '첫소리 찾기', '빠진 글자 채우기', '글자를 모아 이름 만들기'],
      make: function (lv) {
        return foods(N, 2).map(function (f) {
          var s = syl(f.name), q = { key: 'letters:' + f.id, say: f.name };
          if (lv <= 2) {
            var ws = others(HM.FOODS.map(function (x) { return x.name; }), [f.name], lv === 1 ? 1 : 2);
            q.type = 'choice'; q.prompt = pic(f) + '<p>이 음식의 이름은?</p>'; q.cls = 'names';
            q.opts = mix(opt('<b class="qz-word">' + esc(f.name) + '</b>', f.name, true), ws.map(function (w) { return opt('<b class="qz-word">' + esc(w) + '</b>', w); }));
          } else if (lv === 3) {
            var c = cho(s[0]); q.type = 'choice'; q.prompt = pic(f) + '<p class="qz-word">' + esc(f.name) + '</p><p>첫소리는 무엇일까요?</p>'; q.cls = 'cho';
            q.opts = mix(opt('<b class="qz-num">' + c + '</b>', c, true), others(CHO_USE, [c], 2).map(function (x) { return opt('<b class="qz-num">' + x + '</b>', x); }));
            q.sayOk = null;
          } else if (lv === 4) {
            var i = HM.rand(s.length), want = s[i], shown = s.map(function (ch, k) { return k === i ? '<u class="blank">□</u>' : esc(ch); }).join('');
            var pool = []; HM.FOODS.forEach(function (x) { syl(x.name).forEach(function (ch) { if (pool.indexOf(ch) < 0) pool.push(ch); }); });
            q.type = 'choice'; q.prompt = pic(f) + '<p class="qz-word">' + shown + '</p><p>빠진 글자를 골라요</p>'; q.cls = 'cho';
            q.opts = mix(opt('<b class="qz-num">' + esc(want) + '</b>', want, true), others(pool, [want], 2).map(function (x) { return opt('<b class="qz-num">' + esc(x) + '</b>', x); }));
          } else {
            var ex = others(HM.FOODS.reduce(function (a, x) { return a.concat(syl(x.name)); }, []), s, 1);
            q.type = 'build'; q.prompt = pic(f) + '<p>글자를 눌러 이름을 만들어요</p>'; q.answer = s; q.tiles = HM.shuffle(s.concat(ex));
          }
          return q;
        });
      },
      sheet: function (lv) { return this.make(lv); }
    },
    shop: {
      id: 'shop', name: '급식 계산대', emo: '🧮', skill: '수 세기·돈 계산', desc: '급식을 세고, 더하고, 값을 치러요.',
      lv: ['세어 보기 (1~3)', '세어 보기 (1~5)', '더하기 (5 이내)', '돈 내기·값 더하기', '거스름돈'],
      make: function (lv) {
        var out = [];
        function icons(f, n) { var h = ''; for (var i = 0; i < n; i++) h += '<span class="qz-ico">' + HM.art.food(f) + '</span>'; return '<span class="qz-row">' + h + '</span>'; }
        function nums(c, lo, hi) { var all = []; for (var i = lo; i <= hi; i++) if (i !== c) all.push(i); return mix(c, others(all, [], 2)); }
        for (var k = 0; k < N; k++) {
          var f = HM.pick(HM.FOODS), q = { key: 'shop:' + lv, say: null };
          if (lv <= 2) {
            var n = 1 + HM.rand(lv === 1 ? 3 : 5);
            q.type = 'choice'; q.prompt = icons(f, n) + '<p>' + esc(f.name) + '이(가) 몇 개일까요?</p>'; q.cls = 'cho'; q.say = f.name + '이 몇 개일까요?';
            q.opts = nums(n, 1, lv === 1 ? 4 : 6).map(function (x) { return opt(NUM(x), String(x), x === n); }); q.sayOk = n + '개';
          } else if (lv === 3) {
            var a = 1 + HM.rand(3), b = 1 + HM.rand(5 - a), f2 = HM.pick(HM.FOODS), t = a + b;
            q.type = 'choice'; q.prompt = '<span class="qz-sum">' + icons(f, a) + '<b>+</b>' + icons(f2, b) + '</span><p>모두 몇 개일까요?</p>'; q.cls = 'cho'; q.say = '모두 몇 개일까요?';
            q.opts = nums(t, 2, 7).map(function (x) { return opt(NUM(x), String(x), x === t); }); q.sayOk = t + '개';
          } else if (lv === 4) {
            if (k % 2 === 0) { var p = HM.price(f); q.type = 'pay'; q.price = p; q.prompt = pic(f) + '<p>' + esc(f.name) + ' ' + p + '원! 돈을 내요</p>'; q.say = f.name + ' ' + p + '원이에요. 돈을 내요'; }
            else {
              var f3 = HM.pick(HM.FOODS), s2 = HM.price(f) + HM.price(f3);
              q.type = 'choice'; q.prompt = '<span class="qz-sum"><span class="qz-tag">' + pic(f) + '<b>' + HM.price(f) + '원</b></span><b>+</b><span class="qz-tag">' + pic(f3) + '<b>' + HM.price(f3) + '원</b></span></span><p>모두 얼마일까요?</p>'; q.cls = 'cho'; q.say = '모두 얼마일까요?';
              var cand = []; for (var m = 3; m <= 10; m++) if (m * 100 !== s2) cand.push(m * 100);
              q.opts = mix(s2, others(cand, [], 2)).map(function (x) { return opt(WON(x), String(x), x === s2); }); q.sayOk = s2 + '원';
            }
          } else {
            var P = HM.price(f), ch = 1000 - P, cand2 = []; for (var m2 = 1; m2 <= 9; m2++) if (m2 * 100 !== ch) cand2.push(m2 * 100);
            q.type = 'choice'; q.prompt = pic(f) + '<p>' + esc(f.name) + ' ' + P + '원. <b>1000원</b>을 냈어요. 거스름돈은?</p>'; q.cls = 'cho'; q.say = f.name + ' ' + P + '원. 천 원을 냈어요. 거스름돈은 얼마일까요?';
            q.opts = mix(ch, others(cand2, [], 2)).map(function (x) { return opt(WON(x), String(x), x === ch); }); q.sayOk = ch + '원';
          }
          out.push(q);
        }
        return out;
      }
    },
    mart: {
      id: 'mart', name: '재료 마트', emo: '🥕', skill: '요리와 재료 연결', desc: '요리에 들어가는 재료를 찾아 냄비에 담아요.',
      lv: ['재료 2개 찾기 (4개 중)', '재료 2개 찾기 (5개 중)', '재료 3개 찾기 (6개 중)', '재료 3개 찾기 (8개 중)', '이름만 보고 4개 찾기'],
      make: function (lv) {
        var need = lv <= 2 ? 2 : lv <= 4 ? 3 : 4, total = [4, 5, 6, 8, 8][lv - 1];
        var ids = Object.keys(HM.DISHES).filter(function (id) { return HM.DISHES[id].length >= need && HM.FOODS.some(function (f) { return f.id === id; }); });
        return HM.shuffle(ids).slice(0, N).map(function (id) {
          var f = HM.food(id), all = Object.keys(HM.ING), right = HM.shuffle(HM.DISHES[id]).slice(0, need), wrong = others(all, HM.DISHES[id], total - need);
          return { key: 'mart:' + id, type: 'multi', say: f.name + '에 들어가는 재료를 찾아요', need: need, dish: f, text: lv === 5,
            prompt: (lv === 5 ? '<p class="qz-word">' + esc(f.name) + '</p>' : pic(f)) + '<p>' + esc(f.name) + '에 들어가는 재료 ' + need + '가지를 찾아요</p>',
            opts: HM.shuffle(right.concat(wrong)).map(function (k) { return { key: k, html: (lv === 5 ? '' : '<span class="qz-ing">' + HM.ingArt(k) + '</span>') + '<b>' + esc(HM.ING[k][0]) + '</b>', text: HM.ING[k][0], ok: right.indexOf(k) >= 0 }; }) };
        });
      }
    }
  };

  /* ===== 문제 푸는 틀 ===== */
  HM.quiz = function (host, spec) {
    host.innerHTML = '';
    var assisted = HM.assisted(spec.lv), qi = 0, res = { n: spec.qs.length, clean: 0, mistakes: 0, wrong: {} }, resolve, locked = false, stopped = false;
    var done = new Promise(function (r) { resolve = r; });
    var head = E('div', 'qz-head'), card = E('div', 'qz-card'); host.appendChild(head); host.appendChild(card);
    function dots() { head.innerHTML = '<b>' + esc(spec.emo + ' ' + spec.name) + '</b><span class="qz-dots">' + spec.qs.map(function (q, i) { return '<i class="' + (i < qi ? 'done' : i === qi ? 'cur' : '') + '"></i>'; }).join('') + '</span>'; }
    function later(fn, ms) { setTimeout(function () { if (!stopped) fn(); }, ms / (HM.FAST ? 4 : 1)); }
    function next() { if (qi >= spec.qs.length) { HM.sfx('win'); resolve(res); return; } dots(); render(spec.qs[qi]); }
    function fin(q) { locked = true; if (!q.mis) res.clean++; qi++; dots(); later(next, 1000); }
    function miss(q, msg) { q.mis++; res.mistakes++; res.wrong[q.key] = (res.wrong[q.key] || 0) + 1; HM.sfx('no'); if (msg) { note.textContent = msg; HM.say(msg, { noRepeat: true }); } }
    var note;
    function shake(el) { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); }
    function render(q) {
      q.mis = 0; locked = false; card.innerHTML = ''; card.appendChild(E('div', 'qz-prompt', q.prompt)); note = E('div', 'qz-note', ''); 
      var area = E('div', 'qz-opts ' + (q.cls || '')); card.appendChild(area); card.appendChild(note);
      if (q.say) HM.say(q.say);
      if (q.type === 'choice') {
        q.opts.forEach(function (o) {
          var b = E('button', 'qz-opt', o.html); b.type = 'button'; if (assisted && o.ok) b.classList.add('hm-glow');
          b.onclick = function () {
            if (locked) return; HM.unlock();
            if (o.ok) { b.classList.add('right'); HM.sfx('ok'); HM.say(q.sayOk || o.text); note.textContent = '맞아요! 👏'; fin(q); }
            else { b.classList.add('bad'); shake(b); miss(q, '다시 골라 봐요'); if (q.mis >= 2) [].forEach.call(area.children, function (x, i) { if (q.opts[i].ok) x.classList.add('hm-glow'); }); }
          }; area.appendChild(b);
        });
      } else if (q.type === 'multi') {
        var pot = E('div', 'qz-pot', '<span>🍲 냄비</span>'), got = 0; card.insertBefore(pot, area);
        q.opts.forEach(function (o) {
          var b = E('button', 'qz-opt', o.html); b.type = 'button'; if (assisted && o.ok) b.classList.add('hm-glow');
          b.onclick = function () {
            if (locked || b.disabled) return; HM.unlock();
            if (o.ok) {
              b.disabled = true; b.classList.add('used'); got++; HM.sfx('ok'); HM.say(o.text); pot.appendChild(E('i', 'qz-chip', (o.html.indexOf('qz-ing') >= 0 ? '<span class="qz-ing">' + HM.ingArt(o.key) + '</span>' : '') + '<b>' + esc(o.text) + '</b>'));
              if (got >= q.need) { note.textContent = '맛있는 ' + q.dish.name + ' 완성! 👏'; HM.say(q.dish.name + ' 완성'); fin(q); }
            } else { shake(b); miss(q, HM.josa(o.text, '은', '는') + ' 안 들어가요'); if (q.mis >= 2) [].forEach.call(area.children, function (x, i) { if (q.opts[i].ok) x.classList.add('hm-glow'); }); }
          }; area.appendChild(b);
        });
      } else if (q.type === 'build') {
        var slots = E('div', 'qz-slots'), pos = 0; card.insertBefore(slots, area);
        q.answer.forEach(function () { slots.appendChild(E('span', 'qz-slot', '')); });
        function glowNext() { if (!assisted) return; [].forEach.call(area.children, function (x) { x.classList.toggle('hm-glow', !x.disabled && x.dataset.c === q.answer[pos]); }); }
        q.tiles.forEach(function (ch) {
          var b = E('button', 'qz-opt qz-tile', '<b class="qz-num">' + esc(ch) + '</b>'); b.type = 'button'; b.dataset.c = ch;
          b.onclick = function () {
            if (locked || b.disabled) return; HM.unlock();
            if (ch === q.answer[pos]) { b.disabled = true; b.classList.add('used'); slots.children[pos].textContent = ch; slots.children[pos].classList.add('on'); HM.sfx('ok'); HM.say(ch); pos++; glowNext(); if (pos >= q.answer.length) { note.textContent = '이름 완성! 👏'; HM.say(q.answer.join('')); fin(q); } }
            else { shake(b); miss(q, '다른 글자예요'); if (q.mis >= 2) glowNext2(); }
          }; area.appendChild(b);
        });
        function glowNext2() { [].forEach.call(area.children, function (x) { x.classList.toggle('hm-glow', !x.disabled && x.dataset.c === q.answer[pos]); }); }
        glowNext();
      } else if (q.type === 'pay') {
        var sum = 0, disp = E('div', 'qz-sum-disp', '<b>0</b>원'); card.insertBefore(disp, area);
        function upd() { disp.innerHTML = '<b>' + sum + '</b>원'; }
        function hint() { var rem = q.price - sum; [].forEach.call(area.children, function (x) { var v = +x.dataset.v; x.classList.toggle('hm-glow', v && rem > 0 && v <= rem && (v === 500 || rem < 500)); }); }
        [500, 100].forEach(function (v) {
          var b = E('button', 'qz-opt qz-coin', HM.art.html('ui:coin' + v, '<b class="coin c' + v + '">' + v + '원</b>', 'qz-coinimg') + '<small>' + v + '원</small>'); b.type = 'button'; b.dataset.v = v;
          b.onclick = function () {
            if (locked) return; HM.unlock(); sum += v; HM.sfx('coin'); HM.say(String(sum)); upd();
            if (sum === q.price) { note.textContent = '딱 맞아요! 👏'; HM.say(q.price + '원'); fin(q); }
            else if (sum > q.price) { miss(q, '너무 많아요. 다시 내요'); sum = 0; upd(); if (assisted || q.mis >= 2) hint(); }
            else if (assisted || q.mis >= 2) hint();
          }; area.appendChild(b);
        });
        var rs = E('button', 'qz-opt qz-reset', '↺ 다시'); rs.type = 'button'; rs.onclick = function () { if (!locked) { sum = 0; upd(); if (assisted) hint(); } }; area.appendChild(rs);
        if (assisted) hint();
      }
    }
    next();
    return { promise: done, stop: function () { stopped = true; } };
  };
})(window);
