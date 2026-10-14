/* 브라우저 없이 데이터·주문 규칙을 점검해요: node scripts/smoke-test.mjs */
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const win = { matchMedia: () => ({ matches: false }) };
const ctx = vm.createContext({ window: win, location: { search: '' }, document: { addEventListener() { }, body: { classList: { toggle() { } } }, querySelector() { return null; }, querySelectorAll() { return []; } }, localStorage: { getItem() { return null; }, setItem() { } }, matchMedia: win.matchMedia, setTimeout, console });
for (const f of ['core', 'data', 'orders', 'learn']) vm.runInContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), ctx, { filename: f });
const HM = ctx.window.HM; HM.art = { food: f => '', html: () => '' }; let bad = 0, n = 0;
const t = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const ids = new Set(); HM.FOODS.forEach(f => { t(!ids.has(f.id), '중복 id ' + f.id); ids.add(f.id); t(fs.existsSync(path.join(root, 'img/food', f.id + '.webp')), '그림 없음 ' + f.id); t(HM.CATS[f.cat], '종류 ' + f.id); });
const names = new Set(); HM.FOODS.forEach(f => { t(!names.has(f.name), '중복 이름 ' + f.name); names.add(f.name); });
const imgs = fs.readdirSync(path.join(root, 'img/food')).filter(x => x.endsWith('.webp')); t(imgs.length === HM.FOODS.length, '그림 수 ' + imgs.length + ' ≠ ' + HM.FOODS.length);
HM.MENUS.forEach(m => { t(HM.food(m.rice).cat === 'rice', m.day + ' 밥'); t(HM.food(m.soup).cat === 'soup', m.day + ' 국'); m.sides.forEach(s => t(HM.food(s).cat === 'side', m.day + ' 반찬 ' + s)); t(HM.food(m.fruit).cat === 'fruit', m.day + ' 과일'); t(HM.food(m.drink).cat === 'drink', m.day + ' 음료'); });
t(fs.existsSync(path.join(root, 'img/ui/tray.webp')), '식판 그림');
const fr = HM.friends();
for (let lv = 1; lv <= 5; lv++) for (let k = 0; k < 300; k++) {
  const o = HM.makeOrder(lv, fr[k % 6], k % 6);
  t(o.items.length >= 1 && o.items.length <= 4, 'lv' + lv + ' 가짓수'); t(o.items.every(i => o.avoid.indexOf(i.id) < 0), 'lv' + lv + ' 못 먹는 음식 포함');
  t(HM.orderText(fr[k % 6], o.items).length > 5, '주문 문장');
}
t(HM.josa('곰돌이', '은', '는') === '곰돌이는' && HM.josa('펭귄', '은', '는') === '펭귄은', '조사');
/* 급식 공부 3종 */
Object.keys(HM.DISHES).forEach(d => { t(HM.FOODS.some(f => f.id === d), '재료 요리 없음 ' + d); t(HM.DISHES[d].length >= 3 && new Set(HM.DISHES[d]).size === HM.DISHES[d].length, '재료 수 ' + d); HM.DISHES[d].forEach(k => t(HM.ING[k], '재료 이름 ' + k)); });
for (const g of ['letters', 'shop', 'mart']) for (let lv = 1; lv <= 5; lv++) for (let k = 0; k < 60; k++) {
  const qs = HM.learn[g].make(lv); t(qs.length === 5, g + lv + ' 문제 수');
  qs.forEach(q => { t(q.key && q.prompt, g + lv + ' 문제 내용');
    if (q.type === 'choice') { t(q.opts.filter(o => o.ok).length === 1 && new Set(q.opts.map(o => o.text)).size === q.opts.length, g + lv + ' 보기 ' + q.prompt.slice(0, 30)); }
    if (q.type === 'multi') { t(q.opts.filter(o => o.ok).length === q.need && q.opts.length >= q.need + 2, g + lv + ' 재료 보기'); }
    if (q.type === 'build') { t(q.answer.every(a => q.tiles.includes(a)), g + lv + ' 글자 조각'); }
    if (q.type === 'pay') { t(q.price % 100 === 0 && q.price > 0, g + lv + ' 값'); } });
}
console.log(bad ? bad + ' FAIL / ' + n : 'PASS ' + n + '개 점검 통과');
process.exit(bad ? 1 : 0);
