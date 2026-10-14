/* 행복한 급식 · 화면 (홈, 단계 선택, 한 판 진행, 도감, 학습지, 설정) */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el, esc = HM.esc, app, token = 0, cur = null;
  var GAME_IDS = ['balloon', 'fishing', 'birds', 'gacha'];

  function stat() { return Object.assign({ stars: 0, coins: 0, done: 0 }, HM.jget('stat', {})); }
  function dex() { return HM.jget('dex', {}); }
  function stopAll() { token++; if (cur) { try { cur.stop(); } catch (e) { } } cur = null; HM.onMain(null); try { g.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } document.querySelectorAll('.fly-food,.hm-modal').forEach(function (x) { x.remove(); }); }
  function screen(cls) { stopAll(); app.innerHTML = ''; var s = E('div', 'hm-screen ' + cls); app.appendChild(s); window.scrollTo(0, 0); return s; }
  function topbar(s, title, back) {
    var t = E('div', 'hm-top'); if (back) { var b = E('button', 'hm-back', '← 처음으로'); b.type = 'button'; b.onclick = home; t.appendChild(b); }
    t.appendChild(E('h2', '', esc(title || ''))); var st = stat(); t.appendChild(E('span', 'hm-coin', '⭐ ' + st.stars)); s.appendChild(t); return t;
  }
  function btn(label, cls, fn) { var b = E('button', cls || 'hm-btn', label); b.type = 'button'; b.onclick = function () { HM.unlock(); HM.sfx('tick'); fn(); }; return b; }

  /* ---------- 홈 ---------- */
  function home() {
    var s = screen('home'), m = HM.todayMenu(), last = HM.jget('last', null);
    HM.art.bg(s, 'home');
    var hero = E('div', 'home-hero', '<span class="logo">' + HM.art.html('ui:logo', '🍱', 'logo-art') + '</span><h1>행복한 급식</h1><p>우리 반 친구들의 주문을 받아 급식을 배달해요!</p><div class="home-star">⭐ ' + stat().stars + '</div>');
    s.appendChild(hero);
    s.appendChild(HM.maker());
    var board = E('div', 'menuboard', '<h3>📋 오늘의 급식 <small>' + m.day + '요일</small></h3><div class="mb-row">' + HM.menuFoods(m).map(function (f) { return '<div class="mb-food"><span>' + HM.art.food(f) + '</span><b>' + esc(f.name) + '</b></div>'; }).join('') + '</div>');
    s.appendChild(board);
    var row = E('div', 'home-btns');
    row.appendChild(btn('▶ 급식 시작', 'hm-btn big primary', levelSelect));
    if (last) row.appendChild(btn('↻ 이어서 하기 <small>' + last.lv + '단계 · ' + (last.game === 'mix' ? '섞어서' : HM.games[last.game].name) + '</small>', 'hm-btn big', function () { startSession(last.lv, last.game); }));
    row.appendChild(btn('🍽 자유 급식 <small>끌어서 담기</small>', 'hm-btn big', freeScreen));
    row.appendChild(btn('📚 급식 공부 <small>글자·계산·재료</small>', 'hm-btn big', learnScreen));
    row.appendChild(btn('📖 급식 도감', 'hm-btn big', dexScreen));
    row.appendChild(btn('💞 친구 수첩', 'hm-btn big', friendsScreen));
    row.appendChild(btn('🖨 학습지 만들기', 'hm-btn big', printScreen));
    row.appendChild(btn('⚙ 설정·친구', 'hm-btn big', settings));
    s.appendChild(row);
    HM.setMainHome = null;
  }

  /* ---------- 단계·게임 고르기 ---------- */
  function levelSelect() {
    var s = screen('levels'), lv = (HM.jget('last', {}).lv) || 1, game = (HM.jget('last', {}).game) || 'mix';
    HM.art.bg(s, 'home'); topbar(s, '단계와 놀이를 골라요', true);
    var lc = E('div', 'lv-cards'); s.appendChild(lc);
    HM.LEVELS.forEach(function (L) {
      var c = E('button', 'lv-card' + (L.n === lv ? ' on' : ''), '<b>' + L.n + '</b><strong>' + esc(L.name) + '</strong><small>' + esc(L.desc) + '</small><em>친구 ' + L.friends + '명</em>'); c.type = 'button';
      c.onclick = function () { lv = L.n; lc.querySelectorAll('.lv-card').forEach(function (x) { x.classList.toggle('on', x === c); }); HM.sfx('tick'); };
      lc.appendChild(c);
    });
    var gc = E('div', 'game-cards'); s.appendChild(gc);
    [{ id: 'mix', name: '섞어서', emo: '🎲', desc: '친구마다 다른 놀이' }].concat(GAME_IDS.map(function (id) { return HM.games[id]; })).forEach(function (G) {
      var c = E('button', 'game-card' + (G.id === game ? ' on' : ''), '<span>' + G.emo + '</span><b>' + esc(G.name) + '</b><small>' + esc(G.desc) + '</small>' + (G.skill ? '<em class="sk">🎯 ' + esc(HM.SKILLS[G.skill]) + ' (3단계~)</em>' : '')); c.type = 'button';
      c.onclick = function () { game = G.id; gc.querySelectorAll('.game-card').forEach(function (x) { x.classList.toggle('on', x === c); }); HM.sfx('tick'); };
      gc.appendChild(c);
    });
    var go = btn('🍽 시작!', 'hm-btn big primary go', function () { startSession(lv, game); }); s.appendChild(go);
    HM.onMain(function () { HM.sfx('tick'); startSession(lv, game); });
  }

  /* ---------- 한 판 진행 ---------- */
  function startSession(lv, gameSel) {
    HM.jset('last', { lv: lv, game: gameSel });
    var s = screen('play'), my = token, n = HM.LEVELS[lv - 1].friends, friends = HM.friends();
    var seats = HM.shuffle([0, 1, 2, 3, 4, 5]).slice(0, n), bag = HM.shuffle(GAME_IDS), results = [], idx = 0;
    var head = E('div', 'play-head'), host = E('div', 'play-host');
    var quit = E('button', 'hm-back', '✕ 그만하기'); quit.type = 'button'; quit.onclick = home;
    head.appendChild(quit); var prog = E('div', 'play-prog'); head.appendChild(prog); s.appendChild(head); s.appendChild(host);
    function gameFor(i) { return gameSel === 'mix' ? HM.games[bag[i % bag.length]] : HM.games[gameSel]; }
    function drawProg() { prog.innerHTML = seats.map(function (_, i) { return '<i class="' + (i < idx ? 'done' : i === idx ? 'now' : '') + '"></i>'; }).join(''); }
    function alive() { return my === token; }
    function next() {
      if (!alive()) return;
      if (idx >= seats.length) return finish();
      drawProg();
      var seatIdx = seats[idx], friend = friends[seatIdx], order = HM.makeOrder(lv, friend, seatIdx), game = gameFor(idx);
      intro(order).then(function () {
        if (!alive()) return;
        var run = HM.collect(host, order, lv, game); cur = run;
        return run.done.then(function (st) {
          if (!alive()) return;
          order.react = HM.reaction(order); var dv = HM.deliver(host, order, lv, run.tray); cur = dv;
          return dv.promise.then(function (d) {
            if (!alive()) return;
            var mis = st.mistakes + d.mistakes, stars = mis === 0 ? 3 : mis <= 2 ? 2 : 1;
            var gain = 1 + (stars === 3 ? 1 : 0) + (order.special ? 2 : 0), up = HM.bond.add(order.friend.id, gain);
            if (order.special) HM.bond.discover(order.friend.id, order.special);
            results.push({ order: order, stars: stars, mis: mis, up: up, gain: gain, st: st }); idx++; next();
          });
        });
      });
    }
    function intro(order) {
      return new Promise(function (res) {
        host.innerHTML = '';
        var box = E('div', 'intro');
        box.innerHTML = '<div class="intro-av">' + HM.art.friend(order.friend, false) + '</div><div class="intro-bubble"><b>' + esc(order.text) + '</b>' +
          '<div class="intro-items">' + order.items.map(function (it) { var f = HM.food(it.id); return '<span class="ord-chip"><span class="ord-ic">' + HM.art.food(f) + '</span><span class="ord-name">' + esc(f.name) + '</span>' + (it.n > 1 ? '<span class="ord-n">×' + it.n + '</span>' : '') + '</span>'; }).join('') + '</div>' +
          (order.avoid.length ? '<div class="ord-avoid">🚫 ' + order.avoid.map(function (id) { return esc(HM.food(id).name); }).join(', ') + ' 못 먹어요</div>' : '') + '</div>';
        var ok = E('button', 'hm-main hm-glow', '🍽 주문 받았어요!'); ok.type = 'button';
        function go() { if (!alive()) return; HM.onMain(null); res(); }
        ok.onclick = function () { HM.unlock(); go(); }; box.appendChild(ok); host.appendChild(box);
        HM.onMain(go); HM.say(HM.orderSpeak(order));
        cur = { stop: function () { } };
      });
    }
    function finish() {
      var st = stat(), tot = results.reduce(function (a, r) { return a + r.stars; }, 0), dx = dex(), fresh = [];
      results.forEach(function (r) { r.order.items.forEach(function (it) { if (!dx[it.id]) fresh.push(it.id); dx[it.id] = (dx[it.id] || 0) + it.n; }); });
      st.stars += tot; st.coins += tot * 2; st.done += results.length; HM.jset('stat', st); HM.jset('dex', dx);
      host.innerHTML = ''; drawProg(); prog.innerHTML = '';
      var box = E('div', 'result'); HM.sfx('win'); HM.say('모두 배달했어요! 정말 잘했어요!');
      box.innerHTML = '<h2>🎉 모두 배달했어요!</h2><div class="res-stars">⭐ ' + tot + ' / ' + results.length * 3 + '</div>' +
        '<div class="res-list">' + results.map(function (r) { return '<div class="res-row"><span class="res-av">' + HM.art.friend(r.order.friend, true) + '</span><b>' + esc(r.order.friend.name) + '</b><span class="res-it">' + r.order.items.map(function (it) { return HM.art.food(HM.food(it.id)); }).join('') + '</span><span class="res-st">' + '⭐'.repeat(r.stars) + '</span><span class="res-bond">💞+' + r.gain + '</span></div>' + (r.up ? '<div class="res-up">🎉 ' + esc(HM.josa(r.order.friend.name, '과', '와')) + ' <b>' + esc(r.up.name) + '</b>이(가) 되었어요! 선물 ' + r.up.gift + '</div>' : ''); }).join('') + '</div>';
      var uniq = fresh.filter(function (id, i) { return fresh.indexOf(id) === i; });
      if (uniq.length) box.appendChild(E('div', 'res-new', '<b>📖 새로 도감에 담았어요!</b><div>' + uniq.map(function (id) { return '<span class="dx-mini">' + HM.art.food(HM.food(id)) + '<i>' + esc(HM.food(id).name) + '</i></span>'; }).join('') + '</div>'));
      var row = E('div', 'home-btns');
      row.appendChild(btn('↻ 또 하기', 'hm-btn big primary', function () { startSession(lv, gameSel); }));
      if (lv < 5) row.appendChild(btn('⬆ ' + (lv + 1) + '단계', 'hm-btn big', function () { startSession(lv + 1, gameSel); }));
      row.appendChild(btn('📖 도감', 'hm-btn big', dexScreen)); row.appendChild(btn('🏠 처음으로', 'hm-btn big', home));
      box.appendChild(row); host.appendChild(box);
      HM.onMain(function () { startSession(lv, gameSel); });
    }
    next();
  }

  /* ---------- 도감 ---------- */
  function dexScreen() {
    var s = screen('dex'), dx = dex(), have = HM.FOODS.filter(function (f) { return dx[f.id]; }).length;
    HM.art.bg(s, 'home'); topbar(s, '급식 도감 ' + have + ' / ' + HM.FOODS.length, true);
    var detail = E('div', 'dx-detail', '<span>음식을 눌러 보세요</span>'); s.appendChild(detail);
    Object.keys(HM.CATS).forEach(function (cat) {
      var list = HM.FOODS.filter(function (f) { return f.cat === cat; }); if (!list.length) return;
      s.appendChild(E('h3', 'dx-cat', HM.CATS[cat].emo + ' ' + HM.CATS[cat].name));
      var grid = E('div', 'dx-grid');
      list.forEach(function (f) {
        var n = dx[f.id] || 0, c = E('button', 'dx-card' + (n ? '' : ' locked'), '<span>' + HM.art.food(f) + '</span><b>' + (n ? esc(f.name) : '???') + '</b>' + (n ? '<i>×' + n + '</i>' : '')); c.type = 'button';
        c.onclick = function () { HM.unlock(); HM.sfx('tick'); detail.innerHTML = '<span class="dx-big">' + HM.art.food(f) + '</span><b>' + (n ? esc(f.name) : '아직 몰라요') + '</b><small>' + (n ? n + '번 배달했어요' : '배달하면 도감에 담겨요') + '</small>'; if (n) HM.say(f.name); };
        grid.appendChild(c);
      });
      s.appendChild(grid);
    });
  }

  /* ---------- 급식 공부 (글자 퀴즈 · 계산대 · 재료 마트) ---------- */
  function learnScreen() {
    var s = screen('learn'), L = HM.jget('learnlast', { game: 'letters', lv: 1 }), game = L.game, lv = L.lv;
    HM.art.bg(s, 'home'); topbar(s, '급식 공부', true);
    var gc = E('div', 'game-cards'), lc = E('div', 'learn-lv'); s.appendChild(gc); s.appendChild(lc);
    function drawLv() { lc.innerHTML = ''; HM.learn[game].lv.forEach(function (t, i) { var c = E('button', 'lv-card' + (i + 1 === lv ? ' on' : ''), '<b>' + (i + 1) + '</b><small>' + esc(t) + '</small>'); c.type = 'button'; c.onclick = function () { lv = i + 1; HM.sfx('tick'); drawLv(); }; lc.appendChild(c); }); }
    ['letters', 'shop', 'mart'].forEach(function (id) {
      var G = HM.learn[id], c = E('button', 'game-card' + (id === game ? ' on' : ''), '<span>' + G.emo + '</span><b>' + esc(G.name) + '</b><small>' + esc(G.desc) + '</small><em class="sk">🎯 ' + esc(G.skill) + '</em>'); c.type = 'button';
      c.onclick = function () { game = id; gc.querySelectorAll('.game-card').forEach(function (x) { x.classList.toggle('on', x === c); }); HM.sfx('tick'); drawLv(); }; gc.appendChild(c);
    });
    drawLv();
    s.appendChild(btn('▶ 시작!', 'hm-btn big primary go', function () { HM.jset('learnlast', { game: game, lv: lv }); runLearn(game, lv); }));
  }
  function runLearn(game, lv) {
    var s = screen('learnplay'), G = HM.learn[game], host = E('div', 'qz-host');
    HM.art.bg(s, game === 'mart' ? (HM.art.has('bg:mart') ? 'mart' : 'kitchen') : 'class'); topbar(s, G.name + ' · ' + lv + '단계', true); s.appendChild(host);
    var q = HM.quiz(host, { name: G.name, emo: G.emo, lv: lv, qs: G.make(lv) }); cur = q; var my = token;
    q.promise.then(function (r) {
      if (my !== token) return;
      var st = stat(), stars = r.clean; st.stars += stars; HM.jset('stat', st);
      var rec = HM.jget('learn', { games: {}, wrong: {} }), gr = rec.games[game] || { plays: 0, right: 0, n: 0, mis: 0 };
      gr.plays++; gr.right += r.clean; gr.n += r.n; gr.mis += r.mistakes; rec.games[game] = gr;
      Object.keys(r.wrong).forEach(function (k) { rec.wrong[k] = (rec.wrong[k] || 0) + r.wrong[k]; }); HM.jset('learn', rec);
      host.innerHTML = '<div class="qz-card qz-result"><h2>' + (stars >= r.n ? '👏 모두 잘했어요!' : '🎉 끝까지 했어요!') + '</h2><div class="qz-stars">' + '⭐'.repeat(stars) + '<span>' + '☆'.repeat(r.n - stars) + '</span></div><p>한 번에 맞힌 문제 ' + stars + ' / ' + r.n + '</p></div>';
      var again = btn('↻ 다시 하기', 'hm-btn big primary', function () { runLearn(game, lv); }), more = btn(lv < 5 ? '다음 단계 ▶' : '다른 공부', 'hm-btn big', function () { if (lv < 5) runLearn(game, lv + 1); else learnScreen(); });
      var row = E('div', 'home-btns'); row.appendChild(again); row.appendChild(more); row.appendChild(btn('📚 공부 고르기', 'hm-btn big', learnScreen)); host.appendChild(row);
      HM.say(stars >= r.n ? '모두 잘했어요!' : '끝까지 했어요!');
    });
  }

  /* ---------- 자유 급식 ---------- */
  function freeScreen() {
    var s = screen('free'); HM.art.bg(s, 'kitchen'); topbar(s, '자유 급식', true);
    HM.freeMode(s, function () { var st = stat(); st.stars += 1; HM.jset('stat', st); var c = s.querySelector('.hm-coin'); if (c) c.textContent = '⭐ ' + st.stars; });
  }

  /* ---------- 친구 수첩 ---------- */
  function friendsScreen() {
    var s = screen('friendsbook'); HM.art.bg(s, 'home'); topbar(s, '친구 수첩', true);
    var grid = E('div', 'fb-grid'); s.appendChild(grid);
    HM.friends().forEach(function (f) {
      var n = HM.bond.get(f.id), ti = HM.bond.tierIdx(n), T = HM.bond.TIERS[ti], nx = HM.bond.next(f.id), known = HM.bond.known(f.id);
      var pct = nx ? Math.round((n - T.min) / (nx.min - T.min) * 100) : 100;
      var c = E('div', 'fb-card tier' + ti, '<div class="fb-av">' + HM.art.friend(f, ti >= 1) + '</div><h3>' + esc(f.name) + ' <span>' + T.emo + '</span></h3><b class="fb-t">' + esc(T.name) + '</b>' +
        '<div class="fb-bar"><i style="width:' + pct + '%"></i></div><small>' + (nx ? esc(nx.name) + '까지 💞 ' + (nx.min - n) : '최고의 절친!') + '</small>' +
        '<div class="fb-gifts">' + HM.bond.TIERS.map(function (t, i) { return '<span class="' + (i <= ti ? 'on' : '') + '">' + (t.gift || '·') + '</span>'; }).join('') + '</div>' +
        '<div class="fb-likes"><b>좋아하는 음식</b> ' + (f.likes || []).map(function (id) { return known.indexOf(id) >= 0 ? '<span class="lk">' + HM.art.food(HM.food(id)) + '</span>' : '<span class="lk q">❓</span>'; }).join('') + '</div>' +
        ((f.avoid || []).length ? '<div class="fb-avoid">🚫 ' + f.avoid.map(function (t) { return esc(HM.TAGNAMES[t]); }).join(', ') + ' 못 먹어요</div>' : ''));
      grid.appendChild(c);
    });
    s.appendChild(E('p', 'fb-tip', '2단계부터 친구가 ⭐ 특별 주문(제일 좋아하는 음식)을 할 때가 있어요. 배달하면 좋아하는 음식을 알게 돼요!'));
  }

  /* ---------- 학습지 ---------- */
  function printScreen() {
    var s = screen('printscr'), o = HM.jget('ws', { type: 'order', lv: 2, pages: 1, key: true, day: new Date().getDay() % 5 }), seed = (Math.random() * 1e9) | 0;
    HM.art.bg(s, 'home'); topbar(s, '학습지 만들기', true);
    var ctl = E('div', 'ws-ctl'), prev = E('div', 'ws-preview'); s.appendChild(ctl); s.appendChild(prev);
    function draw() {
      HM.jset('ws', o);
      ctl.innerHTML = '<div class="ws-types">' + HM.WS_TYPES.map(function (t) { return '<button type="button" class="game-card' + (o.type === t.id ? ' on' : '') + '" data-t="' + t.id + '"><span>' + t.emo + '</span><b>' + esc(t.name) + '</b><small>' + esc(t.desc) + '</small></button>'; }).join('') + '</div>' +
        '<div class="ws-opts"><label>단계 <select data-k="lv">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (o.lv === n ? ' selected' : '') + '>' + n + '단계</option>'; }).join('') + '</select></label>' +
        '<label>장 수 <select data-k="pages">' + [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (o.pages === n ? ' selected' : '') + '>' + n + '장</option>'; }).join('') + '</select></label>' +
        (o.type === 'tray' ? '<label>요일 <select data-k="day">' + ['월', '화', '수', '목', '금'].map(function (d, i) { return '<option value="' + i + '"' + (o.day === i ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="chk"><input type="checkbox" data-k="key"' + (o.key ? ' checked' : '') + '> 정답지도 함께</label>' +
        '<button type="button" class="hm-btn" data-a="new">🔀 새로 만들기</button><button type="button" class="hm-btn primary" data-a="print">🖨 인쇄하기</button></div>';
      ctl.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { o.type = b.dataset.t; draw(); }; });
      ctl.querySelectorAll('select').forEach(function (sel) { sel.onchange = function () { o[sel.dataset.k] = +sel.value; draw(); }; });
      ctl.querySelector('input').onchange = function (e) { o.key = e.target.checked; draw(); };
      ctl.querySelector('[data-a=new]').onclick = function () { seed = (Math.random() * 1e9) | 0; draw(); };
      ctl.querySelector('[data-a=print]').onclick = function () { doPrint(); };
      prev.innerHTML = html();
    }
    function html() { var op = { pages: o.pages, day: o.day, seed: seed }; return HM.worksheet(o.type, o.lv, op, false) + (o.key ? HM.worksheet(o.type, o.lv, op, true) : ''); }
    function doPrint() {
      var host = document.getElementById('print-host'); host.innerHTML = html(); document.body.classList.add('printing');
      setTimeout(function () { try { g.print(); } catch (e) { } setTimeout(function () { document.body.classList.remove('printing'); host.innerHTML = ''; }, 300); }, 120);
    }
    draw();
  }

  /* ---------- 설정 ---------- */
  function settings() {
    var m = E('div', 'hm-modal'), box = E('div', 'hm-modal-box'), S = HM.settings(), fr = HM.friends();
    function tog(k, label, hint) { return '<label class="tg"><input type="checkbox" data-s="' + k + '"' + (S[k] ? ' checked' : '') + '><span><b>' + label + '</b><small>' + hint + '</small></span></label>'; }
    box.innerHTML = '<h2>⚙ 설정</h2>' + tog('sound', '효과음', '소리를 켜요') + tog('voice', '읽어 주기', '주문과 음식 이름을 읽어 줘요') + tog('calm', '차분한 화면', '움직임과 반짝임을 줄여요') +
      tog('slow', '천천히', '느리게 움직이고 도움을 많이 줘요') + tog('scan', '버튼 한 번 모드', '스페이스·엔터·↑ 또는 큰 버튼 하나로 해요') +
      '<h3>우리 반 친구 이름 (이 기기에만 저장돼요)</h3><div class="fr-edit">' + fr.map(function (f, i) {
        return '<div class="fr-row"><span class="fr-av">' + HM.art.friend(f, false) + '</span><input type="text" maxlength="6" data-n="' + i + '" value="' + esc(f.name) + '"><div class="fr-av-tags">' +
          Object.keys(HM.TAGNAMES).map(function (t) { return '<label><input type="checkbox" data-a="' + i + '" data-t="' + t + '"' + ((f.avoid || []).indexOf(t) >= 0 ? ' checked' : '') + '>' + HM.TAGNAMES[t] + '</label>'; }).join('') + '</div></div>';
      }).join('') + '</div><small class="hint">체크한 음식은 그 친구가 못 먹어요. (4단계부터 피해서 담아요)</small>' +
      '<div class="modal-btns"><button type="button" class="hm-btn" data-x="reset">기록 지우기</button><button type="button" class="hm-btn primary" data-x="ok">완료</button></div>';
    m.appendChild(box); document.body.appendChild(m);
    box.querySelectorAll('[data-s]').forEach(function (i) { i.onchange = function () { HM.setSetting(i.dataset.s, i.checked); }; });
    box.querySelector('[data-x=ok]').onclick = function () {
      var list = HM.friends().map(function (f, i) {
        var nm = box.querySelector('[data-n="' + i + '"]').value.trim() || f.name;
        var av = Object.keys(HM.TAGNAMES).filter(function (t) { return box.querySelector('[data-a="' + i + '"][data-t="' + t + '"]').checked; });
        return { name: nm, avoid: av };
      });
      HM.saveFriends(list); m.remove(); if (document.querySelector('.hm-screen.home')) home();
    };
    box.querySelector('[data-x=reset]').onclick = function () { if (g.confirm('별과 도감 기록을 모두 지울까요?')) { HM.jset('stat', {}); HM.jset('dex', {}); HM.jset('last', null); m.remove(); home(); } };
  }

  /* ---------- 시작 ---------- */
  HM.go = { friends: friendsScreen, free: freeScreen, learn: learnScreen, runLearn: runLearn, home: home, levels: levelSelect, dex: dexScreen, print: printScreen, settings: settings, start: startSession };
  function boot() {
    app = document.getElementById('app'); HM.applySettings();
    var host = document.createElement('div'); host.id = 'print-host'; document.body.appendChild(host);
    HM.art.preload().then(function () { document.getElementById('boot') && document.getElementById('boot').remove(); home(); });
    if ('serviceWorker' in navigator && location.protocol !== 'file:' && !/localhost|127\.0\.0\.1/.test(location.host)) navigator.serviceWorker.register('sw.js').catch(function () { });
    document.addEventListener('pointerdown', function () { HM.unlock(); }, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
