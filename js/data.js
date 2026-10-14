/* 행복한 급식 · 데이터 (음식, 친구, 메뉴, 수준) */
(function (g) {
  'use strict';
  var HM = g.HM;
  /* cat: rice 밥 · soup 국 · side 반찬 · fruit 과일 · drink 음료 */
  HM.CATS = { rice: { name: '밥', emo: '🍚' }, soup: { name: '국', emo: '🍲' }, side: { name: '반찬', emo: '🥢' }, fruit: { name: '과일', emo: '🍎' }, drink: { name: '우유', emo: '🥛' } };
  /* [id, 이름, 종류] — 그림은 img/food/<id>.webp 에서 자동으로 찾아요 */
  var RAW = [
    ['mandu','만두','side'], ['milk','우유','drink'], ['dakgangjeong','닭강정','side'], ['corn-salad','콘샐러드','side'],
    ['fruit-mix','사과포도','fruit'], ['jangjorim','장조림','side'], ['grilled-fish','생선구이','side'], ['corn-cheese','콘치즈','side'],
    ['tonkatsu','돈가스','side'], ['japchae','잡채','side'], ['bulgogi','불고기','side'], ['kalguksu','칼국수','rice'],
    ['tofu-jorim','두부조림','side'], ['gyeran-mari','계란말이','side'], ['tteokbokki','떡볶이','side'], ['baechu-kimchi','배추김치','side'],
    ['tofu-miyeok-soup','두부미역국','soup'], ['rice','쌀밥','rice'], ['strawberry-yogurt','딸기요거트','drink'], ['macaron','마카롱','fruit'],
    ['muscat','샤인머스켓','fruit'], ['multigrain-rice','잡곡밥','rice'], ['green-rice','초록밥','rice'], ['spinach-soup','시금치된장국','soup'],
    ['eomuk-bokkeum','어묵볶음','side'], ['chicken-noodle-soup','닭당면국','soup'], ['chili-pork','고추돼지볶음','side'], ['sandwich','햄치즈샌드위치','side'],
    ['beef-radish-soup','소고기무국','soup'], ['duruchigi','두루치기','side'], ['tteokguk','떡국','soup'], ['gamja-chae','감자채볶음','side'],
    ['mackerel','고등어구이','side'], ['banana','바나나','fruit'], ['miyeok-soup','미역국','soup'], ['yeongeun-jorim','연근조림','side'],
    ['broccoli','브로콜리무침','side'], ['tangerine','귤','fruit'], ['orange','오렌지','fruit'], ['danmuji','단무지','side'],
    ['sundubu','순두부찌개','soup'], ['budae','부대찌개','soup'], ['galbijjim','갈비찜','side'], ['kkakdugi','깍두기','side'],
    ['oi-muchim','오이무침','side'], ['jeyuk','제육볶음','side'], ['myeolchi','멸치볶음','side'], ['potato-salad','감자샐러드','side'],
    ['yukgaejang','육개장','soup'], ['yeolmu','열무김치','side'], ['kimchi-jjigae','김치찌개','soup'], ['curry','카레라이스','rice'],
    ['inari','유부초밥','rice'], ['mu-saengchae','무생채','side'], ['doenjang-jjigae','된장찌개','soup'], ['shrimp-fry','새우튀김','side'],
    ['fish-fillet','생선살구이','side'], ['tomato','방울토마토','fruit'], ['sausage-bokkeum','소시지야채볶음','side'], ['veg-tofu-soup','채소두부국','soup'],
    ['meatball','미트볼','side'], ['gyeran-jjim','계란찜','side'], ['coleslaw','코울슬로','side'], ['brown-rice','현미밥','rice'],
    ['barley-rice','보리밥','rice'], ['gimmari','김말이튀김','side'], ['eomuk-guk','어묵국','soup'], ['kodari','코다리조림','side'],
    ['ojingeo','오징어볶음','side'], ['chicken-leg','닭다리구이','side'], ['egg-soup','계란국','soup'], ['jinmichae','진미채볶음','side'],
    ['pumpkin-salad','단호박샐러드','side'], ['chungguk','청국장','soup'], ['peach','복숭아','fruit'], ['buchujeon','부추전','side'],
    ['kongjaban','콩자반','side'], ['hobak','애호박볶음','side'], ['crab-salad','크래미샐러드','side'], ['sundae','순대볶음','side'],
    ['choco-milk','초코우유','drink'], ['pasta-salad','파스타샐러드','side'], ['shrimp-broccoli','새우브로콜리','side'], ['maneuljong','마늘종볶음','side'],
    ['ganpung','깐풍닭','side'], ['melon','멜론','fruit'], ['chonggak','총각김치','side'], ['gaji','가지볶음','side'],
    ['black-rice','흑미밥','rice'], ['pound-cake','파운드케이크','fruit'], ['gamja-jorim','감자조림','side'], ['gimjaban','김자반','side'],
    ['oisobagi','오이소박이','side'], ['tteokgalbi','떡갈비','side'], ['gosari','고사리나물','side'], ['kkaennip','깻잎김치','side'],
    ['chamoe','참외','fruit'], ['lotus-chips','연근튀김','side'], ['sotteok','소떡소떡','side'], ['cheese','치즈','side'],
    ['pa-kimchi','파김치','side'], ['croquette','크로켓','side'], ['saesongi','새송이볶음','side'], ['blueberry-yogurt','블루베리요거트','fruit'],
    ['gondre-rice','나물밥','rice'], ['pear','배','fruit'], ['miyeok-julgi','미역줄기볶음','side'], ['sigeumchi','시금치나물','side'],
    ['siraegi-guk','시래기국','soup'], ['hamburg','햄버그스테이크','side'], ['cheese-stick','치즈스틱','side'], ['hayashi','하이라이스','rice'],
    ['kongnamul','콩나물무침','side'], ['galchi','갈치구이','side'], ['donut','도넛','fruit'], ['omurice','오므라이스','rice'],
    ['nakji','낙지볶음','side'], ['jjajang','짜장면','rice'], ['tangsuyuk','탕수육','side'], ['sujebi','수제비','soup'],
    ['fish-cutlet','생선까스','side'], ['tomato-soup','토마토수프','soup'], ['goguma-julgi','고구마줄기볶음','side'], ['dakdoritang','닭도리탕','side'],
    ['naengmyeon','물냉면','rice'], ['cream-soup','크림수프','soup'], ['hotdog','핫도그','side']
  ];
  var EMO = { rice: '🍚', soup: '🍲', side: '🥢', fruit: '🍎', drink: '🥛' };
  var TAGS = {
    egg: ['gyeran-mari', 'gyeran-jjim', 'egg-soup', 'omurice'],
    milk: ['milk', 'choco-milk', 'strawberry-yogurt', 'blueberry-yogurt', 'cheese', 'cheese-stick', 'cream-soup'],
    fish: ['mackerel', 'grilled-fish', 'galchi', 'fish-fillet', 'fish-cutlet', 'kodari', 'myeolchi', 'jinmichae', 'shrimp-fry', 'shrimp-broccoli', 'nakji', 'ojingeo', 'eomuk-bokkeum', 'eomuk-guk'],
    spicy: ['tteokbokki', 'kimchi-jjigae', 'yukgaejang', 'sundubu', 'budae', 'jeyuk', 'chili-pork', 'duruchigi', 'baechu-kimchi', 'kkakdugi', 'nakji', 'ojingeo', 'dakdoritang', 'oisobagi', 'pa-kimchi', 'chonggak', 'kkaennip', 'yeolmu', 'mu-saengchae', 'kodari']
  };
  HM.FOODS = RAW.map(function (r) {
    var f = { id: r[0], name: r[1], cat: r[2], emo: EMO[r[2]], tags: [] };
    for (var t in TAGS) if (TAGS[t].indexOf(f.id) >= 0) f.tags.push(t);
    return f;
  });
  var BY = {}; HM.FOODS.forEach(function (f) { BY[f.id] = f; });
  HM.food = function (id) { return BY[id]; };
  /* 요일별 메뉴 (월~금) */
  HM.MENUS = [
    { day: '월', rice: 'rice', soup: 'miyeok-soup', sides: ['bulgogi', 'gyeran-mari', 'baechu-kimchi'], fruit: 'banana', drink: 'milk' },
    { day: '화', rice: 'multigrain-rice', soup: 'doenjang-jjigae', sides: ['mackerel', 'sigeumchi', 'kkakdugi'], fruit: 'tangerine', drink: 'strawberry-yogurt' },
    { day: '수', rice: 'rice', soup: 'egg-soup', sides: ['tonkatsu', 'kongnamul', 'gamja-jorim'], fruit: 'orange', drink: 'milk' },
    { day: '목', rice: 'black-rice', soup: 'sundubu', sides: ['jeyuk', 'oi-muchim', 'tofu-jorim'], fruit: 'melon', drink: 'choco-milk' },
    { day: '금', rice: 'barley-rice', soup: 'tteokguk', sides: ['tteokgalbi', 'japchae', 'baechu-kimchi'], fruit: 'muscat', drink: 'milk' }
  ];
  HM.todayMenu = function () {
    var d = new Date().getDay(), i = d >= 1 && d <= 5 ? d - 1 : (HM.jget('menuIdx', 0) % 5);
    return HM.MENUS[i];
  };
  /* 친구가 못 먹는 음식 (태그 egg·milk·fish·spicy) 중 오늘 메뉴에 있는 것 */
  HM.avoidIds = function (friend, menu) {
    var tags = friend.avoid || []; return HM.menuFoods(menu).filter(function (f) { return f.tags.some(function (t) { return tags.indexOf(t) >= 0; }); }).map(function (f) { return f.id; });
  };
  HM.TAGNAMES = { egg: '달걀', milk: '우유', fish: '생선', spicy: '매운 음식' };
  HM.menuFoods = function (m) { m = m || HM.todayMenu(); return [m.rice, m.soup].concat(m.sides, [m.fruit, m.drink]).map(HM.food); };

  /* 우리 반 친구 (기본은 캐릭터 이름 — 선생님이 실제 이름으로 바꿀 수 있어요) */
  HM.AVATARS = ['🐰', '🐻', '🦊', '🐱', '🐶', '🐧', '🐼', '🐯', '🦁', '🐸', '🐥', '🦄'];
  var DEFAULT_FRIENDS = [
    { id: 'f0', name: '토끼', emo: '🐰', avoid: [] }, { id: 'f1', name: '곰돌이', emo: '🐻', avoid: ['egg'] },
    { id: 'f2', name: '여우', emo: '🦊', avoid: [] }, { id: 'f3', name: '고양이', emo: '🐱', avoid: ['milk'] },
    { id: 'f4', name: '강아지', emo: '🐶', avoid: ['spicy'] }, { id: 'f5', name: '펭귄', emo: '🐧', avoid: ['fish'] }
  ];
  HM.friends = function () {
    var saved = HM.jget('friends', null);
    if (!saved) return DEFAULT_FRIENDS.map(function (f) { return Object.assign({}, f); });
    return DEFAULT_FRIENDS.map(function (d, i) { return Object.assign({}, d, saved[i] || {}); });
  };
  HM.saveFriends = function (list) { HM.jset('friends', list); };
  /* 자리: 2줄 × 3칸 */
  HM.SEAT_NAMES = ['앞줄 왼쪽', '앞줄 가운데', '앞줄 오른쪽', '뒷줄 왼쪽', '뒷줄 가운데', '뒷줄 오른쪽'];

  HM.LEVELS = [
    { n: 1, name: '느껴 보기', desc: '음식 하나! 반짝이는 것을 눌러요.', friends: 2 },
    { n: 2, name: '골라 보기', desc: '음식 둘! 알맞은 것을 골라요.', friends: 3 },
    { n: 3, name: '직접 해 보기', desc: '개수도 맞춰요. 자리 이름표를 보고 배달해요.', friends: 3 },
    { n: 4, name: '혼자 해 보기', desc: '못 먹는 음식을 피하고, 자리 위치를 찾아 배달해요.', friends: 4 },
    { n: 5, name: '생활에 써 보기', desc: '여러 친구의 주문을 차례로 척척!', friends: 5 }
  ];
})(window);
