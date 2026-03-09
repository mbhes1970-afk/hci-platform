#!/usr/bin/env bash
# ===========================================================================
# Backfill GDPR compliance fields for existing contacts
# Sets: opt_out_token (UUID v4), data_source, gdpr_basis, consent_status
# ===========================================================================
set -euo pipefail

PB_URL="${PB_URL:-https://api.hes-consultancy-international.com}"
PB_TOKEN="${PB_TOKEN:-}"

if [ -z "$PB_TOKEN" ]; then
  echo "No PB_TOKEN set. Authenticating..."
  read -rp "Admin email: " ADMIN_EMAIL
  read -rsp "Admin password: " ADMIN_PASS
  echo
  PB_TOKEN=$(curl -s -X POST "$PB_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
fi

AUTH="Authorization: Bearer $PB_TOKEN"

# Generate UUID v4
gen_uuid() {
  python3 -c "import uuid; print(uuid.uuid4())"
}

PAGE=1
TOTAL_UPDATED=0

while true; do
  echo "Fetching page $PAGE..."
  RESPONSE=$(curl -s "$PB_URL/api/collections/contacts/records?page=$PAGE&perPage=200&fields=id,opt_out_token,data_source,gdpr_basis,consent_status" \
    -H "$AUTH")

  ITEMS=$(echo "$RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('items', [])
for item in items:
    needs_token = not item.get('opt_out_token')
    needs_source = not item.get('data_source')
    needs_basis = not item.get('gdpr_basis')
    needs_consent = not item.get('consent_status')
    if needs_token or needs_source or needs_basis or needs_consent:
        print(item['id'])
total = d.get('totalPages', 0)
print('PAGES:' + str(total))
" 2>/dev/null)

  TOTAL_PAGES=$(echo "$ITEMS" | grep "^PAGES:" | cut -d: -f2)
  IDS=$(echo "$ITEMS" | grep -v "^PAGES:")

  while IFS= read -r ID; do
    [ -z "$ID" ] && continue
    UUID=$(gen_uuid)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
      "$PB_URL/api/collections/contacts/records/$ID" \
      -H "$AUTH" \
      -H "Content-Type: application/json" \
      -d "{
        \"opt_out_token\": \"$UUID\",
        \"data_source\": \"excel_import\",
        \"gdpr_basis\": \"legitimate_interest\",
        \"consent_status\": \"unknown\"
      }")
    if [ "$HTTP_CODE" = "200" ]; then
      TOTAL_UPDATED=$((TOTAL_UPDATED + 1))
    else
      echo "  WARNING: PATCH $ID returned HTTP $HTTP_CODE"
    fi
  done <<< "$IDS"

  echo "  Page $PAGE done. Updated so far: $TOTAL_UPDATED"

  if [ "$PAGE" -ge "${TOTAL_PAGES:-0}" ]; then
    break
  fi
  PAGE=$((PAGE + 1))
done

echo
echo "=========================================="
echo "Backfill complete"
echo "Total contacts updated: $TOTAL_UPDATED"
echo "=========================================="
