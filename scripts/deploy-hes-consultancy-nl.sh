#!/bin/bash
# ══════════════════════════════════════════════════════════════════
# deploy-hes-consultancy-nl.sh
# Uitvoeren op: root@46.225.61.78
# Doel: hes-consultancy.nl deployen naast bestaand domein
# ══════════════════════════════════════════════════════════════════
set -euo pipefail

WEBROOT="/var/www/hes-consultancy-nl"
REPO="https://github.com/mbhes1970-afk/hci-platform.git"
BRANCH="claude/analyze-hci-signalmesh-M2NV2"
CADDYFILE="/etc/caddy/Caddyfile"

echo "═══ TAAK 1 — Webroot aanmaken ═══"

if [ -d "$WEBROOT" ]; then
    echo "⚠  $WEBROOT bestaat al — pulling..."
    cd "$WEBROOT"
    git pull origin "$BRANCH" 2>/dev/null || echo "Pull failed, using existing files"
else
    echo "Cloning repo..."
    mkdir -p "$WEBROOT"
    if git clone --branch "$BRANCH" "$REPO" "$WEBROOT" 2>/dev/null; then
        echo "✅ Clone succesvol"
    else
        echo "⚠  Git clone mislukt (private repo?)"
        echo "   Probeer met token:"
        echo "   git clone --branch $BRANCH https://TOKEN@github.com/mbhes1970-afk/hci-platform.git $WEBROOT"
        echo ""
        echo "   Of kopieer van bestaande locatie:"
        echo "   cp -r /var/www/hci-platform/* $WEBROOT/ 2>/dev/null"
        echo "   cp -r /opt/hci-platform/* $WEBROOT/ 2>/dev/null"
        exit 1
    fi
fi

