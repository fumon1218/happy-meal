/* 급식 공부 3종 자동 점검: node scripts/learn-bot.js [포트] */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/home/claude/.npm-global/lib/node_modules/playwright'); }
const PORT = process.argv[2] || 8741;
(async () => {
  const b = await pw.chromium.launch({ executablePath: process.env.PW_EXE || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  let fail = 0;
  for (const game of ['letters', 'shop', 'mart']) for (const lv of [1, 2, 3, 4, 5]) {
    const p = await b.newPage({ viewport: { width: 430, height: 860 } }), errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.route(/^(?!http:\/\/localhost)/, r => r.abort());
    await p.goto(`http://localhost:${PORT}/index.html?dev=fast`); await p.waitForSelector('.home'); await p.waitForTimeout(1500);
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('hm_settings') || '{}'); s.voice = false; s.sound = false; localStorage.setItem('hm_settings', JSON.stringify(s)); HM.applySettings(); const oq = HM.quiz; HM.quiz = function (h, sp) { window.__qs = sp.qs; return oq(h, sp); }; });
    await p.evaluate(([g, l]) => HM.go.runLearn(g, l), [game, lv]);
    const t0 = Date.now(); let ok = false, bad = 0, qn = -1, tried = false;
    while (Date.now() - t0 < 60000) {
      if (await p.$('.qz-result')) { ok = true; break; }
      await p.evaluate((wrongFirst) => {
        const qs = window.__qs, i = document.querySelectorAll('.qz-dots i.done').length, q = qs[i]; if (!q) return;
        const area = document.querySelector('.qz-opts'); if (!area) return;
        if (window.__i !== i) { window.__i = i; window.__tried = false; window.__pay = 0; }
        const btns = [...area.children];
        if (q.type === 'choice' || q.type === 'multi') {
          if (!window.__tried && i === 0) { window.__tried = true; const w = q.opts.findIndex(o => !o.ok); if (w >= 0) { btns[w].click(); return; } }
          const k = q.opts.findIndex((o, n) => o.ok && !btns[n].disabled); if (k >= 0) btns[k].click();
        } else if (q.type === 'build') {
          const slots = document.querySelectorAll('.qz-slot.on').length, want = q.answer[slots]; const bt = btns.find(x => !x.disabled && x.dataset.c === want); if (bt) bt.click();
        } else if (q.type === 'pay') {
          const dd = document.querySelector('.qz-sum-disp b'); if (!dd) return; const shown = +dd.textContent, rem = q.price - shown, v = rem >= 500 ? 500 : 100, bt = btns.find(x => x.dataset.v == v); if (bt) bt.click();
        }
      });
      await p.waitForTimeout(40);
    }
    const stars = ok ? await p.textContent('.qz-result p') : '-';
    console.log((ok && !errs.length ? 'PASS ' : 'FAIL ') + game + ' lv' + lv + ' ' + stars + ' ' + errs.join('|')); if (!ok || errs.length) fail++;
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
