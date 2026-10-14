/* 행복한 급식 · 그림 자동 찾기
   img/ 폴더에 규칙 이름으로 파일을 넣으면 코드를 고치지 않아도 자동으로 쓰여요. 없으면 이모지로 보여요.
   food:<id> → img/food/<id>.webp   friend:<id> → img/friend/<id>.webp   ui:<name> → img/ui/<name>.webp   bg:<name> → img/bg/<name>.webp */
(function (g) {
  'use strict';
  var HM = g.HM, ok = {};
  var UI = ['tray', 'balloon', 'hook', 'bird', 'gacha', 'capsule', 'desk', 'pond', 'basket', 'logo', 'mascot', 'star', 'menuboard', 'coin100', 'coin500', 'bill1000', 'pot', 'cashier'];
  var BG = ['home', 'balloon', 'fishing', 'birds', 'gacha', 'class', 'kitchen', 'mart'];
  function path(key) { return 'img/' + key.replace(':', '/') + '.webp'; }
  HM.art = {
    ok: ok, path: path,
    keys: function () {
      var k = []; HM.FOODS.forEach(function (f) { k.push('food:' + f.id); });
      HM.friends().forEach(function (f) { k.push('friend:' + f.id, 'friend:' + f.id + '_happy'); });
      Object.keys(HM.ING || {}).forEach(function (i) { k.push('ing:' + i); });
      UI.forEach(function (u) { k.push('ui:' + u); }); BG.forEach(function (b) { k.push('bg:' + b); }); return k;
    },
    preload: function () {
      var keys = HM.art.keys();
      return Promise.all(keys.map(function (key) {
        return new Promise(function (res) { var im = new Image(); im.onload = function () { ok[key] = true; res(); }; im.onerror = function () { res(); }; im.src = path(key); });
      }));
    },
    has: function (key) { return !!ok[key]; },
    /* 그림이 있으면 <img>, 없으면 이모지 */
    html: function (key, emo, cls) {
      return ok[key] ? '<img class="art ' + (cls || '') + '" src="' + path(key) + '" alt="" draggable="false">' : '<span class="emo ' + (cls || '') + '">' + (emo || '') + '</span>';
    },
    food: function (f, cls) { return HM.art.html('food:' + f.id, f.emo, cls); },
    friend: function (f, happy, cls) { var k = 'friend:' + f.id + (happy ? '_happy' : ''); if (happy && !ok[k]) k = 'friend:' + f.id; return HM.art.html(k, f.emo, cls); },
    bg: function (el, name, fallback) { if (ok['bg:' + name]) { el.style.backgroundImage = 'url(' + path('bg:' + name) + ')'; el.classList.add('has-bg'); } else if (fallback) el.style.background = fallback; }
  };
})(window);
