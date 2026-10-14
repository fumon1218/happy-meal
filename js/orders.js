/* 행복한 급식 · 주문 만들기 */
(function (g) {
  'use strict';
  var HM = g.HM;
  var COUNT = [1, 2, 3, 3, 4];     /* 수준별 음식 가짓수 */
  /* 친구 한 명의 주문 */
  HM.makeOrder = function (lv, friend, seat) {
    var menu = HM.todayMenu(), all = HM.menuFoods(menu), avoid = HM.avoidIds(friend, menu);
    var pool = all.filter(function (f) { return avoid.indexOf(f.id) < 0; });
    var byCat = {}; pool.forEach(function (f) { (byCat[f.cat] = byCat[f.cat] || []).push(f); });
    var cats = HM.shuffle(Object.keys(byCat)), picks = [];
    /* 밥·국을 우선 한 번씩, 나머지는 다양한 종류로 */
    var order = ['rice', 'soup', 'side', 'fruit', 'drink'];
    if (lv === 1) cats = HM.shuffle(['side', 'fruit', 'rice', 'drink']).filter(function (c) { return byCat[c]; });
    else cats = HM.shuffle(order).filter(function (c) { return byCat[c]; });
    var n = Math.min(COUNT[lv - 1], pool.length);
    for (var i = 0; picks.length < n && i < 40; i++) { var c = cats[i % cats.length], list = byCat[c], f = list[HM.rand(list.length)]; if (picks.indexOf(f) < 0) picks.push(f); }
    var items = picks.map(function (f) { return { id: f.id, n: 1 }; });
    if (lv >= 3) {                      /* 반찬·과일은 2개 주문도 */
      var many = HM.shuffle(items.filter(function (it) { var k = HM.food(it.id).cat; return k === 'side' || k === 'fruit'; }));
      if (many[0]) many[0].n = 2; if (lv >= 5 && many[1]) many[1].n = 2;
    }
    var shownAvoid = lv >= 4 ? avoid : [];
    return { friend: friend, seat: seat, items: items, avoid: shownAvoid, level: lv, text: HM.orderText(friend, items), menu: menu };
  };
  HM.orderText = function (friend, items) {
    var parts = items.map(function (it) { var f = HM.food(it.id); return f.name + (it.n > 1 ? ' ' + it.n + '개' : ''); });
    return HM.josa(friend.name, '은', '는') + ' ' + parts.join(', ') + ' 주세요.';
  };
  HM.orderSpeak = function (o) {
    var s = o.text; if (o.avoid.length) s += ' ' + o.avoid.map(function (id) { return HM.food(id).name; }).join(', ') + ' 못 먹어요.'; return s;
  };
})(window);
