#!/bin/bash
# Seed PocketBase kb_regulations collection
# Run on the Hetzner server: bash seed_kb_regulations.sh
#
# Prerequisites:
# 1. PocketBase admin credentials
# 2. jq installed (apt install jq)
# 3. The kb_regulations collection must be created first via PocketBase admin UI
#
# To create the collection:
# 1. Go to https://api.hes-consultancy-international.com/_/
# 2. Login as admin
# 3. Create new collection "kb_regulations" with schema:
#    - code (text, required)
#    - naam_nl (text, required)
#    - naam_en (text, required)
#    - sectoren (json, required)
#    - deadline (text)
#    - boete_max (text)
#    - scope (text)
#    - verplichtingen (json)
#    - pijn_per_rol (json)
#    - bronnen (json)
# 4. Set API rules: List/View = public, Create/Update/Delete = admin only
# 5. Then run this script

PB_URL="https://api.hes-consultancy-international.com"
ADMIN_EMAIL="mbhes@hes-consultancy-international.com"

echo "Enter PocketBase admin password:"
read -s PB_PASSWORD

# Authenticate
echo "Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "${PB_URL}/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${ADMIN_EMAIL}\",\"password\":\"${PB_PASSWORD}\"}")

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  # Try superuser endpoint (PB 0.23+)
  AUTH_RESPONSE=$(curl -s -X POST "${PB_URL}/api/collections/_superusers/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"${ADMIN_EMAIL}\",\"password\":\"${PB_PASSWORD}\"}")
  TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')
fi

if [ -z "$TOKEN" ]; then
  echo "Authentication failed. Response: $AUTH_RESPONSE"
  exit 1
fi

echo "Authenticated successfully."

# Read seed data
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/kb_regulations_seed.json"

if [ ! -f "$SEED_FILE" ]; then
  echo "Seed file not found: $SEED_FILE"
  exit 1
fi

# Insert records
RECORD_COUNT=$(jq '.records | length' "$SEED_FILE")
echo "Seeding ${RECORD_COUNT} regulations..."

for i in $(seq 0 $((RECORD_COUNT - 1))); do
  RECORD=$(jq -c ".records[$i]" "$SEED_FILE")
  CODE=$(echo "$RECORD" | jq -r '.code')

  echo -n "  Inserting ${CODE}... "

  RESPONSE=$(curl -s -X POST "${PB_URL}/api/collections/kb_regulations/records" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "$RECORD")

  ID=$(echo "$RESPONSE" | jq -r '.id // empty')
  if [ -n "$ID" ]; then
    echo "OK (${ID})"
  else
    ERROR=$(echo "$RESPONSE" | jq -r '.message // "unknown error"')
    echo "FAILED: ${ERROR}"
  fi
done

echo "Done. ${RECORD_COUNT} regulations processed."