HTML_COUNT=$(ls "$WEBROOT"/*.html 2>/dev/null | wc -l)
echo "✅ $HTML_COUNT HTML bestanden gevonden in $WEBROOT"

echo ""
echo "═══ TAAK 2 — Caddy configuratie ═══"

# Backup huidige Caddyfile
cp "$CADDYFILE" "${CADDYFILE}.bak.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup: ${CADDYFILE}.bak.*"

# Check of hes-consultancy.nl al geconfigureerd is
if grep -q "hes-consultancy.nl" "$CADDYFILE" 2>/dev/null; then
    echo "⚠  hes-consultancy.nl staat al in Caddyfile — overslaan"
else
    cat >> "$CADDYFILE" << 'CADDY_EOF'

# ══════════════════════════════════════════════
# hes-consultancy.nl — HCI Platform
# Toegevoegd: maart 2026
# ══════════════════════════════════════════════
hes-consultancy.nl, www.hes-consultancy.nl {
    root * /var/www/hes-consultancy-nl

    # Clean URLs — html extensie weglaten
    try_files {path} {path}.html {path}/index.html

    # Route mapping (gelijk aan netlify.toml redirects)
    rewrite /quickscan        /hci-quickscan.html
    rewrite /cmofmo           /hci-cmofmo.html
    rewrite /cmofmo/*         /hci-cmofmo.html
    rewrite /pmc              /hci-pmc.html
    rewrite /gtm              /hci-gtm.html
    rewrite /outreach         /hci-outreach.html
    rewrite /sales            /hci-sales-execute.html
    rewrite /sales-execute    /hci-sales-execute.html
    rewrite /icp-wizard       /hci-icp-wizard.html
    rewrite /ai-analyse       /hci-ai-analyse.html
    rewrite /account-hub      /hci-account-hub.html
    rewrite /output-engine    /hci-output-engine-v2.html
    rewrite /modules          /hci-modules.html
    rewrite /assessment       /assessment.html

    rewrite /insights         /insights.html
    rewrite /insights/nis2    /insights-nis2.html
    rewrite /insights/dora    /insights-dora.html
    rewrite /insights/cra     /insights-cra.html
    rewrite /insights/aiact   /insights-aiact.html

    rewrite /analysis/nis2    /layer2-nis2.html
    rewrite /analysis/dora    /layer2-dora.html
    rewrite /analysis/cra     /layer2-cra.html
    rewrite /analysis/aiact   /layer2-aiact.html

    rewrite /privacy          /privacy.html
    rewrite /terms            /terms.html
    rewrite /optout           /optout.html

    # Sector output templates (quickscan fetch)
    rewrite /templates/s01.html /hci-output-s01.html
    rewrite /templates/s02.html /hci-output-s02.html
    rewrite /templates/s03.html /hci-output-s03.html
    rewrite /templates/s04.html /hci-output-s04.html
    rewrite /templates/s05.html /hci-output-s05.html
    rewrite /templates/s06.html /hci-output-s06.html

    # API proxy → Netlify functions (of lokale functies)
    reverse_proxy /api/claude localhost:8787
    reverse_proxy /api/slack  localhost:8787

    # Statische bestanden serveren
    file_server

    # SSL: Caddy regelt Let's Encrypt automatisch
    encode gzip

    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        Referrer-Policy strict-origin-when-cross-origin
    }
}
CADDY_EOF
    echo "✅ Caddy blok toegevoegd voor hes-consultancy.nl"
fi

echo ""
echo "═══ TAAK 3 — Caddy valideren + herladen ═══"

echo "Validating..."
if caddy validate --config "$CADDYFILE"; then
    echo "✅ Caddyfile is geldig"
    echo "Reloading Caddy..."
    systemctl reload caddy
    echo "✅ Caddy herlaad succesvol"
    sleep 2
    systemctl status caddy --no-pager | head -10
else
    echo "❌ Caddyfile validatie mislukt!"
    echo "   Herstel: cp ${CADDYFILE}.bak.* $CADDYFILE && systemctl reload caddy"
    exit 1
fi

echo ""
echo "═══ TAAK 4 — DNS + SSL verificatie ═══"

echo "DNS check..."
DNS_IP=$(dig +short hes-consultancy.nl A 2>/dev/null || echo "")
if [ -z "$DNS_IP" ]; then
    echo "⚠  DNS nog niet actief — wacht op propagatie"
    echo "   Check later: dig hes-consultancy.nl +short"
    echo "   Verwacht: 46.225.61.78"
else
    echo "✅ DNS: hes-consultancy.nl → $DNS_IP"
    if [ "$DNS_IP" = "46.225.61.78" ]; then
        echo "✅ Correct IP!"
        echo ""
        echo "SSL/HTTPS test..."
        sleep 5  # geef Caddy even tijd voor Let's Encrypt
        HTTP_STATUS=$(curl -sI -o /dev/null -w "%{http_code}" "https://hes-consultancy.nl" 2>/dev/null || echo "000")
        echo "https://hes-consultancy.nl → HTTP $HTTP_STATUS"

        for route in "/" "/insights" "/quickscan" "/cmofmo" "/privacy"; do
            STATUS=$(curl -sI -o /dev/null -w "%{http_code}" "https://hes-consultancy.nl${route}" 2>/dev/null || echo "000")
            echo "  ${route} → $STATUS"
        done
    else
        echo "⚠  IP klopt niet: verwacht 46.225.61.78, kreeg $DNS_IP"
    fi
fi

echo ""
echo "═══ Bestaande diensten check ═══"

for url in "https://api.hes-consultancy-international.com/api/health" \
           "https://n8n.hes-consultancy-international.com/healthz"; do
    STATUS=$(curl -sI -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    echo "$url → $STATUS"
done

echo ""
echo "═══ KLAAR ═══"
echo "Webroot: $WEBROOT"
echo "Caddyfile backup: ${CADDYFILE}.bak.*"
echo ""
echo "⏭  Volgende stap: n8n workflows deployen"
echo "   cd $WEBROOT/scripts/n8n"
echo "   export N8N_API_KEY=jouw_key"
echo "   python3 deploy_workflows.py"
