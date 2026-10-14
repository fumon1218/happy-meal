/* 행복한 급식 · 친구와 친해지기 (친밀도, 특별 주문, 반응) */
(function (g) {
  'use strict';
  var HM = g.HM;
  var TIERS = [
    { min: 0, name: '처음 만난 친구', emo: '🙂', gift: '' },
    { min: 3, name: '친구', emo: '😊', gift: '🌸' },
    { min: 8, name: '단짝', emo: '🥰', gift: '🍀' },
    { min: 15, name: '절친', emo: '🤩', gift: '🏅' }
  ];
  function all() { return HM.jget('bond', {}); }
  HM.bond = {
    TIERS: TIERS,
    get: function (id) { return all()[id] || 0; },
    tierIdx: function (n) { var t = 0; TIERS.forEach(function (x, i) { if (n >= x.min) t = i; }); return t; },
    tier: function (id) { return TIERS[HM.bond.tierIdx(HM.bond.get(id))]; },
    next: function (id) { var n = HM.bond.get(id), i = HM.bond.tierIdx(n); return TIERS[i + 1] || null; },
    add: function (id, n) { var b = all(), before = HM.bond.tierIdx(b[id] || 0); b[id] = (b[id] || 0) + n; HM.jset('bond', b); var after = HM.bond.tierIdx(b[id]); return after > before ? TIERS[after] : null; },
    /* 좋아하는 음식을 알게 됐는지 */
    known: function (id) { return HM.jget('liked', {})[id] || []; },
    discover: function (id, food) { var l = HM.jget('liked', {}); l[id] = l[id] || []; if (l[id].indexOf(food) < 0) l[id].push(food); HM.jset('liked', l); }
  };
  /* 배달했을 때 친구가 하는 말 */
  HM.reaction = function (order) {
    var f = order.friend;
    if (order.special) return '와! 내가 제일 좋아하는 ' + HM.food(order.special).name + '! 고마워!';
    var t = HM.bond.tierIdx(HM.bond.get(f.id));
    return ['맛있게 먹었어요!', '고마워! 맛있게 먹을게.', '역시 단짝이야! 정말 고마워.', '너는 최고의 절친이야!'][t];
  };
})(window);
