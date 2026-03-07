#!/usr/bin/env python3
"""
deploy_workflows.py — Import and activate n8n workflows via API

Usage:
  N8N_API_KEY=your_key python3 deploy_workflows.py

  Or set the key in /opt/n8n/.env and source it first.
"""

import json
import os
import sys

try:
    import requests
except ImportError:
    print("pip install requests")
    sys.exit(1)

N8N_URL = "https://n8n.hes-consultancy-international.com"
N8N_API_KEY = os.environ.get("N8N_API_KEY", "")

WORKFLOWS = [
    ("dealflow_slack_workflow.json", "HCI DealFlow → Slack"),
    ("tenderned_workflow.json", "HCI TenderNed Dagelijks"),
]


def n8n_req(method, path, data=None):
    headers = {"X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json"}
    url = f"{N8N_URL}{path}"
    r = requests.request(method, url, json=data, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()


def main():
    if not N8N_API_KEY:
        print("❌ N8N_API_KEY not set.")
        print("   Set it: export N8N_API_KEY=your_key")
        print("   Or find it: cat /opt/n8n/.env | grep N8N_API_KEY")
        print("   Or in n8n UI: Settings → API → Create API Key")
        sys.exit(1)

    # Test connection
    print(f"n8n: {N8N_URL}")
    try:
        workflows = n8n_req("GET", "/api/v1/workflows")
        existing = {w["name"]: w["id"] for w in workflows.get("data", [])}
        print(f"✓ Connected — {len(existing)} existing workflows\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    results = []

    for filename, expected_name in WORKFLOWS:
        path = os.path.join(script_dir, filename)
        print(f"── {expected_name} ──")

        with open(path) as f:
            wf = json.load(f)

        # Check if already exists
        if expected_name in existing:
            wf_id = existing[expected_name]
            print(f"  ⚠ Already exists (ID: {wf_id}) — updating...")
            result = n8n_req("PATCH", f"/api/v1/workflows/{wf_id}", wf)
        else:
            print("  Creating workflow...")
            result = n8n_req("POST", "/api/v1/workflows", wf)
            wf_id = result["id"]

        print(f"  ✓ Workflow ID: {wf_id}")

        # Activate
        print("  Activating...", end=" ")
        try:
            n8n_req("PATCH", f"/api/v1/workflows/{wf_id}", {"active": True})
            print("✓ Active")
        except Exception as e:
            print(f"⚠ {e}")

        # Test run
        print("  Test run...", end=" ")
        try:
            n8n_req("POST", f"/api/v1/workflows/{wf_id}/run")
            print("✓ Triggered")
        except Exception as e:
            print(f"⚠ {e}")

        results.append({"name": expected_name, "id": wf_id})
        print()

    print("═" * 50)
    print("Resultaat:")
    for r in results:
        print(f"  ✓ {r['name']} — ID: {r['id']}")
    print(f"\nn8n Dashboard: {N8N_URL}")


if __name__ == "__main__":
    main()
