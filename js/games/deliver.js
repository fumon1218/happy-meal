/* 교실 배달 — 완성한 식판을 주문한 친구 자리까지 가져가요.
   1~3단계: 자리를 눌러요. 4~5단계: 화살표로 걸어가서 "놓기"를 눌러요 (앞·뒤·왼쪽·오른쪽 위치어 익히기) */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  /* 반환: Promise({mistakes}) */
  HM.deliver = function (host, order, level, tray) {
    host.innerHTML = '';
    var friends = HM.friends(), S = HM.settings(), assisted = HM.assisted(level), walk = level >= 4 && !S.scan && !S.slow;
    var target = order.seat, mistakes = 0, busy = false, finished = false;
    var posName = HM.SEAT_NAMES[target], tr = Math.floor(target / 3), tc = target % 3;
    var head = E('div', 'hm-dhead'), scene = E('div', 'hm-class'), seatsEl = E('div', 'seats'), bottom = E('div', 'hm-bottom'), main = E('button', 'hm-main', walk ? '📥 놓기' : '🚚 배달!');
    main.type = 'button';
    function prompt() {
      var t = level <= 3 ? order.friend.name + '에게 배달해요' : level === 4 ? posName + ' 자리에 배달해요' : order.friend.name + '에게 배달해요';
      head.innerHTML = '<b>' + HM.esc(t) + '</b>' + (level <= 3 ? '<small>' + HM.esc(posName) + '</small>' : level === 4 ? '<small>' + HM.esc(order.friend.name) + '이(가) 앉아 있어요</small>' : walk ? '<small>화살표로 걸어가서 놓아요</small>' : '');
      return t;
    }
    var promptText = prompt();
    HM.art.bg(scene, 'class');
    var seatEls = [];
    friends.forEach(function (f, i) {
      var s = E('button', 'seat'); s.type = 'button'; s.dataset.i = i;
      s.innerHTML = '<span class="desk">' + HM.art.html('ui:desk', '', 'desk-art') + '</span><span class="who">' + HM.art.friend(f, false) + '</span>' + (level <= 3 ? '<em class="tag">' + HM.esc(f.name) + '</em>' : '');
      s.onclick = function () { HM.unlock(); if (walk) { say('화살표로 걸어가서 놓아요', 1200); return; } go(i); };
      seatsEl.appendChild(s); seatEls.push(s);
    });
    scene.appendChild(seatsEl);
    var trayWrap = E('div', 'deliv-tray'); trayWrap.appendChild(tray.el); scene.appendChild(trayWrap);
    var pad = null;
    if (walk) {   /* 방향 버튼 */
      pad = E('div', 'hm-pad', '<button type="button" data-d="up">⬆</button><div><button type="button" data-d="left">⬅</button><button type="button" data-d="down">⬇</button><button type="button" data-d="right">➡</button></div>');
      bottom.appendChild(pad);
    }
    host.appendChild(head); host.appendChild(scene); host.appendChild(bottom); bottom.appendChild(main);
    var banner = E('div', 'hm-banner'); scene.appendChild(banner);
    function say(t, ms) { banner.textContent = t; banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); setTimeout(function () { banner.classList.remove('show'); }, (ms || 1400) / (HM.FAST ? 4 : 1)); }
    HM.say(promptText);
    if (!walk && assisted) { seatEls[target].classList.add('hm-glow'); main.classList.add('hm-glow'); }
    else if (!walk) main.hidden = true;
    var resolve; var done = new Promise(function (r) { resolve = r; });
    var react = order.react || '맛있게 먹었어요!';

    function finish() {
      finished = true; HM.sfx('win'); var s = seatEls[target]; s.classList.add('happy');
      var who = s.querySelector('.who'); who.innerHTML = HM.art.friend(order.friend, true) + '<span class="heart">' + (order.special ? '💖' : '😋') + '</span>';
      say(react, 2200); HM.say(order.friend.name + ': ' + react);
      setTimeout(function () { resolve({ mistakes: mistakes }); }, 2300 / (HM.FAST ? 4 : 1));
    }
    function wrongSeat(i) {
      mistakes++; HM.sfx('no'); var wrong = friends[i];
      var hint = level >= 5 && mistakes === 1 ? '여기는 ' + wrong.name + ' 자리예요. ' + order.friend.name + '는 ' + posName + '에 있어요' : '여기는 ' + wrong.name + ' 자리예요. 다시 찾아봐요';
      say(hint, 2000); HM.say(hint, { noRepeat: true });
    }
    /* ----- 눌러서 배달 (1~3단계, 도움 모드) ----- */
    function move(i, back) {
      var s = seatEls[i], sr = s.getBoundingClientRect(), sc = scene.getBoundingClientRect(), tw = trayWrap.getBoundingClientRect();
      var dx = back ? 0 : (sr.left + sr.width / 2) - (sc.left + sc.width / 2), dy = back ? 0 : (sr.top + sr.height * .55) - (tw.top + tw.height / 2);
      trayWrap.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (back ? 1 : .5) + ')';
    }
    function go(i) {
      if (busy || finished) return; busy = true; seatEls.forEach(function (x) { x.classList.remove('hm-glow'); }); main.classList.remove('hm-glow');
      HM.sfx('tick'); move(i, false);
      setTimeout(function () {
        if (i === target) finish();
        else { wrongSeat(i); setTimeout(function () { move(i, true); busy = false; if (assisted || mistakes >= 2) seatEls[target].classList.add('hm-glow'); }, 700 / (HM.FAST ? 4 : 1)); }
      }, 800 / (HM.FAST ? 4 : 1));
    }
    /* ----- 걸어서 배달 (4~5단계) ----- */
    var r = 2, c = 1, home = null;   /* r: 0 앞줄, 1 뒷줄, 2 복도(출발) */
    function place() {
      var sc = scene.getBoundingClientRect(), tw = trayWrap.getBoundingClientRect(), s = seatEls[(r === 2 ? 1 : r) * 3 + c], sr = s.getBoundingClientRect();
      var cx = sr.left + sr.width / 2, cy = r === 2 ? sr.bottom + 34 : sr.top + sr.height * .55;
      if (!home) home = { x: tw.left + tw.width / 2, y: tw.top + tw.height / 2 };
      trayWrap.style.transform = 'translate(' + (cx - home.x) + 'px,' + (cy - home.y) + 'px) scale(.45)';
    }
    function stepTo(nr, nc) {
      if (finished || busy) return;
      if (nr < 0 || nr > 2 || nc < 0 || nc > 2) { HM.sfx('no'); say('더 갈 수 없어요', 900); return; }
      r = nr; c = nc; HM.sfx('tick'); place(); hint();
    }
    function putDown() {
      if (finished || busy) return; HM.unlock();
      if (r === 2) { say('자리로 가서 놓아요', 1000); HM.sfx('no'); return; }
      var i = r * 3 + c; busy = true;
      if (i === target) { finish(); } else { wrongSeat(i); setTimeout(function () { busy = false; hint(); }, 900 / (HM.FAST ? 4 : 1)); }
    }
    function nextMove() { if (r === 2 && tr < 2) return 'up'; if (c < tc) return 'right'; if (c > tc) return 'left'; if (r > tr) return 'up'; if (r < tr) return 'down'; return 'put'; }
    function hint() {
      if (!pad) return; var nm = nextMove(), on = mistakes >= 2 || S.slow;
      [].forEach.call(pad.querySelectorAll('button'), function (b) { b.classList.toggle('hm-glow', on && b.dataset.d === nm); });
      main.classList.toggle('hm-glow', on && nm === 'put'); seatEls.forEach(function (x, k) { x.classList.toggle('here', !finished && r < 3 && k === r * 3 + c && r !== 2); });
    }
    var DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    function onKey(e) {
      var m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key]; if (!m) { if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement && document.activeElement.tagName === 'BUTTON') return; e.preventDefault(); putDown(); } return; }
      e.preventDefault(); stepTo(r + DIR[m][0], c + DIR[m][1]);
    }
    if (walk) {
      [].forEach.call(pad.querySelectorAll('button'), function (b) { b.onclick = function () { HM.unlock(); var d = DIR[b.dataset.d]; stepTo(r + d[0], c + d[1]); }; });
      main.onclick = putDown; document.addEventListener('keydown', onKey);
      setTimeout(place, 60); setTimeout(hint, 100);
      main.classList.remove('hm-glow');
    } else { main.onclick = function () { HM.unlock(); go(target); }; HM.onMain(function () { if (assisted) go(target); }); }
    return { promise: done, stop: function () { HM.onMain(null); document.removeEventListener('keydown', onKey); } };
  };
})(window);
