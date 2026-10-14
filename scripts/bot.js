/* 5단계 × 놀이 자동 점검 봇: node scripts/bot.js [포트] [놀이ids,쉼표] [단계ids,쉼표] */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/home/claude/.npm-global/lib/node_modules/playwright'); }
const PORT = process.argv[2] || 8741, GAMES = (process.argv[3] || 'balloon,fishing,birds,gacha').split(','), LVS = (process.argv[4] || '1,2,3,4,5').split(',').map(Number);
const exe = process.env.PW_EXE || '/opt/pw-browsers/chromium';
(async () => {
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  let fail = 0;
  for (const game of GAMES) for (const lv of LVS) {
    const p = await b.newPage({ viewport: { width: 1000, height: 720 } });
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.route(/^(?!http:\/\/localhost)/, r => r.abort());
    await p.goto(`http://localhost:${PORT}/index.html?dev=fast`); await p.waitForSelector('.home');
    await p.evaluate((g) => {
      const s = JSON.parse(localStorage.getItem('hm_settings') || '{}'); s.voice = false; s.sound = false; if (g === 'fishing') s.scan = true; localStorage.setItem('hm_settings', JSON.stringify(s)); HM.applySettings();
      const oc = HM.collect; HM.collect = function (h, o, l, gm) { const r = oc(h, o, l, gm); window.__ctx = r.ctx; return r; };
      const od = HM.deliver; HM.deliver = function (h, o, l, t) { window.__order = o; return od(h, o, l, t); };
    }, game);
    await p.evaluate(([l, g]) => HM.go.start(l, g), [lv, game]);
    const t0 = Date.now(); let ok = false, steps = 0;
    while (Date.now() - t0 < 100000) {
      if (await p.$('.result')) { ok = true; break; }
      await p.evaluate(async (game) => {
        const q = s => document.querySelector(s);
        const intro = q('.intro .hm-main'); if (intro) { intro.click(); return; }
        const dl = q('.hm-class');
        if (dl) { const m = q('.hm-main'); if (m && !m.hidden) { m.click(); return; } const sw = q('.seat'); if (window.__order) { const e = document.querySelector('.seat[data-i="' + window.__order.seat + '"]'); if (e) e.click(); } return; }
        const c = window.__ctx; if (!c || c.stopped()) return;
        const ids = c.needIds(); if (!ids.length) return;
        const ev = el => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        if (game === 'balloon') { for (const id of ids) { const e = document.querySelector('.hm-bal:not(.pop) img[src*="/' + id + '."]'); if (e) { ev(e.closest('.hm-bal')); return; } } }
        else if (game === 'birds') { for (const id of ids) { const e = document.querySelector('.hm-bird .bird-food img[src*="/' + id + '."]'); if (e) { ev(e.closest('.hm-bird')); e.closest('.hm-bird').click(); return; } } }
        else if (game === 'gacha') {
          const card = q('.hm-gcard'), lever = q('.m-lever');
          if (card && !card.hidden) { const m = card.querySelector('img'); const id = m ? m.getAttribute('src').split('/').pop().replace('.webp', '') : ''; (ids.includes(id) ? q('.g-keep') : q('.g-back')).click(); }
          else if (lever) lever.click();
        } else { HM.pressMain(); }
      }, game);
      await p.waitForTimeout(60); steps++;
    }
    const txt = ok ? await p.$eval('.res-stars', e => e.textContent) : 'TIMEOUT';
    console.log(ok && !errs.length ? 'PASS' : 'FAIL', game, 'lv' + lv, txt, steps + ' steps', errs.join('|'));
    if (!ok || errs.length) { fail++; await p.screenshot({ path: `/tmp/hm/fail-${game}-${lv}.png` }); }
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
