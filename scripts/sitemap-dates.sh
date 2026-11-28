#!/bin/sh
# Set every <lastmod> in sitemap.xml to the day that page last actually changed,
# taken from git rather than typed by hand. Run it before pushing a content
# change. A lastmod that claims a date the page did not change on is worse than
# none: crawlers learn to distrust the whole file.
set -eu
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re, subprocess, pathlib
p = pathlib.Path("sitemap.xml"); s = p.read_text(); n = 0
def day(path):
    r = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path],
                       capture_output=True, text=True)
    return r.stdout.strip()
def fix(m):
    global n
    page = m.group(2) or "index.html"
    d = day(page)
    if not d or d == m.group(3):
        return m.group(0)
    n += 1
    return f"{m.group(1)}{m.group(2)}</loc>\n    <lastmod>{d}</lastmod>"
s = re.sub(r'(<loc>https://agentfoundry\.studio/)([^<]*)</loc>\s*<lastmod>([^<]*)</lastmod>', fix, s)
p.write_text(s)
print(f"updated {n} lastmod dates")
PY
