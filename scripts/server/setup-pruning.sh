#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HCI Platform — n8n Execution Pruning Setup
# ═══════════════════════════════════════════════════════════
# Gebruik: ssh root@46.225.61.78 < setup-pruning.sh
# Of: scp setup-pruning.sh root@46.225.61.78: && ssh root@46.225.61.78 bash setup-pruning.sh
# ═══════════════════════════════════════════════════════════
set -euo pipefail

echo "╔══════════════════════════════════════════════╗"
echo "║  HCI — n8n Execution Pruning Setup           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Stap 1: Vind het n8n service bestand ──────────────────
SERVICE_FILE=""
for f in /etc/systemd/system/n8n.service /lib/systemd/system/n8n.service; do
  if [ -f "$f" ]; then
    SERVICE_FILE="$f"
    break
  fi
done

if [ -z "$SERVICE_FILE" ]; then
  # Probeer via systemctl
  FOUND=$(systemctl show n8n -p FragmentPath 2>/dev/null | cut -d= -f2)
  if [ -n "$FOUND" ] && [ -f "$FOUND" ]; then
    SERVICE_FILE="$FOUND"
  fi
fi

# Check Docker-based n8n
if [ -z "$SERVICE_FILE" ]; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q n8n; then
    echo "⚠️  n8n draait in Docker. Pruning instellen via docker-compose."
    echo ""

    # Find docker-compose file
    COMPOSE_FILE=""
    for f in /root/n8n/docker-compose.yml /opt/n8n/docker-compose.yml /home/n8n/docker-compose.yml; do
      if [ -f "$f" ]; then
        COMPOSE_FILE="$f"
        break
      fi
    done

    if [ -z "$COMPOSE_FILE" ]; then
      COMPOSE_FILE=$(find / -name "docker-compose.yml" -path "*/n8n*" 2>/dev/null | head -1)
    fi

    if [ -n "$COMPOSE_FILE" ]; then
      echo "Gevonden: $COMPOSE_FILE"
      echo ""
      echo "=== HUIDIGE CONFIG ==="
      cat "$COMPOSE_FILE"
      echo ""

      # Backup
      cp "$COMPOSE_FILE" "${COMPOSE_FILE}.bak.$(date +%Y%m%d)"
      echo "✅ Backup: ${COMPOSE_FILE}.bak.$(date +%Y%m%d)"

      # Check if environment section exists and add pruning vars
      if grep -q "EXECUTIONS_DATA_PRUNE" "$COMPOSE_FILE"; then
        echo "⚠️  Pruning variabelen bestaan al!"
        grep "EXECUTIONS" "$COMPOSE_FILE"
      else
        # Add environment variables before the first 'volumes:' or at end of environment block
        if grep -q "environment:" "$COMPOSE_FILE"; then
          # Add after the last environment variable
          sed -i '/environment:/,/^[^ ]/{
            /^[^ ]/i\      - EXECUTIONS_DATA_PRUNE=true\n      - EXECUTIONS_DATA_MAX_AGE=7\n      - EXECUTIONS_DATA_SAVE_ON_ERROR=all\n      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=none\n      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
          }' "$COMPOSE_FILE" 2>/dev/null || {
            echo "Auto-edit mislukt. Voeg handmatig toe onder 'environment:':"
            echo "      - EXECUTIONS_DATA_PRUNE=true"
            echo "      - EXECUTIONS_DATA_MAX_AGE=7"
            echo "      - EXECUTIONS_DATA_SAVE_ON_ERROR=all"
            echo "      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=none"
            echo "      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true"
          }
        fi

        echo ""
        echo "=== NIEUWE CONFIG ==="
        cat "$COMPOSE_FILE"
      fi

      echo ""
      echo "Herstart n8n Docker..."
      cd "$(dirname "$COMPOSE_FILE")"
      docker-compose down && docker-compose up -d
      echo "✅ n8n Docker herstart"
    else
      echo "❌ Geen docker-compose.yml gevonden voor n8n."
      echo "Voeg deze environment variabelen toe aan je Docker setup:"
      echo "  EXECUTIONS_DATA_PRUNE=true"
      echo "  EXECUTIONS_DATA_MAX_AGE=7"
      echo "  EXECUTIONS_DATA_SAVE_ON_ERROR=all"
      echo "  EXECUTIONS_DATA_SAVE_ON_SUCCESS=none"
      echo "  EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true"
      exit 1
    fi
  else
    echo "❌ Geen n8n service of Docker container gevonden."
    echo "   Handmatige actie vereist."
    exit 1
  fi
