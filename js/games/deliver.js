/* 교실 배달 — 완성한 식판을 주문한 친구 자리까지 배달해요 */
(function (g) {
  'use strict';
  var HM = g.HM, E = HM.el;
  /* 반환: Promise({mistakes}) */
  HM.deliver = function (host, order, level, tray) {
    host.innerHTML = '';
    var friends = HM.friends(), assisted = HM.assisted(level), target = order.seat, mistakes = 0, busy = false, finished = false;
    var posName = HM.SEAT_NAMES[target];
    var head = E('div', 'hm-dhead'), scene = E('div', 'hm-class'), seatsEl = E('div', 'seats'), bottom = E('div', 'hm-bottom'), main = E('button', 'hm-main', '🚚 배달!');
    main.type = 'button';
    function prompt() {
      var t = level <= 3 ? order.friend.name + '에게 배달해요' : level === 4 ? posName + ' 자리에 배달해요' : order.friend.name + '에게 배달해요';
      head.innerHTML = '<b>' + HM.esc(t) + '</b>' + (level <= 3 ? '<small>' + HM.esc(posName) + '</small>' : level === 4 ? '<small>' + HM.esc(order.friend.name) + '이(가) 앉아 있어요</small>' : '');
      return t;
    }
    var promptText = prompt();
    HM.art.bg(scene, 'class');
    var seatEls = [];
    friends.forEach(function (f, i) {
      var s = E('button', 'seat'); s.type = 'button'; s.dataset.i = i;
      s.innerHTML = '<span class="desk">' + HM.art.html('ui:desk', '', 'desk-art') + '</span><span class="who">' + HM.art.friend(f, false) + '</span>' + (level <= 3 ? '<em class="tag">' + HM.esc(f.name) + '</em>' : '');
      s.onclick = function () { HM.unlock(); go(i); };
      seatsEl.appendChild(s); seatEls.push(s);
    });
    scene.appendChild(seatsEl);
    var trayWrap = E('div', 'deliv-tray'); trayWrap.appendChild(tray.el); scene.appendChild(trayWrap);
    host.appendChild(head); host.appendChild(scene); host.appendChild(bottom); bottom.appendChild(main);
    var banner = E('div', 'hm-banner'); scene.appendChild(banner);
    function say(t, ms) { banner.textContent = t; banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); setTimeout(function () { banner.classList.remove('show'); }, (ms || 1400) / (HM.FAST ? 4 : 1)); }
    HM.say(promptText);
    if (assisted) { seatEls[target].classList.add('hm-glow'); main.classList.add('hm-glow'); }
    else main.hidden = true;
    var resolve; var done = new Promise(function (r) { resolve = r; });

    function move(i, back) {
      var s = seatEls[i], sr = s.getBoundingClientRect(), sc = scene.getBoundingClientRect(), tw = trayWrap.getBoundingClientRect();
      var dx = back ? 0 : (sr.left + sr.width / 2) - (sc.left + sc.width / 2), dy = back ? 0 : (sr.top + sr.height * .55) - (tw.top + tw.height / 2);
      trayWrap.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (back ? 1 : .5) + ')';
    }
    function go(i) {
      if (busy || finished) return; busy = true; seatEls.forEach(function (x) { x.classList.remove('hm-glow'); }); main.classList.remove('hm-glow');
      HM.sfx('tick'); move(i, false);
      setTimeout(function () {
        if (i === target) {
          finished = true; HM.sfx('win'); var s = seatEls[i]; s.classList.add('happy');
          var who = s.querySelector('.who'); who.innerHTML = HM.art.friend(order.friend, true) + '<span class="heart">😋</span>';
          say('맛있게 먹었어요!', 1600); HM.say(order.friend.name + ': 맛있게 먹었어요!');
          setTimeout(function () { resolve({ mistakes: mistakes }); }, 1900 / (HM.FAST ? 4 : 1));
        } else {
          mistakes++; HM.sfx('no');
          var wrong = friends[i];
          var hint = level >= 5 && mistakes === 1 ? '여기는 ' + wrong.name + ' 자리예요. ' + order.friend.name + '는 ' + posName + '에 있어요' : '여기는 ' + wrong.name + ' 자리예요. 다시 찾아봐요';
          say(hint, 2000); HM.say(hint, { noRepeat: true });
          setTimeout(function () { move(i, true); busy = false; if (assisted || mistakes >= 2) { seatEls[target].classList.add('hm-glow'); } }, 700 / (HM.FAST ? 4 : 1));
        }
      }, 800 / (HM.FAST ? 4 : 1));
    }
    main.onclick = function () { HM.unlock(); go(target); };
    HM.onMain(function () { if (assisted) go(target); });
    return { promise: done, stop: function () { HM.onMain(null); } };
  };
})(window);
