/* 행복한 급식 · 학습지 만들기 (인쇄용) */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el, esc = HM.esc;
  var COUNT = [1, 2, 3, 3, 4];

  HM.WS_TYPES = [
    { id: 'order', name: '주문서 보고 고르기', emo: '📝', desc: '친구의 주문을 읽고 알맞은 음식에 ○ 해요.' },
    { id: 'tray', name: '식판 채우기', emo: '🍱', desc: '음식 그림을 오려서 식판 알맞은 칸에 붙여요.' },
    { id: 'match', name: '그림과 이름 잇기', emo: '🔤', desc: '음식 그림과 이름을 짝지어요.' },
    { id: 'letters', name: '급식 글자 퀴즈', emo: '🔤', desc: '그림을 보고 이름·첫소리·빠진 글자를 찾아요.' },
    { id: 'shop', name: '급식 계산대', emo: '🧮', desc: '개수 세기, 더하기, 돈 계산을 해요.' },
    { id: 'mart', name: '재료 마트', emo: '🥕', desc: '요리에 들어가는 재료에 ○ 해요.' },
    { id: 'seat', name: '배달 자리 찾기', emo: '🚚', desc: '친구 자리를 찾아 배달해요.' }
  ];

  function page(title, sub, body, key) {
    return '<section class="ws-page' + (key ? ' ws-key' : '') + '"><header class="ws-head"><h2>🍱 행복한 급식 <small>' + esc(title) + (key ? ' · 정답' : '') + '</small></h2>' +
      '<div class="ws-name"><span>이름 <i></i></span><span>날짜 <i class="s"></i></span></div></header>' + (sub ? '<p class="ws-sub">' + esc(sub) + '</p>' : '') + body + '<footer><b>선생님 확인</b><span class="chk"><i>□ 독립</i><i>□ 언어힌트</i><i>□ 시각힌트</i><i>□ 시범</i><i>□ 신체지원</i></span><span class="stamp">참 잘했어요</span><span class="maker"><img src="img/ui/maker.webp" alt="">Made by</span></footer></section>';
  }
  function img(f) { return HM.art.food(f); }
  function card(f, cls, extra) { return '<div class="ws-food ' + (cls || '') + '"><span class="ws-ic">' + img(f) + '</span><b>' + esc(f.name) + '</b>' + (extra || '') + '</div>'; }

  /* ① 주문서 보고 고르기 */
  function order(L, opts, key) {
    var friends = HM.friends(), per = L <= 2 ? 4 : 3, html = '', P = [];
    for (var i = 0; i < per * opts.pages; i++) {
      var fi = HM.rand(friends.length), o = HM.makeOrder(L, friends[fi], fi);
      var need = o.items.map(function (it) { return it.id; }), avoid = HM.avoidIds(friends[fi], o.menu);
      var decoyPool = HM.shuffle(HM.FOODS.filter(function (f) { return need.indexOf(f.id) < 0 && avoid.indexOf(f.id) < 0; }));
      var ch = need.map(HM.food).concat(avoid.slice(0, L >= 4 ? 1 : 0).map(HM.food)), k = 0;
      while (ch.length < (L <= 2 ? 6 : 8)) ch.push(decoyPool[k++]);
      P.push({ o: o, ch: HM.shuffle(ch) });
    }
    for (var p = 0; p < opts.pages; p++) {
      var body = '';
      P.slice(p * per, p * per + per).forEach(function (q, n) {
        var cs = q.ch.map(function (f) {
          var it = q.o.items.filter(function (x) { return x.id === f.id; })[0];
          return card(f, key && it ? 'ans' : '', '<em class="ws-o"></em>' + (key && it ? '<u>' + it.n + '개</u>' : ''));
        }).join('');
        body += '<div class="ws-q"><div class="ws-who"><span class="ws-av">' + HM.art.friend(q.o.friend, false) + '</span><div class="ws-bubble"><b>' + (p * per + n + 1) + '.</b> ' + esc(q.o.text) +
          (q.o.avoid.length ? '<small>🚫 ' + q.o.avoid.map(function (id) { return esc(HM.food(id).name); }).join(', ') + ' 못 먹어요</small>' : '') + '</div></div><div class="ws-row">' + cs + '</div></div>';
      });
      html += page('주문서 보고 고르기', L >= 3 ? '친구가 말한 음식을 개수만큼 ○ 해요. (모르는 음식은 ✕)' : '친구가 말한 음식에 ○ 해요.', body, key);
    }
    return html;
  }

  /* ② 식판 채우기 */
  function trayPage(L, opts, key) {
    var html = '';
    for (var p = 0; p < opts.pages; p++) {
      var m = HM.MENUS[(opts.day + p) % 5], foods = HM.menuFoods(m);
      var T = HM.Tray(); if (key) foods.forEach(function (f) { T.add(f); });
      var extra = L >= 4 ? HM.shuffle(HM.FOODS.filter(function (f) { return foods.indexOf(f) < 0; })).slice(0, 2) : [];
      var stick = HM.shuffle(foods.concat(extra));
      var body = '<div class="ws-trayline"><b>' + m.day + '요일 급식</b>' + (L <= 2 ? '<span>' + foods.map(function (f) { return esc(f.name); }).join(' · ') + '</span>' : '') + '</div>' +
        '<div class="ws-tray' + (key ? ' filled' : '') + '">' + T.el.outerHTML + '</div>' +
        '<div class="ws-cut"><p>✂️ 오려서 붙여요' + (extra.length ? ' (식단에 없는 음식은 붙이지 않아요)' : '') + '</p><div class="ws-row">' +
        stick.map(function (f) { return card(f, 'cut' + (key && extra.indexOf(f) >= 0 ? ' no' : '')); }).join('') + '</div></div>';
      html += page('식판 채우기', L <= 2 ? '밥은 큰 칸, 국은 오른쪽 위 칸, 반찬은 작은 칸에 붙여요.' : '식단표를 보고 식판을 채워요.', body, key);
    }
    return html;
  }

  /* ③ 그림과 이름 잇기 */
  function match(L, opts, key) {
    var n = [4, 5, 6, 7, 8][L - 1], html = '', LET = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊ'.split('');
    for (var p = 0; p < opts.pages; p++) {
      var fs = HM.shuffle(HM.FOODS).slice(0, n), names = HM.shuffle(fs.map(function (f, i) { return i; })), body = '<div class="ws-match"><div class="ws-col">';
      fs.forEach(function (f, i) { body += '<div class="ws-mrow"><b>' + (i + 1) + '</b>' + card(f) + '<span class="ws-ans">' + (key ? LET[names.indexOf(i)] : '') + '</span></div>'; });
      body += '</div><div class="ws-col names">';
      names.forEach(function (i, k) { body += '<div class="ws-nm"><b>' + LET[k] + '</b><span class="' + (L <= 2 ? 'trace' : '') + '">' + esc(fs[i].name) + '</span>' + (L <= 2 ? '<i class="wr"></i>' : '') + '</div>'; });
      body += '</div></div>';
      html += page('그림과 이름 잇기', '그림 번호에 알맞은 이름의 글자(ㄱ, ㄴ…)를 빈칸에 써요.', body, key);
    }
    return html;
  }

  /* ④ 배달 자리 찾기 */
  function seatMap(friends, hl, names) {
    return '<div class="ws-seats">' + friends.map(function (f, i) {
      return '<div class="ws-seat' + (hl === i ? ' hl' : '') + '"><span>' + HM.art.friend(f, false) + '</span>' + (names ? '<b>' + esc(f.name) + '</b>' : '') + '<em></em></div>';
    }).join('') + '</div>';
  }
  function seat(L, opts, key) {
    var friends = HM.friends(), html = '', per = L <= 3 ? 4 : 4;
    var Q = [];
    for (var i = 0; i < per * opts.pages; i++) Q.push(HM.rand(6));
    for (var p = 0; p < opts.pages; p++) {
      var body = '';
      Q.slice(p * per, p * per + per).forEach(function (t, n) {
        var f = friends[t], q;
        if (L <= 3) q = esc(f.name) + '에게 배달해요. 자리에 ○ 해요.';
        else q = HM.SEAT_NAMES[t] + ' 자리에 배달해요. 누구 자리일까요?';
        body += '<div class="ws-q seatq"><p><b>' + (p * per + n + 1) + '.</b> ' + q + (L >= 4 ? ' <span class="ws-blank">' + (key ? esc(f.name) : '') + '</span>' : '') + '</p>' + seatMap(friends, key && L <= 3 ? t : -1, true) + '</div>';
      });
      html += page('배달 자리 찾기', L <= 3 ? '교실 그림에서 친구 자리를 찾아 ○ 해요.' : '자리 위치를 읽고 친구 이름을 써요.', body, key);
    }
    return html;
  }

  /* ⑤~⑦ 급식 공부 학습지 (글자 퀴즈·계산대·재료 마트): 놀이와 같은 문제를 종이로 */
  function quizSheet(gid, L, opts, key) {
    var G = HM.learn[gid], html = '', fixP = function (h) { return h.replace('글자를 눌러 이름을 만들어요', '글자를 골라 이름을 써요').replace('돈을 내요', '값은 얼마일까요?'); };
    var sub = { letters: ['그림을 보고 알맞은 글자에 ○ 해요.', '글자 퀴즈'], shop: ['알맞은 답에 ○ 해요. 돈은 동전을 그려요.', '급식 계산대'], mart: ['요리에 들어가는 재료에 모두 ○ 해요.', '재료 마트'] }[gid];
    for (var p = 0; p < opts.pages; p++) {
      var body = '';
      G.make(L).forEach(function (q, n) {
        var inner = '<div class="ws-qq"><b class="ws-no">' + (n + 1) + '.</b><div class="ws-qp">' + fixP(q.prompt) + '</div></div>', ch = '';
        if (q.type === 'build') {
          ch = '<div class="ws-ch">' + q.tiles.map(function (t) { return '<span class="ws-opt">' + esc(t) + '</span>'; }).join('') + '</div><div class="ws-slots">' + q.answer.map(function (a) { return '<i>' + (key ? esc(a) : '') + '</i>'; }).join('') + '</div>';
        } else if (q.type === 'pay') {
          ch = '<div class="ws-pay">동전을 그려서 ' + q.price + '원을 만들어요 <span class="ws-box"></span>' + (key ? ' <u>' + q.price + '원</u>' : '') + '</div>';
        } else {
          ch = '<div class="ws-ch">' + q.opts.map(function (o) { return '<span class="ws-opt' + (key && o.ok ? ' ans' : '') + '"><em class="ws-o"></em>' + o.html + '</span>'; }).join('') + '</div>';
        }
        body += '<div class="ws-q">' + inner + ch + '</div>';
      });
      html += page(sub[1], sub[0], '<div class="ws-compact">' + body + '</div>', key);
    }
    return html;
  }
  function letters(L, o, k) { return quizSheet('letters', L, o, k); } function shop(L, o, k) { return quizSheet('shop', L, o, k); } function mart(L, o, k) { return quizSheet('mart', L, o, k); }

  HM.worksheet = function (type, L, opts, key) {
    opts = Object.assign({ pages: 1, day: 0 }, opts || {});
    var f = { order: order, tray: trayPage, match: match, seat: seat, letters: letters, shop: shop, mart: mart }[type], old = HM.rand, st = (opts.seed || 1) >>> 0;
    HM.rand = function (n) { st = (st * 1664525 + 1013904223) >>> 0; return Math.floor(st / 4294967296 * n); };   /* 같은 씨앗 → 학습지와 정답지가 똑같이 만들어져요 */
    try { return f(L, opts, key); } finally { HM.rand = old; }
  };
})(window);