else
  # ── Systemd-based n8n ────────────────────────────────────
  echo "✅ Service gevonden: $SERVICE_FILE"
  echo ""
  echo "=== HUIDIGE CONFIG ==="
  cat "$SERVICE_FILE"
  echo ""

  # Backup
  cp "$SERVICE_FILE" "${SERVICE_FILE}.bak.$(date +%Y%m%d)"
  echo "✅ Backup: ${SERVICE_FILE}.bak.$(date +%Y%m%d)"

  # Check of pruning al geconfigureerd is
  if grep -q "EXECUTIONS_DATA_PRUNE" "$SERVICE_FILE"; then
    echo "⚠️  Pruning variabelen bestaan al!"
    grep "EXECUTIONS" "$SERVICE_FILE"
  else
    # Voeg toe na [Service] sectie, na de laatste Environment= regel
    # Of na ExecStart als er geen Environment regels zijn
    if grep -q "^Environment=" "$SERVICE_FILE"; then
      # Voeg toe na de laatste Environment regel
      LAST_ENV_LINE=$(grep -n "^Environment=" "$SERVICE_FILE" | tail -1 | cut -d: -f1)
      sed -i "${LAST_ENV_LINE}a\\
Environment=\"EXECUTIONS_DATA_PRUNE=true\"\\
Environment=\"EXECUTIONS_DATA_MAX_AGE=7\"\\
Environment=\"EXECUTIONS_DATA_SAVE_ON_ERROR=all\"\\
Environment=\"EXECUTIONS_DATA_SAVE_ON_SUCCESS=none\"\\
Environment=\"EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true\"" "$SERVICE_FILE"
    else
      # Voeg toe na [Service] header
      sed -i '/\[Service\]/a\
Environment="EXECUTIONS_DATA_PRUNE=true"\
Environment="EXECUTIONS_DATA_MAX_AGE=7"\
Environment="EXECUTIONS_DATA_SAVE_ON_ERROR=all"\
Environment="EXECUTIONS_DATA_SAVE_ON_SUCCESS=none"\
Environment="EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true"' "$SERVICE_FILE"
    fi

    echo ""
    echo "=== NIEUWE CONFIG ==="
    cat "$SERVICE_FILE"
  fi

  echo ""
  echo "Herstart n8n via systemd..."
  systemctl daemon-reload
  systemctl restart n8n
  sleep 3
  systemctl status n8n --no-pager | head -15
  echo ""
  echo "✅ n8n herstart met pruning enabled"
fi

# ── Stap 2: Disk usage check ──────────────────────────────
echo ""
echo "═══ DISK USAGE ═══"
df -h /
USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
echo ""
if [ "$USAGE" -gt 70 ]; then
  echo "⚠️  Disk usage: ${USAGE}% — actie vereist!"
  echo "   Overweeg: journalctl --vacuum-time=7d"
  echo "   En: docker system prune -f (als Docker)"
else
  echo "✅ Disk usage: ${USAGE}% — OK"
fi

# ── Stap 3: Disk cleanup cron ─────────────────────────────
echo ""
echo "═══ CRON SETUP: Wekelijkse Disk Check ═══"
CRON_CMD='0 8 * * 1 USAGE=$(df -h / | awk '\''NR==2 {print $5}'\'' | tr -d '\''%'\''); if [ "$USAGE" -gt 70 ]; then curl -s -X POST https://hooks.slack.com/services/T0AKAFST1B6/B0AKKRRJGDP/fiqGxhsMEhfZEIrHxCF1qW -H "Content-Type: application/json" -d "{\"text\":\"⚠️ Disk alert: ${USAGE}% van 80GB gebruikt. Actie vereist.\"}"; fi'

if crontab -l 2>/dev/null | grep -q "Disk alert"; then
  echo "⚠️  Disk check cron bestaat al"
else
  (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
  echo "✅ Cron job toegevoegd: maandag 08:00 disk check → Slack alert als >70%"
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Setup compleet                            ║"
echo "║  • Execution pruning: AAN (max 7 dagen)      ║"
echo "║  • Success logs: NIET opgeslagen              ║"
echo "║  • Error logs: WEL opgeslagen                 ║"
echo "║  • Disk check: Elke maandag 08:00             ║"
echo "╚══════════════════════════════════════════════╝"
