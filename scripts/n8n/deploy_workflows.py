#!/usr/bin/env python3
"""
deploy_workflows.py — Deploy and manage n8n workflows via Public API v1

Usage:
  export N8N_API_KEY=your_key
  python3 deploy_workflows.py

Actions:
  1. Creates "HCI DealFlow → Slack Alert" if not exists
  2. Updates TenderNed workflow 4B4zpwYnmLcAF7u3 (must be unarchived first in UI)
  3. Activates all workflows
"""

import json
import os
import sys
import urllib.request
import urllib.error

N8N_URL = os.environ.get("N8N_URL", "https://n8n.hes-consultancy-international.com")
N8N_API_KEY = os.environ.get("N8N_API_KEY", "")
TENDERNED_WF_ID = "4B4zpwYnmLcAF7u3"

SLACK_WEBHOOK = "https://hooks.slack.com/services/T0AKAFST1B6/B0AKKRRJGDP/fiqGxhsMEhfZEIrHxCF1qW"
PB_URL = "https://api.hes-consultancy-international.com"


def api(method, path, data=None):
    url = f"{N8N_URL}/api/v1{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("X-N8N-API-KEY", N8N_API_KEY)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def create_dealflow_workflow():
    """Create the DealFlow → Slack workflow."""
    return {
        "name": "HCI DealFlow → Slack Alert",
        "nodes": [
            {
                "parameters": {
                    "rule": {"interval": [{"field": "minutes", "minutesInterval": 15}]}
                },
                "name": "Elke 15 min",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [240, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": f"{PB_URL}/api/admins/auth-with-password",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={"identity":"mbhes@hes-consultancy-international.com","password":"02091970_Promiss@"}',
                    "options": {},
                },
                "name": "PB Auth",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [460, 300],
            },
            {
                "parameters": {
                    "method": "GET",
                    "url": f"{PB_URL}/api/collections/deals/records",
                    "sendQuery": True,
                    "queryParameters": {
                        "parameters": [
                            {"name": "filter", "value": "status='new'"},
                            {"name": "sort", "value": "-created"},
                            {"name": "perPage", "value": "50"},
                        ]
                    },
                    "sendHeaders": True,
                    "headerParameters": {
                        "parameters": [
                            {"name": "Authorization", "value": "={{ $json.token }}"}
                        ]
                    },
                    "options": {},
                },
                "name": "Haal nieuwe deals",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [680, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "options": {"caseSensitive": True, "leftValue": ""},
                        "conditions": [
                            {
                                "leftValue": "={{ $json.totalItems }}",
                                "rightValue": "0",
                                "operator": {"type": "number", "operation": "gt"},
                            }
                        ],
                        "combinator": "and",
                    }
                },
                "name": "Nieuwe deals?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 2,
                "position": [900, 300],
            },
            {
                "parameters": {
                    "jsCode": (
                        "const input = $input.first().json;\n"
                        "const items = input.items || [];\n"
                        "const token = $('PB Auth').first().json.token;\n"
                        "\n"
                        "const results = items.map(deal => ({\n"
                        "  id: deal.id,\n"
                        "  org_name: deal.org_name || deal.company || 'Onbekend',\n"
                        "  sector: deal.sector || '-',\n"
                        "  role: deal.role || '-',\n"
                        "  overall_score: deal.overall_score || 0,\n"
                        "  sm_tier: deal.sm_tier || '-',\n"
                        "  source: deal.source || '-',\n"
                        "  token: token\n"
                        "}));\n"
                        "\n"
                        "return results;"
                    )
                },
                "name": "Prepare deals",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [1120, 200],
            },
            {
                "parameters": {
                    "method": "PATCH",
                    "url": f"={PB_URL}/api/collections/deals/records/{{{{ $json.id }}}}",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={"status":"contacted"}',
                    "sendHeaders": True,
                    "headerParameters": {
                        "parameters": [
                            {"name": "Authorization", "value": "={{ $json.token }}"}
                        ]
                    },
                    "options": {},
                },
                "name": "Update status",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1340, 200],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": SLACK_WEBHOOK,
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": (
                        '={"text":"\\ud83c\\udfaf *Nieuwe DealFlow Lead*\\n'
                        "Organisatie: {{ $json.org_name }}\\n"
                        "Sector: {{ $json.sector }} | Rol: {{ $json.role }}\\n"
                        "Score: {{ $json.overall_score }}/10 | Tier: {{ $json.sm_tier }}\\n"
                        "Bron: {{ $json.source }}\\n"
                        f'\\u2192 {PB_URL}/_/#/collections/deals"}}'
                    ),
                    "options": {},
                },
                "name": "Slack notificatie",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1560, 200],
            },
        ],
        "connections": {
            "Elke 15 min": {
                "main": [[{"node": "PB Auth", "type": "main", "index": 0}]]
            },
            "PB Auth": {
                "main": [[{"node": "Haal nieuwe deals", "type": "main", "index": 0}]]
            },
            "Haal nieuwe deals": {
                "main": [[{"node": "Nieuwe deals?", "type": "main", "index": 0}]]
            },
            "Nieuwe deals?": {
                "main": [
                    [{"node": "Prepare deals", "type": "main", "index": 0}],
                    [],
                ]
            },
            "Prepare deals": {
                "main": [[{"node": "Update status", "type": "main", "index": 0}]]
            },
            "Update status": {
                "main": [[{"node": "Slack notificatie", "type": "main", "index": 0}]]
            },
        },
        "settings": {"executionOrder": "v1"},
    }


