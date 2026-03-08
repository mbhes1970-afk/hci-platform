#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Deploy CMO-FMO app + Claude proxy naar Hetzner
# Gebruik: ./deploy-cmofmo.sh
#
# Vereisten:
#   - DNS A-record: cmofmo.hes-consultancy-international.com → 46.225.61.78
#   - SSH toegang: root@46.225.61.78
#   - Node.js op server (voor claude-proxy)
# ════════════════════════════════════════════════════════════════
set -e

SERVER=root@46.225.61.78
REMOTE_APP=/var/www/cmofmo
REMOTE_PROXY=/opt/claude-proxy

echo "═══════════════════════════════════════════════"
echo "  HCI CMO-FMO Deploy → Hetzner"
echo "═══════════════════════════════════════════════"

# ── 1. Build app ──────────────────────────────────────────────
echo ""
echo "→ [1/5] Building CMO-FMO (VITE_BRAND=hci)..."
cd cmofmo
npm install --no-audit --no-fund
VITE_BRAND=hci npm run build
cd ..
echo "  ✓ Build klaar — cmofmo/dist/"

# ── 2. Deploy statische app ───────────────────────────────────
echo ""
echo "→ [2/5] Deploying app naar $REMOTE_APP..."
ssh $SERVER "mkdir -p $REMOTE_APP"
rsync -avz --delete cmofmo/dist/ $SERVER:$REMOTE_APP/
ssh $SERVER "chown -R www-data:www-data $REMOTE_APP && chmod -R 755 $REMOTE_APP"
echo "  ✓ App deployed"

# ── 3. Deploy Claude proxy ────────────────────────────────────
echo ""
echo "→ [3/5] Deploying Claude proxy naar $REMOTE_PROXY..."
ssh $SERVER "mkdir -p $REMOTE_PROXY"
scp server/claude-proxy.js $SERVER:$REMOTE_PROXY/claude-proxy.js
ssh $SERVER "chown -R www-data:www-data $REMOTE_PROXY"

# Install/update systemd service
scp server/claude-proxy.service $SERVER:/etc/systemd/system/claude-proxy.service
ssh $SERVER "systemctl daemon-reload && systemctl enable claude-proxy"

# Check if API key is set, warn if not
HAS_KEY=$(ssh $SERVER "systemctl show claude-proxy -p Environment 2>/dev/null | grep -c ANTHROPIC_API_KEY || true")
if [ "$HAS_KEY" = "0" ]; then
  echo ""
  echo "  ⚠️  ANTHROPIC_API_KEY niet ingesteld!"
  echo "  Run op de server:"
  echo "    systemctl edit claude-proxy"
  echo "  Voeg toe:"
  echo "    [Service]"
  echo "    Environment=ANTHROPIC_API_KEY=sk-ant-jouw-key"
  echo "  Dan:"
  echo "    systemctl restart claude-proxy"
  echo ""
else
  ssh $SERVER "systemctl restart claude-proxy"
  echo "  ✓ Claude proxy herstart"
fi
echo "  ✓ Proxy deployed"

# ── 4. Caddy config ───────────────────────────────────────────
echo ""
echo "→ [4/5] Caddy configuratie bijwerken..."

# Check of het cmofmo blok al in Caddyfile staat
CADDY_HAS_CMOFMO=$(ssh $SERVER "grep -c 'cmofmo.hes-consultancy-international.com' /etc/caddy/Caddyfile 2>/dev/null || echo 0")
if [ "$CADDY_HAS_CMOFMO" = "0" ]; then
  echo "  → Toevoegen van cmofmo blok aan Caddyfile..."
  ssh $SERVER "cat >> /etc/caddy/Caddyfile" < server/cmofmo.caddyfile
  echo "  ✓ Caddy blok toegevoegd"
else
  echo "  ✓ Caddy blok bestaat al — skip"
fi

# Validate en reload
ssh $SERVER "caddy validate --config /etc/caddy/Caddyfile && caddy reload --config /etc/caddy/Caddyfile"
echo "  ✓ Caddy herlaad"

# ── 5. Smoke test ─────────────────────────────────────────────
echo ""
echo "→ [5/5] Smoke test..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://cmofmo.hes-consultancy-international.com/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✓ Site bereikbaar (HTTP $HTTP_CODE)"
else
  echo "  ⚠️  Site returned HTTP $HTTP_CODE — check DNS en Caddy logs"
  echo "  → ssh $SERVER 'journalctl -u caddy -n 20'"
fi

PROXY_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://cmofmo.hes-consultancy-international.com/api/claude 2>/dev/null || echo "000")
if [ "$PROXY_CODE" = "200" ]; then
  echo "  ✓ Claude proxy bereikbaar (HTTP $PROXY_CODE)"
else
  echo "  ⚠️  Claude proxy returned HTTP $PROXY_CODE"
  echo "  → ssh $SERVER 'journalctl -u claude-proxy -n 20'"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ Deploy compleet!"
echo "  → https://cmofmo.hes-consultancy-international.com"
echo "═══════════════════════════════════════════════"
