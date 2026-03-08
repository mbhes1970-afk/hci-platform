#!/bin/bash
# ════════════════════════════════════════════════════════════════
# HCI CMO-FMO — Remote Deploy Script
# Dit script draait OP de Hetzner server zelf.
#
# Gebruik vanuit PowerShell (Windows):
#   scp deploy-remote.sh root@46.225.61.78:/tmp/
#   ssh root@46.225.61.78 "bash /tmp/deploy-remote.sh"
# ════════════════════════════════════════════════════════════════
set -e

echo "═══════════════════════════════════════════════"
echo "  HCI CMO-FMO — Server Deploy"
echo "═══════════════════════════════════════════════"

# ── 1. Check vereisten ────────────────────────────────────────
echo ""
echo "→ [1/7] Checking vereisten..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js niet gevonden. Installeer: apt install nodejs npm"; exit 1; }
command -v npm >/dev/null 2>&1  || { echo "❌ npm niet gevonden. Installeer: apt install npm"; exit 1; }
command -v caddy >/dev/null 2>&1 || { echo "❌ Caddy niet gevonden."; exit 1; }
command -v git >/dev/null 2>&1  || { echo "❌ git niet gevonden."; exit 1; }
echo "  ✓ node $(node --version), npm $(npm --version), caddy, git"

# ── 2. Clone repo ─────────────────────────────────────────────
echo ""
echo "→ [2/7] Repo clonen..."
WORKDIR=/tmp/hci-cmofmo-deploy-$$
rm -rf "$WORKDIR"
git clone --depth 1 --branch claude/analyze-hci-signalmesh-M2NV2 \
  https://github.com/mbhes1970-afk/hci-platform.git "$WORKDIR"
echo "  ✓ Repo gecloned naar $WORKDIR"

# ── 3. Build app ──────────────────────────────────────────────
echo ""
echo "→ [3/7] Building CMO-FMO app (VITE_BRAND=hci)..."
cd "$WORKDIR/cmofmo"
npm install --no-audit --no-fund
VITE_BRAND=hci npm run build
echo "  ✓ Build geslaagd — dist/ aangemaakt"

# ── 4. Deploy statische app ───────────────────────────────────
echo ""
echo "→ [4/7] Deploying app naar /var/www/cmofmo..."
mkdir -p /var/www/cmofmo
rm -rf /var/www/cmofmo/*
cp -r "$WORKDIR/cmofmo/dist/"* /var/www/cmofmo/
chown -R www-data:www-data /var/www/cmofmo
chmod -R 755 /var/www/cmofmo
echo "  ✓ App gedeployed ($(ls /var/www/cmofmo/assets/ | wc -l) assets)"

# ── 5. Claude proxy installeren ───────────────────────────────
echo ""
echo "→ [5/7] Claude proxy installeren..."
mkdir -p /opt/claude-proxy
cp "$WORKDIR/server/claude-proxy.js" /opt/claude-proxy/claude-proxy.js
chown -R www-data:www-data /opt/claude-proxy

# Systemd service
cp "$WORKDIR/server/claude-proxy.service" /etc/systemd/system/claude-proxy.service

# API key instellen via override
mkdir -p /etc/systemd/system/claude-proxy.service.d
cat > /etc/systemd/system/claude-proxy.service.d/override.conf << 'KEYEOF'
[Service]
Environment=ANTHROPIC_API_KEY=sk-ant-api03-dyIBnsf8nqI28-1vL4Q9B4iArxq6AX7JsNB7rUL6XzQkyVdmXIVyZLH-UXEggntTB0kIfA0F)YB0ZrjR-w-SrlT9gAA
KEYEOF
chmod 600 /etc/systemd/system/claude-proxy.service.d/override.conf

systemctl daemon-reload
systemctl enable claude-proxy
systemctl restart claude-proxy
sleep 2

if systemctl is-active --quiet claude-proxy; then
  echo "  ✓ Claude proxy draait op port 3001"
else
  echo "  ⚠️  Claude proxy niet gestart — check: journalctl -u claude-proxy -n 20"
fi

# ── 6. Caddy config ───────────────────────────────────────────
echo ""
echo "→ [6/7] Caddy configuratie..."
if grep -q 'cmofmo.hes-consultancy-international.com' /etc/caddy/Caddyfile 2>/dev/null; then
  echo "  ✓ Caddy blok bestaat al — overslaan"
else
  echo "" >> /etc/caddy/Caddyfile
  cat "$WORKDIR/server/cmofmo.caddyfile" >> /etc/caddy/Caddyfile
  echo "  ✓ Caddy blok toegevoegd"
fi

caddy validate --config /etc/caddy/Caddyfile 2>/dev/null
if [ $? -eq 0 ]; then
  caddy reload --config /etc/caddy/Caddyfile
  echo "  ✓ Caddy herlaad — SSL wordt automatisch aangevraagd"
else
  echo "  ❌ Caddy validatie mislukt — check: caddy validate --config /etc/caddy/Caddyfile"
fi

# ── 7. Cleanup + smoke test ───────────────────────────────────
echo ""
echo "→ [7/7] Cleanup + smoke test..."
rm -rf "$WORKDIR"

sleep 3
# Test proxy health
PROXY_RESP=$(curl -s http://127.0.0.1:3001/ 2>/dev/null || echo '{"status":"unreachable"}')
echo "  Proxy health: $PROXY_RESP"

# Test site
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80/ --resolve cmofmo.hes-consultancy-international.com:80:127.0.0.1 2>/dev/null || echo "000")
echo "  Local HTTP check: $HTTP_CODE"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ Deploy compleet!"
echo ""
echo "  Site:  https://cmofmo.hes-consultancy-international.com"
echo "  Proxy: https://cmofmo.hes-consultancy-international.com/api/claude"
echo ""
echo "  Test commando's:"
echo "    curl https://cmofmo.hes-consultancy-international.com"
echo "    curl https://cmofmo.hes-consultancy-international.com/api/claude"
echo "    systemctl status claude-proxy"
echo "    journalctl -u claude-proxy -f"
echo "═══════════════════════════════════════════════"
