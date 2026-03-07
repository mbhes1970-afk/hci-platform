#!/bin/bash
# ══════════════════════════════════════════
# hci-sync.sh — Pull latest + reload Caddy
# Deploy to: /opt/hci-sync.sh
# Usage: bash /opt/hci-sync.sh
# ══════════════════════════════════════════
set -euo pipefail

WEBROOT="/var/www/hes-consultancy-nl"
BRANCH="claude/analyze-hci-signalmesh-M2NV2"

echo "=== HCI Platform Sync ==="
echo "$(date '+%Y-%m-%d %H:%M:%S')"

cd "$WEBROOT"
git pull origin "$BRANCH"
echo "Bestanden bijgewerkt"

HTML_COUNT=$(ls *.html 2>/dev/null | wc -l)
echo "$HTML_COUNT HTML bestanden"

if caddy validate --config /etc/caddy/Caddyfile 2>/dev/null; then
    caddy reload --config /etc/caddy/Caddyfile
    echo "Caddy herlaad OK"
fi

echo "=== Sync klaar ==="
