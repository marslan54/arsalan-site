// Fill these in to switch on direct contact; empty ones fall back to the AI assistant.
const CONFIG = {
  calUrl: "",    // e.g. "https://cal.com/<you>/discovery"
  email: "",     // e.g. "hello@yourdomain.com"
  whatsapp: "",  // e.g. "+923001234567"
};

const root = document.documentElement;
root.classList.add("js");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Headline: split each line into letters that rise in one after another (screen readers get the h1's aria-label).
let n = 0;
for (const line of document.querySelectorAll("[data-split] .line")) {
  const text = line.textContent;
  line.textContent = "";
  line.setAttribute("aria-hidden", "true");
  // Letters are grouped by word so a line can only wrap between words.
  text.split(" ").forEach((word, w, words) => {
    const box = document.createElement("span");
    box.className = "word";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "ltr";
      s.textContent = ch;
      s.style.setProperty("--d", `${(0.2 + 0.022 * n++).toFixed(3)}s`);
      box.appendChild(s);
    }
    line.appendChild(box);
    if (w < words.length - 1) { line.appendChild(document.createTextNode(" ")); n++; }
  });
}

// Contact options: real links when configured, the assistant otherwise.
for (const el of document.querySelectorAll("[data-book]")) {
  if (CONFIG.calUrl) el.href = CONFIG.calUrl;
  else el.setAttribute("data-site-assistant-ask", "I'd like to book a discovery call with Arsalan.");
}
const email = document.getElementById("footer-email");
if (CONFIG.email && email) { email.textContent = CONFIG.email; email.href = `mailto:${CONFIG.email}`; email.hidden = false; }
const wa = document.getElementById("footer-whatsapp");
if (CONFIG.whatsapp && wa) { wa.href = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, "")}`; wa.hidden = false; }

// Scroll reveals: each element animates in once as it enters the screen.
const revealables = document.querySelectorAll(".reveal, .from-l, .from-r, .grow, .spin");
if (still || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  revealables.forEach((el) => io.observe(el));
}

// Phone menu.
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
nav?.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
}));

// Demo video: plays in place when the button is pressed.
const media = document.querySelector(".demo-media");
const video = document.getElementById("demo-video");
media?.querySelector(".play")?.addEventListener("click", () => {
  video.controls = true;
  media.classList.add("playing");
  void video.play();
});
