#!/bin/sh
# Is the domain ready for the switchover yet?
#
#   sh scripts/check-dns.sh agentfoundry.studio
#
# Run this after setting the DNS records and before scripts/use-domain.sh.
# Records can take anything from a few minutes to a few hours to show up.
set -eu

D=${1:-}
[ -n "$D" ] || { echo "usage: sh scripts/check-dns.sh <domain>" >&2; exit 2; }

PAGES_V4="185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153"
ok=0; bad=0

echo "== A records on $D =="
got=$(dig +short A "$D" | sort)
if [ -z "$got" ]; then
  echo "   none yet"; bad=$((bad+1))
else
  for ip in $got; do
    if echo "$PAGES_V4" | grep -qw "$ip"; then echo "   $ip  (GitHub Pages)"; ok=$((ok+1))
    else echo "   $ip  <- NOT a GitHub Pages address"; bad=$((bad+1)); fi
  done
  [ "$ok" -eq 4 ] || echo "   note: GitHub wants all four A records, found $ok"
fi

echo "== AAAA records =="
v6=$(dig +short AAAA "$D" | sort)
[ -n "$v6" ] && echo "$v6" | sed 's/^/   /' || echo "   none (optional, but worth adding)"

echo "== www =="
w=$(dig +short CNAME "www.$D")
[ -n "$w" ] && echo "   -> $w" || echo "   no CNAME yet"

echo "== is anything serving it? =="
code=$(curl -s -o /dev/null -L --max-time 15 -w '%{http_code}' "http://$D" 2>/dev/null) || code=000
echo "   http  $code"
scode=$(curl -s -o /dev/null -L --max-time 15 -w '%{http_code}' "https://$D" 2>/dev/null) || scode=000
echo "   https $scode   (https only works once GitHub has issued the certificate)"

echo
if [ "$ok" -eq 4 ] && [ "$bad" -eq 0 ]; then
  echo "DNS looks right. Next: sh scripts/use-domain.sh $D"
else
  echo "Not ready yet. Re-run in a while; DNS can take a few hours to spread."
fi
