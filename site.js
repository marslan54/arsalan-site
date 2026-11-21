// Call timer, in step with the 7s CSS loop.
const clock = document.querySelector('.call-time');
// We join the call already in progress, so the clock can tick at true 1 second
// per second across the 5s the conversation plays out, and rest on 2:41.
const START = 156, END = 161; // 2:36 -> 2:41
const LOOP = 9000;            // the card's three scenes share one 9s clock
const ACTIVE = 0.41;          // the call itself occupies the first 41% of it
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
let timer;
function runClock(){
  clearInterval(timer);
  if (!clock) return;          // the inner pages share this file and have no call card
  if (still.matches) { clock.textContent = fmt(END); return; }
  const t0 = performance.now();
  timer = setInterval(() => {
    const p = ((performance.now() - t0) % LOOP) / LOOP;
    clock.textContent = fmt(p < ACTIVE ? START + (p / ACTIVE) * (END - START) : END);
  }, 250);
}
runClock();
still.addEventListener('change', runClock);

// Founder qualifier: four quick questions, the way Goodspeed frames its call.
(function(){
  const qual = document.querySelector('.qual');
  if (!qual) return;
  const steps = [...qual.querySelectorAll('.q')];
  const bar   = qual.querySelector('.bar i');
  const count = qual.querySelector('.qual-count');
  const picks = [];
  let at = 0;

  function show(i){
    at = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((s, n) => s.classList.toggle('on', n === at));
    bar.style.width = ((at + 1) / steps.length * 100) + '%';
    count.textContent = (at + 1) + ' of ' + steps.length +
      (at === steps.length - 1 ? ' · last one' : ' · about 30 seconds');
    if (at === steps.length - 1){
      ['r1','r2','r3'].forEach((c, n) => {
        const el = qual.querySelector('.' + c);
        if (el) el.textContent = picks[n] || 'You can tell me on the call';
      });
    }
  }

  qual.addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt){
      picks[at] = opt.dataset.val;
      // hand the answer to the booking links, so the call starts informed
      const key = ['problem','timing','stack'][at];
      if (key && window.__qual) window.__qual[key] = opt.dataset.val;
      if (window.__syncBook) window.__syncBook();
      opt.closest('.opts').querySelectorAll('.opt').forEach(o => o.classList.toggle('sel', o === opt));
      setTimeout(() => show(at + 1), 160);   // let the selection register before moving on
      return;
    }
    if (e.target.closest('.q-back')) show(at - 1);
  });

  show(0);
})();

/* ---------------------------------------------------------------------------
   Where every call-to-action goes.  Fill in any one of these three and the
   whole site starts routing to it; until then the buttons fall back to the
   AI assistant, and then to Upwork, so nothing on the page is a dead end.
   --------------------------------------------------------------------------- */
const CONFIG = {
  calUrl:   "https://cal.com/muhammad-arsalan-vmbla2/scoping-call",
  email:    "",   // e.g. "you@yourdomain.com"
  whatsapp: "",   // digits only, e.g. "923001234567"
  upwork:   "https://www.upwork.com/freelancers/~010d986b146a33f9f5"
};

(function(){
  const qual = { problem:"", timing:"", stack:"" };
  window.__qual = qual;

  function answers(){
    return [["Problem",qual.problem],["Timing",qual.timing],["Stack",qual.stack]]
      .filter(r => r[1]).map(r => r[0] + ": " + r[1]).join("\n");
  }

  function bookUrl(pack){
    const lines = [];
    if (pack) lines.push("Package: " + pack);
    const a = answers(); if (a) lines.push(a);
    const notes = lines.join("\n");

    if (CONFIG.calUrl){
      let u; try { u = new URL(CONFIG.calUrl); } catch { return CONFIG.calUrl; }
      if (notes) u.searchParams.set("notes", notes);
      return u.toString();
    }
    if (CONFIG.email){
      return "mailto:" + CONFIG.email
        + "?subject=" + encodeURIComponent(pack ? pack + " — 20-min call" : "20-min call")
        + (notes ? "&body=" + encodeURIComponent(notes + "\n\n") : "");
    }
    if (CONFIG.whatsapp){
      return "https://wa.me/" + CONFIG.whatsapp + (notes ? "?text=" + encodeURIComponent(notes) : "");
    }
    return CONFIG.upwork;
  }

  const offsite = !CONFIG.calUrl && !CONFIG.email && !CONFIG.whatsapp;

  function syncBook(){
    document.querySelectorAll("[data-book]").forEach(a => {
      a.href = bookUrl(a.dataset.pack || "");
      if (offsite){ a.target = "_blank"; a.rel = "noopener"; }
    });
  }
  window.__syncBook = syncBook;

  // The assistant opens in place once its widget is on the page; before that
  // the same link still reaches a person.
  document.querySelectorAll("[data-assistant]").forEach(a => {
    a.setAttribute("data-site-assistant-open", "");
    a.href = CONFIG.email ? "mailto:" + CONFIG.email : CONFIG.upwork;
    if (!CONFIG.email){ a.target = "_blank"; a.rel = "noopener"; }
    a.addEventListener("click", e => {
      if (typeof window.SiteAssistant?.open === "function"){
        e.preventDefault();
        window.SiteAssistant.open();
      }
    });
  });

  syncBook();
})();

