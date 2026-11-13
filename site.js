// Fill these in to switch on the direct contact options; empty ones fall back to the AI assistant.
const CONFIG = {
  calUrl: "",        // e.g. "https://cal.com/<you>/discovery"
  email: "",         // e.g. "hello@yourdomain.com"
  whatsapp: "",      // e.g. "+923001234567"
};

const root = document.documentElement;
root.classList.add("js");
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("loaded")));

// Contact options: real links when configured, the assistant otherwise.
for (const el of document.querySelectorAll("[data-book]")) {
  if (CONFIG.calUrl) {
    el.href = CONFIG.calUrl;
  } else {
    el.setAttribute("data-site-assistant-ask", "I'd like to book a discovery call with Arsalan.");
  }
}
const big = document.getElementById("contact-email");
if (CONFIG.email && big) {
  big.textContent = CONFIG.email;
  big.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Automation project")}`;
  big.removeAttribute("data-site-assistant-ask");
}
const wa = document.getElementById("contact-whatsapp");
if (CONFIG.whatsapp && wa) {
  wa.href = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, "")}`;
  wa.hidden = false;
}

// Entrances: each section's parts rise in once as it enters.
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -12% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// The header takes the ink of the chapter under it.
const bar = document.querySelector(".bar");
const fields = [...document.querySelectorAll("[data-field]")];
function inkUnderBar() {
  const y = bar.offsetHeight / 2;
  for (const f of fields) {
    const r = f.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) {
      let dark = f.dataset.field === "dark";
      if (f.dataset.field === "split") dark = y > r.top + r.height / 2;
      bar.dataset.ink = dark ? "light" : "dark";
      return;
    }
  }
}
addEventListener("scroll", inkUnderBar, { passive: true });
addEventListener("resize", inkUnderBar);
addEventListener("load", inkUnderBar);
setTimeout(inkUnderBar, 300);
inkUnderBar();

// Proof: the employers light up in turn.
const lits = [...document.querySelectorAll(".lit")];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (lits.length) {
  let i = 0;
  lits[0].classList.add("on");
  if (!still) setInterval(() => { lits[i].classList.remove("on"); i = (i + 1) % lits.length; lits[i].classList.add("on"); }, 2000);
}

// The headline clip pauses for visitors who ask for less motion.
if (still) document.querySelectorAll(".slot video").forEach((v) => { v.pause(); v.removeAttribute("autoplay"); });
