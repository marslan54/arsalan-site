# Mock sources for the interface screenshots

Every `assets/*.jpg` on this site that shows an interface is a screenshot of one of these
files. They are kept here so the images can be re-made. They are not pages of the site and
nothing links to them; `robots.txt` keeps them out of search results.

They are here because on 21 November 2026 ten of the screenshots were deleted along with a
scratch folder, and `_lp.css` with them, and the only surviving copies were inside a Claude
artifact that needed a browser sign-in to reach. The three landing-page shots had to be
re-created rather than recovered, and they do not match the originals. Do not let these
files live only outside the repo again.

## Which file makes which image

| Image | Source | Notes |
|---|---|---|
| `call-live.jpg` | `_call-a.html` | |
| `call-booked.jpg` | `_call-b.html` | |
| `ph-sms.jpg` | `_ph-sms.html` | |
| `seq-run.jpg` | `_seq-before.html` | **Not `_seq.html`.** See the warning below |
| `seq-stop.jpg` | `_seq.html` | **Not `_seq-before.html`** |
| `lp-dental.jpg` | `_lp-dental.html` | needs `_lp.css` |
| `lp-gym.jpg` | `_lp-gym.html` | needs `_lp.css` |
| `lp-roof.jpg` | `_lp-roof.html` | needs `_lp.css` |
| `new-site.jpg` | `_new-site.html` | |
| `old-site.jpg` | `_old-site.html` | |
| `chat-widget.jpg` | `_chat.html` | |
| `ci-pipeline.jpg` | `_ci.html` | |
| `device-matrix.jpg` | `_devices.html` | |
| `eval-run.jpg` | `_evals.html` | |
| `integrations.jpg` | `_integrations.html` | |
| `load-test.jpg` | `_load.html` | |
| `mcp-server.jpg` | `_mcp.html` | |
| `triage.jpg` | `_triage.html` | |
| `workflow.jpg` | `_n8n.html` | |
| `og-cover.jpg` | `_og.html` | 1200×630, not 792 wide |

`_body.html`, `_ph-call.html` and `_ph-booked.html` are alternates that no image currently
uses. `_mock.css` is the shared console skin; `_lp.css` is the shared landing-page skin.

### The sequence files are named the wrong way round

`_seq.html` is the **stopped** state: a reply has landed and every remaining step is
cancelled. `_seq-before.html` is the **running** state, with steps still queued. The names
suggest the opposite. Check the contents, not the filename.

## Re-rendering one

Serve this folder and screenshot at a viewport **792px wide** — every existing image is
792px wide, and the page CSS displays them with `object-fit: cover` from the top, so the
height only needs to be enough to show the whole mock.

```bash
python3 -m http.server 8057
```

Set the viewport height from the page itself (`document.body.scrollHeight`), capture, then
normalise the width, since a capture usually comes back a few pixels wider than the
viewport:

```bash
sips --resampleWidth 792 -s format jpeg -s formatOptions 82 capture.jpg --out ../assets/NAME.jpg
```

The bodies set `overflow: hidden`, so anything wider than the viewport is clipped rather
than scrolled. That is deliberate for `_old-site.html`, where the clipping is part of
looking like a fixed-width site from 2003.
