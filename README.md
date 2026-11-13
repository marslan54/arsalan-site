# Muhammad Arsalan · AI automation

Personal site for my AI automation service. Static HTML, CSS and JS; no build step. Layout in the style of clarvos.com, with my own content, images and wording.

- Contact options (Cal.com link, email, WhatsApp) are set in the CONFIG block at the top of `site.js`. Empty ones fall back to the AI assistant.
- The chat widget is served by the site-assistant API; its `ALLOWED_ORIGINS` must include this site's domain.
- Images and the demo video come from my own project demos.

## When the custom domain is ready

The canonical links, share previews, structured data, `sitemap.xml`, `robots.txt` and `404.html` use the full address `https://marslan54.github.io/arsalan-site/`. Do one find-and-replace of that address with the new domain (ending in `/`) across the folder, add a `CNAME` file with the domain, and add the domain to the site-assistant's `ALLOWED_ORIGINS` on Render.
