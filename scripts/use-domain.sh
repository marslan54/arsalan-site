#!/bin/sh
# Point the site at a custom domain.
#
#   sh scripts/use-domain.sh agentfoundry.studio
#
# Run it only once the domain is registered and its DNS records are in place
# (see the custom domain section of README.md). Until GitHub Pages serves the
# new host, canonical tags and the sitemap would otherwise point search engines
# at an address that does not answer.
#
# It rewrites every absolute URL, fixes the root-relative paths on the 404 page,
# writes the CNAME file GitHub Pages needs, and bumps the asset versions so no
# one is served a stale stylesheet. Links to the demo pages are left alone:
# those really do live on github.io.
set -eu

DOMAIN=${1:-}
case "$DOMAIN" in
  "")        echo "usage: sh scripts/use-domain.sh <domain>   e.g. agentfoundry.studio" >&2; exit 2 ;;
  *.*)       ;;
  *)         echo "that does not look like a domain: $DOMAIN" >&2; exit 2 ;;
esac
case "$DOMAIN" in http*|*/*) echo "give the bare domain, with no scheme or path" >&2; exit 2 ;; esac

cd "$(dirname "$0")/.."
OLD=marslan54.github.io/arsalan-site

before=$(grep -ro "$OLD" --include='*.html' --include='*.xml' --include='*.txt' . | grep -vc '^./mocks/' || true)
echo "rewriting $before absolute URLs -> $DOMAIN"

files=$(grep -rl "$OLD" --include='*.html' --include='*.xml' --include='*.txt' . | grep -v '^./mocks/')
for f in $files; do
  sed -i '' "s#$OLD#$DOMAIN#g" "$f"
done

# the 404 page uses root-relative paths; on an apex domain the project-page
# prefix goes away
sed -i '' 's#"/arsalan-site/#"/#g' 404.html
echo "404 page: root-relative paths repointed"

printf '%s\n' "$DOMAIN" > CNAME
echo "CNAME written"

# a domain move changes every canonical, so make sure nobody is holding a
# cached stylesheet from the old host
css=$(grep -ho 'site\.css?v=[0-9]*' index.html | head -1 | sed 's/[^0-9]*//')
js=$(grep -ho 'site\.js?v=[0-9]*'  index.html | head -1 | sed 's/[^0-9]*//')
for f in *.html; do
  sed -i '' "s/site\.css?v=$css/site.css?v=$((css + 1))/g; s/site\.js?v=$js/site.js?v=$((js + 1))/g" "$f"
done
echo "assets bumped: css v$((css + 1)), js v$((js + 1))"

left=$(grep -ro "$OLD" --include='*.html' --include='*.xml' --include='*.txt' . | grep -vc '^./mocks/' || true)
demos=$(grep -rho 'marslan54\.github\.io/[a-z-]*-demo' --include='*.html' . | grep -vc '^$' || true)
echo
echo "old URLs left (want 0): $left"
echo "demo links still on github.io (want 9): $demos"
echo
echo "Next: commit, push, then in the repo's Settings > Pages set the custom"
echo "domain to $DOMAIN and tick Enforce HTTPS once the certificate is issued."
echo "Then add https://$DOMAIN to ALLOWED_ORIGINS on the site-assistant Render"
echo "service, or the chat widget will be blocked on the new host."
