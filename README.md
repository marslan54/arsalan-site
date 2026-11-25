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

Canonical links, share previews, structured data, `sitemap.xml`, `robots.txt` and
`404.html` all carry the full address, so moving host is a content change, not just a
DNS one. `scripts/use-domain.sh` does the whole rewrite:

```sh
sh scripts/use-domain.sh agentfoundry.studio
```

It repoints all 154 absolute URLs, fixes the root-relative paths on `404.html` (a
project page is served under `/arsalan-site/`, an apex domain is not), writes `CNAME`,
and bumps the asset versions. Links to the demo pages are deliberately left on
`github.io`, because that is where they live.

**Do the DNS first.** Until the new host actually answers, the rewrite would point
search engines at an address that does not resolve. At the registrar, for an apex
domain, create four A records and four AAAA records on `@`, all to GitHub Pages
(these are the ranges `api.github.com/meta` lists under `pages`):

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
| CNAME | www | marslan54.github.io. |

Then, in order:

1. `sh scripts/use-domain.sh <domain>`, commit and push.
2. Repository **Settings → Pages → Custom domain**: enter the domain and save. Leave
   **Enforce HTTPS** until the certificate is issued, which can take up to an hour.
3. Add `https://<domain>` to `ALLOWED_ORIGINS` on the site-assistant service on
   Render, or the chat widget is blocked on the new host and fails silently.
4. In Google Search Console, add the domain as a new property and resubmit
   `sitemap.xml`; the github.io property keeps its own history.