/* How it runs: one pipeline per case, stepped through by the reader. */
document.querySelectorAll('[data-flow]').forEach(flow => {
  const tabs   = [...flow.querySelectorAll('.flow-rail button')];
  const panels = [...flow.querySelectorAll('.flow-p')];
  function go(i){
    tabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    panels.forEach((p, n) => p.classList.toggle('on', n === i));
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(i));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = (i + d + tabs.length) % tabs.length;
      tabs[n].focus(); go(n);
    });
  });
});

/* The measured numbers count up the first time they come into view. */
(function(){
  const nums = [...document.querySelectorAll('.stat b')]
    .map(el => {
      const m = /^([\d,]+)(.*)$/.exec(el.textContent.trim());
      if (!m || +m[1].replace(/,/g,'') < 1) return null;   // "Real", "ACS", "Seconds" and 0 stay as they are
      el.dataset.to = m[1].replace(/,/g,''); el.dataset.rest = m[2];
      return el;
    })
    .filter(Boolean);
  if (!nums.length) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  function run(el){
    const to = +el.dataset.to, rest = el.dataset.rest;
    if (still.matches){ el.textContent = to.toLocaleString('en-US') + rest; return; }
    const t0 = performance.now(), ms = 900;
    el.textContent = '0' + rest;
    (function tick(now){
      const p = Math.min((now - t0) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString('en-US') + rest;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  if (!('IntersectionObserver' in window)){ nums.forEach(run); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);     // once only; a number that re-counts is a distraction
      run(en.target);
    });
  }, { threshold: 0.9 });
  nums.forEach(el => io.observe(el));
})();

/* The custom-agents card. The CSS runs a three-beat loop on its own; this only
   takes over once it has loaded, to let someone actually press Approve. The
   card's whole claim is that it asks a person before it writes, so letting the
   visitor be that person is the most honest demo available. */
(function(){
  const stage = document.getElementById('cagstage');
  if (!stage) return;

  const scenes = [...stage.querySelectorAll('.cag')];
  const dots   = [...stage.querySelectorAll('.cagdots i')];
  const approve = document.getElementById('cagapprove');
  const note    = document.getElementById('cagnote');
  if (scenes.length !== 3) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  stage.classList.add('cag-live');

  const HOLD = [2600, 3200, 3000];   // beat 2 gets longer: it is the one with the decision
  let at = 0, timer = null, paused = false, approved = false;

  function show(i){
    at = (i + 3) % 3;
    scenes.forEach((s, n) => s.classList.toggle('on', n === at));
    dots.forEach((d, n) => {
      d.classList.toggle('on', n === at && at < 2);
      d.classList.toggle('done', n === at && at === 2);
    });
  }
  function queue(){
    clearTimeout(timer);
    if (paused || still.matches) return;
    timer = setTimeout(() => { show(at + 1); queue(); }, HOLD[at]);
  }
  function stop(){ paused = true; clearTimeout(timer); }
  function go(){ paused = false; queue(); }

  // a pointer on the card means someone is reading it; do not move under them
  stage.addEventListener('mouseenter', stop);
  stage.addEventListener('mouseleave', go);
  stage.addEventListener('focusin', stop);
  stage.addEventListener('focusout', go);

  approve?.addEventListener('click', () => {
    approved = true;
    if (note){ note.textContent = 'You approved it, so it wrote. That is the whole mechanism.'; note.classList.add('you'); }
    show(2);
    stop();
    // let it resume a moment later, unless they are still pointing at it
    setTimeout(() => { if (!stage.matches(':hover')) go(); }, 2600);
  });

  show(still.matches ? 2 : 0);

  // only animate while it is on screen
  if ('IntersectionObserver' in window){
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? go() : stop()),
      { threshold: 0.25 }).observe(stage);
  } else {
    go();
  }
})();
