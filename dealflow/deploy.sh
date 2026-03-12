#!/bin/bash
# ═══════════════════════════════════════════════
# HCI DealFlow — Deploy to Hetzner
# Server: root@46.225.61.78
# Domain: dealflow.hes-consultancy-international.com
# ═══════════════════════════════════════════════
set -euo pipefail

SERVER="root@46.225.61.78"
REMOTE_DIR="/var/www/dealflow"
CADDY_CONF="/etc/caddy/Caddyfile"

echo "══ HCI DealFlow Deploy ══"

# 1. Build
echo "→ Building..."
cd "$(dirname "$0")"
npm ci
npm run build

# 2. Deploy dist
echo "→ Deploying to $SERVER:$REMOTE_DIR..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR"
rsync -avz --delete dist/ "$SERVER:$REMOTE_DIR/"

# 3. Caddy config (only if not already present)
echo "→ Checking Caddy config..."
if ssh "$SERVER" "grep -q 'dealflow.hes-consultancy-international.com' $CADDY_CONF 2>/dev/null"; then
  echo "  Caddy config already present."
else
  echo "  Adding Caddy config..."
  ssh "$SERVER" "cat >> $CADDY_CONF" < server/dealflow.caddyfile
  ssh "$SERVER" "caddy reload --config $CADDY_CONF"
  echo "  Caddy reloaded with new config."
fi

# 4. Smoke test
echo "→ Smoke test..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://dealflow.hes-consultancy-international.com/login" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Deploy succeeded — HTTP $HTTP_CODE"
else
  echo "⚠ HTTP $HTTP_CODE — check server logs"
fi

echo "══ Done ══"
