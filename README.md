# Muhammad Arsalan · AI automation

Personal site for my AI automation service. Static HTML, CSS and JS; no build step, no dependencies.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: the problem, three builds, five packages, the care plan, qualifier, FAQ |
| `audit.html` | The two-workflow audit — the paid front door, $400, five working days |
| `voice-agent-cost.html` | Free tool: what an AI phone agent costs to run each month |
| `services.html` | Thirteen services, each opening with the problem it solves |
| `ai-receptionist-home-services.html` | Guide |
| `text-back-missed-calls.html` | Guide |
| `stop-ai-agent-inventing-prices.html` | Guide |
| `privacy.html`, `404.html` | Supporting |

## How it is put together

- One stylesheet (`site.css`) and one script (`site.js`) across every page. Bump the `?v=` on both when you change them, or returning visitors keep the old cached copy.
- Colours and type come from CSS custom properties on `<html data-scheme="monolime">`. The other schemes in `site.css` are kept but unused.
- Contact options (Cal.com link, email, WhatsApp) are set in the `CONFIG` block at the top of `site.js`. Empty ones fall back to the AI assistant.
- The chat widget is served by the site-assistant API; its `ALLOWED_ORIGINS` must include this site's domain.

### Animation

The hero on `services.html`, `audit.html` and the three guides runs a three-beat loop on a shared nine-second clock. Two rules hold it together, both learned the hard way:

1. **Timing lives in keyframe percentages, never `animation-delay`.** During its delay an animation applies no value, so the element falls back to its resting style and two beats show at once.
2. **The resting style is the finished state.** If the animation never runs — throttled, blocked, reduced-motion — the page must still read correctly. Nothing visible may depend on an animation to appear, which is why there is no `fill-mode: backwards` entrance anywhere.

### Numbers

Every figure on the site comes from a real demo or test run, and the cost calculator's component prices are quoted with the date they were read from the vendor's own pricing page. That date appears twice in `voice-agent-cost.html`, in the visible note and in a comment above the figures in the script. Move both together.

## When the custom domain is ready

Canonical links, share previews, structured data, `sitemap.xml`, `robots.txt` and `404.html` use the full address `https://marslan54.github.io/arsalan-site/`. Do one find-and-replace of that address with the new domain (ending in `/`) across the folder, add a `CNAME` file with the domain, and add the domain to the site-assistant's `ALLOWED_ORIGINS` on Render.
