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
  apiUrl:   "https://site-assistant-3a51.onrender.com",   // takes the contact form
  email:    "",   // e.g. "you@yourdomain.com"
  whatsapp: "",   // digits only, e.g. "923001234567"
  upwork:   "https://www.upwork.com/freelancers/~010d986b146a33f9f5"
};

// The phone menu. The links are in the DOM on every width; this only opens and
// closes the panel they fold into below 900px.
(function(){
  const nav = document.querySelector('.nav');
  const btn = nav && nav.querySelector('.navtoggle');
  const menu = document.getElementById('navmenu');
  if (!nav || !btn || !menu) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  // Going somewhere should not leave the panel hanging over the new page, and
  // an in-page link (#packages) does not reload, so close it by hand.
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')){ setOpen(false); btn.focus(); }
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false);
  });

  // Dragging the window past the breakpoint with the panel open would leave the
  // desktop bar in the open state, which changes nothing visually but leaves
  // aria-expanded lying to a screen reader.
  const wide = window.matchMedia('(min-width:901px)');
  const sync = () => { if (wide.matches) setOpen(false); };
  wide.addEventListener ? wide.addEventListener('change', sync) : wide.addListener(sync);
})();

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

/* The two animated preview cards. The CSS runs a loop on its own; this takes
   over once it has loaded so a visitor can press the button in the scene. Both
   cards share one player, because the only differences between them are the
   hold times and what the button does. */
(function(){
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  function player(stage, opts){
    const scenes = [...stage.querySelectorAll(opts.scene)];
    const dots   = [...stage.querySelectorAll(opts.dot)];
    if (scenes.length !== opts.holds.length) return null;

    const liveClass = opts.live;
    stage.classList.add(liveClass);
    let at = 0, timer = null, paused = false;

    function show(i){
      const from = at;
      at = (i + scenes.length) % scenes.length;
      scenes.forEach((s, n) => s.classList.toggle('on', n === at));
      // a scene can still be marked as leaving from a change under half a second
      // ago; pressing the replay button lands exactly there, and .out would win
      // over .on and show an empty pane
      scenes[at].classList.remove('out');
      // mark the one leaving so it lifts away instead of sinking back down
      if (from !== at && scenes[from]){
        const leaving = scenes[from];
        leaving.classList.add('out');
        setTimeout(() => leaving.classList.remove('out'), 420);
      }
      const last = scenes.length - 1;
      dots.forEach((d, n) => {
        d.classList.toggle('on',   n === at && at < last);
        d.classList.toggle('done', n === at && at === last);
      });
    }
    function queue(){
      clearTimeout(timer);
      if (paused || still.matches) return;
      timer = setTimeout(() => { show(at + 1); queue(); }, opts.holds[at]);
    }
    const stop = () => { paused = true; clearTimeout(timer); };
    const go   = () => { paused = false; queue(); };

    // somebody pointing at it or tabbing through is reading it; hold still
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', go);
    stage.addEventListener('focusin', stop);
    stage.addEventListener('focusout', go);

    show(still.matches ? scenes.length - 1 : 0);

    if ('IntersectionObserver' in window){
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? go() : stop()),
        { threshold: 0.25 }).observe(stage);
    } else { go(); }

    return { show, stop, go, stage };
  }

  // Custom AI agents: it asks before it writes, so let the visitor be the one who approves.
  const cag = document.getElementById('cagstage');
  if (cag){
    const p = player(cag, { scene:'.cag', dot:'.cagdots i', holds:[2600,3400,3000], live:'cag-live' });
    const note = document.getElementById('cagnote');
    document.getElementById('cagapprove')?.addEventListener('click', () => {
      if (note){ note.textContent = 'You approved it, so it wrote. That is the whole mechanism.'; note.classList.add('you'); }
      p.show(2); p.stop();
      setTimeout(() => { if (!cag.matches(':hover')) p.go(); }, 2600);
    });
  }

  // Speed-to-lead: the whole claim is the gap between the missed call and the reply,
  // so the button simply plays that gap again from the start.
  const stl = document.getElementById('stlstage');
  if (stl){
    const p = player(stl, { scene:'.stl', dot:'.stldots i', holds:[2800,2800,3400], live:'stl-live' });
    document.getElementById('stlagain')?.addEventListener('click', () => { p.show(0); p.go(); });
  }

  // The contact form. The API is on a free Render instance that sleeps, so the
  // first send after a quiet spell can take the better part of a minute: say so
  // rather than letting it look broken, and never clear what they typed.
  const cform = document.getElementById('cform');
  if (cform && CONFIG.apiUrl){
    const status = document.getElementById('cfstatus');
    const send = document.getElementById('cfsend');
    const label = send ? send.innerHTML : '';
    let busy = false;

    const say = (text, kind) => {
      if (!status) return;
      status.textContent = text;
      status.className = 'cform-status' + (kind ? ' ' + kind : '');
    };

    cform.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;

      const data = Object.fromEntries(new FormData(cform).entries());
      // Checked here only to answer faster than a round trip; the API decides.
      if (!String(data.name || '').trim())    return say('Please add your name.', 'err');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email || '').trim()))
        return say('That email address does not look right.', 'err');
      if (!String(data.message || '').trim()) return say('Please write a line about what is going wrong.', 'err');

      busy = true;
      if (send){ send.disabled = true; send.textContent = 'Sending...'; }
      say('Sending...');
      const slow = setTimeout(() => { if (busy) say('Still sending. The server sleeps when it is idle, so the first message can take up to a minute.'); }, 4000);

      try {
        const res = await fetch(CONFIG.apiUrl.replace(/\/$/, '') + '/v1/contact', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: data.name, email: data.email, company: data.company,
            message: data.message, website: data.website, pageUrl: location.href
          })
        });
        clearTimeout(slow);
        if (res.ok){
          const done = document.createElement('div');
          done.className = 'cform-done';
          done.setAttribute('role', 'status');
          done.innerHTML = '<h3 class="h-sm">Thank you, it reached me.</h3>' +
            '<p>I read these myself and reply within one working day, Monday to Friday. ' +
            'If it is urgent, book a time instead and we can talk sooner.</p>' +
            '<p style="margin-top:16px"><a class="btn btn-line" href="index.html#contact" data-book>Book 20 minutes</a></p>';
          cform.replaceWith(done);
          done.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        const body = await res.json().catch(() => ({}));
        say(body.error || 'That did not send. Please try again, or reach me on Upwork.', 'err');
      } catch (err) {
        clearTimeout(slow);
        say('That did not send, which usually means the connection dropped. Your message is still here, so try again, or reach me on Upwork.', 'err');
      } finally {
        busy = false;
        if (send){ send.disabled = false; send.innerHTML = label; }
      }
    });
  }

  // The three screenshot cards run on the same player and the same 9s clock, so the
  // row advances together instead of four stages drifting against each other. They
  // have no buttons: the CSS baseline already loops, and this only takes over the
  // timing and gives them the same one-direction slide as the cards above.
  [['rxstage', [4400, 4600]],
   ['obstage', [4400, 4600]],
   ['lpstage', [3000, 3000, 3000]]].forEach(([id, holds]) => {
    const el = document.getElementById(id);
    if (el) player(el, { scene:'.sc', dot:'.nodots', holds, live:'sc-live' });
  });
})();
