#!/usr/bin/env bash
# ===========================================================================
# HCI — GDPR Deletion Script (AVG Art. 17 — Recht op vergetelheid)
# ===========================================================================
# Usage: ./gdpr-delete.sh <email-address>
#
# This script:
# 1. Searches all relevant PocketBase collections for records matching the email
# 2. Deletes all found records
# 3. Creates a deletion_log entry (metadata only — no PII stored)
# 4. Outputs a reference number for the data subject
#
# Requirements:
#   - PB_URL and PB_TOKEN environment variables, OR
#   - Will prompt for admin credentials
# ===========================================================================

set -euo pipefail

EMAIL="${1:-}"
if [ -z "$EMAIL" ]; then
  echo "Usage: $0 <email-address>"
  echo "Example: $0 user@example.com"
  exit 1
fi

PB_URL="${PB_URL:-https://api.hes-consultancy-international.com}"

# Authenticate if no token provided
if [ -z "${PB_TOKEN:-}" ]; then
  echo "No PB_TOKEN set. Authenticating..."
  read -rp "Admin email: " ADMIN_EMAIL
  read -rsp "Admin password: " ADMIN_PASS
  echo
  AUTH_RESPONSE=$(curl -s -X POST "$PB_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
  PB_TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
  if [ -z "$PB_TOKEN" ]; then
    echo "ERROR: Authentication failed."
    exit 1
  fi
  echo "Authenticated successfully."
fi

AUTH="Authorization: Bearer $PB_TOKEN"
REF_NUMBER="DEL-$(date +%Y%m%d)-$(head -c 4 /dev/urandom | od -An -tx1 | tr -d ' ')"
COLLECTIONS_CHECKED=""
TOTAL_DELETED=0
EXECUTED_BY="${SUDO_USER:-$(whoami)}"

echo "=========================================="
echo "GDPR Deletion Request"
echo "Reference: $REF_NUMBER"
echo "Email: $EMAIL"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="
echo

# Collections to search (with their email field name)
declare -A COLLECTION_FIELDS=(
  ["contacts"]="email"
  ["deals"]="email"
  ["cmo_fmo_consents"]="email"
)

for COLLECTION in "${!COLLECTION_FIELDS[@]}"; do
  FIELD="${COLLECTION_FIELDS[$COLLECTION]}"
  echo "--- Checking: $COLLECTION (field: $FIELD) ---"
  COLLECTIONS_CHECKED="${COLLECTIONS_CHECKED}${COLLECTIONS_CHECKED:+, }$COLLECTION"

  # Search for records
  RESPONSE=$(curl -s "$PB_URL/api/collections/$COLLECTION/records?filter=($FIELD='$EMAIL')" \
    -H "$AUTH" 2>/dev/null || echo '{"items":[]}')

  # Extract record IDs
  IDS=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for item in data.get('items', []):
        print(item['id'])
except:
    pass
" 2>/dev/null)

  COUNT=0
  while IFS= read -r ID; do
    [ -z "$ID" ] && continue
    echo "  Deleting record: $ID"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
      "$PB_URL/api/collections/$COLLECTION/records/$ID" \
      -H "$AUTH")
    if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
      COUNT=$((COUNT + 1))
    else
      echo "  WARNING: Delete returned HTTP $HTTP_CODE for $ID"
    fi
  done <<< "$IDS"

  echo "  Deleted: $COUNT record(s)"
  TOTAL_DELETED=$((TOTAL_DELETED + COUNT))
  echo
done

# Create deletion log entry (no PII — only metadata)
echo "--- Creating deletion log ---"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG_RESPONSE=$(curl -s -X POST "$PB_URL/api/collections/deletion_log/records" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d "{
    \"request_date\": \"$NOW\",
    \"completion_date\": \"$NOW\",
    \"collections_checked\": \"$COLLECTIONS_CHECKED\",
    \"records_deleted\": $TOTAL_DELETED,
    \"executed_by\": \"$EXECUTED_BY\",
    \"reference_number\": \"$REF_NUMBER\"
  }")

LOG_ID=$(echo "$LOG_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))" 2>/dev/null)

echo
echo "=========================================="
echo "GDPR Deletion Complete"
echo "Reference: $REF_NUMBER"
echo "Collections checked: $COLLECTIONS_CHECKED"
echo "Total records deleted: $TOTAL_DELETED"
echo "Log entry ID: $LOG_ID"
echo "=========================================="
echo
echo "Provide this reference number to the data subject: $REF_NUMBER"
echo "AVG Art. 17: Response must be sent within 30 days."