def add_slack_to_tenderned(wf):
    """Add Slack notification node and update schedule on existing TenderNed workflow."""
    nodes = wf["nodes"]
    connections = wf["connections"]

    # Update schedule to daily 07:00
    for node in nodes:
        if (
            node["type"] == "n8n-nodes-base.scheduleTrigger"
            and node["name"] == "Schedule Trigger"
        ):
            node["parameters"] = {
                "rule": {
                    "interval": [
                        {"field": "cronExpression", "expression": "0 7 * * *"}
                    ]
                }
            }
            print("  ✅ Schedule → daily 07:00")
            break

    # Add Slack node if missing
    if not any(n["name"] == "Slack TenderNed Alert" for n in nodes):
        nodes.append(
            {
                "parameters": {
                    "method": "POST",
                    "url": SLACK_WEBHOOK,
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": (
                        '={"text":"\\ud83d\\udccb *TenderNed Alert*\\n'
                        "Aanbesteding: {{ $json.json_aanbestedingNaam }}\\n"
                        "Opdrachtgever: {{ $json.json_opdrachtgeverNaam }}\\n"
                        "CPV: {{ $json.cpv_all_text }}\\n"
                        "Deadline: {{ $json.json_sluitingsDatum }}\\n"
                        "Platform: {{ $json.xml_platform }}\\n"
                        '\\u2192 {{ $json.tenderNedUrl }}"}'
                    ),
                    "options": {},
                },
                "id": "slack-tenderned-alert-001",
                "name": "Slack TenderNed Alert",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [4184, 416],
            }
        )
        print("  ✅ Slack notification node added")

    # Wire Filter → Slack
    filter_conns = connections.get("Filter op ...", {}).get("main", [[]])
    slack_ref = {"node": "Slack TenderNed Alert", "type": "main", "index": 0}
    if not any(c.get("node") == "Slack TenderNed Alert" for c in filter_conns[0]):
        filter_conns[0].append(slack_ref)
        print("  ✅ Filter → Slack connection wired")
    connections["Filter op ..."] = {"main": filter_conns}

    return nodes, connections


def main():
    if not N8N_API_KEY:
        print("❌ N8N_API_KEY not set.")
        print("   export N8N_API_KEY=your_key")
        print("   Or in n8n UI: Settings → API → Create API Key")
        sys.exit(1)

    print(f"n8n: {N8N_URL}\n")

    # List existing workflows
    try:
        workflows = api("GET", "/workflows")
        existing = {w["name"]: w["id"] for w in workflows.get("data", [])}
        print(f"✓ Connected — {len(existing)} existing workflows\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # === WORKFLOW 1: DealFlow ===
    print("━━ WORKFLOW 1: HCI DealFlow → Slack Alert ━━")
    dealflow_name = "HCI DealFlow → Slack Alert"
    if dealflow_name in existing:
        wf_id = existing[dealflow_name]
        print(f"  Already exists: {wf_id}")
    else:
        try:
            result = api("POST", "/workflows", create_dealflow_workflow())
            wf_id = result["id"]
            print(f"  ✅ Created: {wf_id}")
        except Exception as e:
            print(f"  ❌ Create failed: {e}")
            wf_id = None

    if wf_id:
        try:
            api("POST", f"/workflows/{wf_id}/activate")
            print("  ✅ Activated")
        except Exception as e:
            print(f"  ⚠️ Activation: {e}")

    # === WORKFLOW 2: TenderNed ===
    print(f"\n━━ WORKFLOW 2: TenderNed (ID: {TENDERNED_WF_ID}) ━━")
    try:
        tn_wf = api("GET", f"/workflows/{TENDERNED_WF_ID}")
        is_archived = tn_wf.get("isArchived", False)
        print(f"  Name: {tn_wf['name']}")
        print(f"  Archived: {is_archived}")

        if is_archived:
            print(
                "\n  ⚠️ Workflow is ARCHIVED. n8n Public API cannot unarchive.")
            print("  → Unarchive in n8n UI first:")
            print(f"    1. Open {N8N_URL}")
            print("    2. Click filter icon → Show archived")
            print(f"    3. Open '{tn_wf['name']}'")
            print("    4. Click ⋯ menu → Unarchive")
            print("    5. Re-run this script")
        else:
            # Update with Slack + schedule
            nodes, connections = add_slack_to_tenderned(tn_wf)

            # Strip unsupported settings
            settings = {"executionOrder": "v1"}

            update = {
                "name": "HCI TenderNed Dagelijkse Scan + Slack Alert",
                "nodes": nodes,
                "connections": connections,
                "settings": settings,
            }

            result = api("PUT", f"/workflows/{TENDERNED_WF_ID}", update)
            print(f"  ✅ Updated: {result['name']}")

            try:
                api("POST", f"/workflows/{TENDERNED_WF_ID}/activate")
                print("  ✅ Activated")
            except Exception as e:
                print(f"  ⚠️ Activation: {e}")

    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  ❌ Error: HTTP {e.code} — {err[:300]}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # === Summary ===
    print("\n" + "═" * 50)
    print("Samenvatting:")
    print(f"  DealFlow:  {'✅' if wf_id else '❌'} ID: {wf_id or 'failed'}")
    print(f"  TenderNed: ID: {TENDERNED_WF_ID} (check status above)")
    print(f"\nn8n Dashboard: {N8N_URL}")


if __name__ == "__main__":
    main()
