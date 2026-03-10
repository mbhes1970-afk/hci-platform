#!/bin/bash
PB_URL="https://api.hes-consultancy-international.com"
PB_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzQyNTQwMzksImlkIjoiMTJhMmNldmZvdjg3NmdnIiwidHlwZSI6ImFkbWluIn0.9sgwLtzSPsLj0UBvsRC5ymllmYYxGmDnErvi4SPusas"

seed() {
  local col="$1" data="$2"
  curl -s -X POST "$PB_URL/api/collections/$col/records" \
    -H "Authorization: $PB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data"
}

echo "=== Seeding icp_sectors ==="

# ICP1
seed icp_sectors '{"name":"Software Vendor","slug":"software-vendor","icp_level":1,"parent_sector":""}'
seed icp_sectors '{"name":"ISV","slug":"isv","icp_level":1,"parent_sector":""}'

# ICP2
seed icp_sectors '{"name":"Partner","slug":"partner","icp_level":2,"parent_sector":""}'
seed icp_sectors '{"name":"Reseller","slug":"reseller","icp_level":2,"parent_sector":""}'
seed icp_sectors '{"name":"MSP","slug":"msp","icp_level":2,"parent_sector":""}'

# ICP3 - overheid
seed icp_sectors '{"name":"Gemeente","slug":"gemeente","icp_level":3,"parent_sector":"overheid"}'
seed icp_sectors '{"name":"Waterschap","slug":"waterschap","icp_level":3,"parent_sector":"overheid"}'
seed icp_sectors '{"name":"Provincie","slug":"provincie","icp_level":3,"parent_sector":"overheid"}'

# ICP3 - zorg
seed icp_sectors '{"name":"Ziekenhuis","slug":"ziekenhuis","icp_level":3,"parent_sector":"zorg"}'
seed icp_sectors '{"name":"GGZ","slug":"ggz","icp_level":3,"parent_sector":"zorg"}'
seed icp_sectors '{"name":"VVT","slug":"vvt","icp_level":3,"parent_sector":"zorg"}'

# ICP3 - finance
seed icp_sectors '{"name":"Bank / Finance","slug":"bank-finance","icp_level":3,"parent_sector":"finance"}'
seed icp_sectors '{"name":"Verzekeraar","slug":"verzekeraar","icp_level":3,"parent_sector":"finance"}'

echo ""
echo "=== Verifying sectors ==="
curl -s "$PB_URL/api/collections/icp_sectors/records?perPage=50" \
  -H "Authorization: $PB_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('items',[]):
    print(f\"  {r['name']:22s} slug={r['slug']:20s} icp={r['icp_level']} parent={r.get('parent_sector','')}\")
print(f\"  Total: {d.get('totalItems',0)} sectors\")
"
