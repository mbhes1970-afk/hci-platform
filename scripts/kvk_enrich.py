#!/usr/bin/env python3
"""
kvk_enrich.py — B-09: Enrich PocketBase contacts with KVK data
Deploy to: /opt/pocketbase/kvk_enrich.py on Hetzner (root@46.225.61.78)

Usage:
  python3 kvk_enrich.py --test          # dry-run first 10 contacts
  python3 kvk_enrich.py                 # enrich all non-enriched contacts
  python3 kvk_enrich.py --force         # re-enrich already enriched contacts

API options (set via env var or flag):
  --api overheid   → uses api.overheid.io/openkvk (needs OVERHEID_API_KEY)
  --api kvk        → uses api.kvk.nl/api/v2/zoeken (needs KVK_API_KEY)

  If no API key available, the script will still create the CSV template
  of all organisations for manual enrichment.
"""

import csv
import json
import os
import sys
import time
from difflib import SequenceMatcher

try:
    import requests
except ImportError:
    print("pip install requests")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

PB_URL   = "https://api.hes-consultancy-international.com"
PB_EMAIL = "mbhes@hes-consultancy-international.com"
PB_PASS  = "02091970_Promiss@"

OVERHEID_API_KEY = os.environ.get("OVERHEID_API_KEY", "")
KVK_API_KEY      = os.environ.get("KVK_API_KEY", "")

MATCH_THRESHOLD  = 0.75
RATE_LIMIT_SLEEP = 0.7
PAGE_SIZE        = 200

HEADERS = {"User-Agent": "HCI-KVK-Enrichment/1.0"}


# ── PocketBase helpers ────────────────────────────────────────────────────────

def pb_auth():
    r = requests.post(f"{PB_URL}/api/admins/auth-with-password", json={
        "identity": PB_EMAIL, "password": PB_PASS
    }, timeout=10)
    r.raise_for_status()
    return r.json()["token"]


def pb_get(path, token):
    r = requests.get(f"{PB_URL}{path}", headers={"Authorization": token}, timeout=15)
    r.raise_for_status()
    return r.json()


def pb_patch(path, data, token):
    r = requests.patch(f"{PB_URL}{path}", json=data,
                       headers={"Authorization": token}, timeout=15)
    r.raise_for_status()
    return r.json()


def fetch_contacts(token, limit=None, force=False):
    """Fetch contacts paginated. Skip already-enriched unless force."""
    contacts = []
    page = 1
    while True:
        filt = ""
        if not force:
            filt = "&filter=(kvk_enriched=false||kvk_enriched=null)"
        url = f"/api/collections/contacts/records?perPage={PAGE_SIZE}&page={page}&sort=-created{filt}"
        r = pb_get(url, token)
        contacts.extend(r.get("items", []))
        if limit and len(contacts) >= limit:
            return contacts[:limit]
        if page >= r.get("totalPages", 1):
            break
        page += 1
    return contacts


# ── KVK API search ───────────────────────────────────────────────────────────

def kvk_search_overheid(name):
    """Search via api.overheid.io/openkvk (requires OVERHEID_API_KEY)."""
    r = requests.get("https://api.overheid.io/openkvk", params={
        "query": name,
        "fields[]": ["dossiernummer", "handelsnaam", "postcode", "plaats", "type", "sub_type"],
    }, headers={**HEADERS, "ovio-api-key": OVERHEID_API_KEY}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        return data.get("results", [])
    return []


def kvk_search_kvk(name):
    """Search via api.kvk.nl/api/v2/zoeken (requires KVK_API_KEY)."""
    r = requests.get("https://api.kvk.nl/api/v2/zoeken", params={
        "naam": name, "type": "hoofdvestiging",
    }, headers={**HEADERS, "apikey": KVK_API_KEY}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        return data.get("resultaten", [])
    if r.status_code == 429:
        print("  ⚠️  Rate limited — wacht 30s")
        time.sleep(30)
        return kvk_search_kvk(name)
    return []


def kvk_search(name, api_type):
    """Route to the right API."""
    if api_type == "overheid":
        return kvk_search_overheid(name)
    elif api_type == "kvk":
        return kvk_search_kvk(name)
    return []


# ── Fuzzy matching ────────────────────────────────────────────────────────────

def fuzzy_match(a, b):
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def best_match(org_name, results, api_type):
    """Find best matching result above threshold."""
    best, best_score = None, 0.0
    for item in results:
        if api_type == "overheid":
            kvk_name = item.get("handelsnaam", "")
        else:
            kvk_name = item.get("handelsnaam", item.get("naam", ""))
        if not kvk_name:
            continue
        score = fuzzy_match(org_name, kvk_name)
        if score > best_score:
            best_score = score
            best = item
    if best and best_score >= MATCH_THRESHOLD:
        return best, round(best_score, 3)
    return None, 0


def extract_kvk_data(match, api_type):
    """Extract standardized KVK fields from API result."""
    if api_type == "overheid":
        return {
            "kvk_nummer": str(match.get("dossiernummer", "")),
            "sbi_code": "",
            "sbi_omschrijving": str(match.get("sub_type", "")),
            "kvk_rechtsvorm": str(match.get("type", "")),
            "kvk_stad": str(match.get("plaats", "")),
            "kvk_postcode": str(match.get("postcode", "")),
            "kvk_enriched": True,
        }
    else:  # kvk api
        adres = (match.get("adressen") or [{}])[0] if match.get("adressen") else {}
        sbi = (match.get("sbiActiviteiten") or [{}])[0] if match.get("sbiActiviteiten") else {}
        return {
            "kvk_nummer": str(match.get("kvkNummer", "")),
            "sbi_code": str(sbi.get("sbiCode", "")),
            "sbi_omschrijving": str(sbi.get("sbiOmschrijving", "")),
            "kvk_rechtsvorm": str(match.get("rechtsvorm", "")),
            "kvk_stad": str(adres.get("plaats", "")),
            "kvk_postcode": str(adres.get("postcode", "")),
            "kvk_enriched": True,
        }


# ── Main enrichment loop ─────────────────────────────────────────────────────

def enrich(token, contacts, api_type, dry_run=False):
    enriched_rows = []
    missed_rows = []
    total = len(contacts)
    batch_size = 50

    mode = "DRY RUN" if dry_run else "LIVE"
    print(f"\n[KVK] Start — {total} contacten te verwerken ({mode})")

    for i, c in enumerate(contacts, 1):
        org = (c.get("organisatie") or "").strip()
        cid = c["id"]

        if not org or org.lower() in ("freelance", "-", "n/a", "onbekend", "nvt", ""):
            missed_rows.append({"id": cid, "organisatie": org, "reason": "empty/skip"})
            if i % batch_size == 0:
                print(f"[KVK] Batch {i // batch_size}/{(total + batch_size - 1) // batch_size} ({i} records)")
            continue

        match, score = None, 0
        retries = 0
        while retries < 3:
            try:
                results = kvk_search(org, api_type)
                match, score = best_match(org, results, api_type) if results else (None, 0)
                break
            except Exception as e:
                retries += 1
                if retries >= 3:
                    print(f"  ❌ {org[:40]} — API error after 3 retries: {e}")
                    missed_rows.append({"id": cid, "organisatie": org, "reason": f"api_error: {e}"})
                time.sleep(2)

        if match:
            kvk_data = extract_kvk_data(match, api_type)
            if score >= 0.95:
                print(f"  ✅ Exact: {org[:40]} → KVK {kvk_data['kvk_nummer']}")
            else:
                print(f"  ✅ Fuzzy ({score}): {org[:40]} → KVK {kvk_data['kvk_nummer']}")

            if not dry_run:
                try:
                    pb_patch(f"/api/collections/contacts/records/{cid}", kvk_data, token)
                except Exception as e:
                    print(f"    ⚠️  PATCH failed: {e}")

            enriched_rows.append({"id": cid, "organisatie": org, **kvk_data, "match_score": score})
        else:
            if retries < 3:  # only log if not already logged as api_error
                print(f"  ⚠️  Skip: \"{org[:40]}\" — geen match")
                missed_rows.append({"id": cid, "organisatie": org, "reason": "no_match"})

        if i % batch_size == 0:
            print(f"[KVK] Batch {i // batch_size}/{(total + batch_size - 1) // batch_size} ({i} records)")

        time.sleep(RATE_LIMIT_SLEEP)

    # Write CSV reports
    outdir = os.path.dirname(os.path.abspath(__file__)) or "."
    _write_csv(os.path.join(outdir, "kvk_enriched.csv"), enriched_rows)
    _write_csv(os.path.join(outdir, "kvk_misses.csv"), missed_rows)

    print(f"\n[KVK] Klaar — {len(enriched_rows)} verrijkt, {len(missed_rows)} niet gevonden")
    print(f"[KVK] Rapporten: {outdir}/kvk_enriched.csv + kvk_misses.csv")


def export_orgs(token, contacts):
    """Export all unique organisations to CSV for manual enrichment when no API key."""
    outdir = os.path.dirname(os.path.abspath(__file__)) or "."
    orgs = {}
    for c in contacts:
        org = (c.get("organisatie") or "").strip()
        if org and org.lower() not in ("freelance", "-", "n/a", "onbekend", "nvt"):
            if org not in orgs:
                orgs[org] = {"organisatie": org, "count": 0, "example_id": c["id"]}
            orgs[org]["count"] += 1

    rows = sorted(orgs.values(), key=lambda x: -x["count"])
    path = os.path.join(outdir, "kvk_todo.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["organisatie", "count", "example_id",
                           "kvk_nummer", "sbi_code", "sbi_omschrijving",
                           "kvk_rechtsvorm", "kvk_stad", "kvk_postcode"])
        w.writeheader()
        for row in rows:
            w.writerow({**row, "kvk_nummer": "", "sbi_code": "", "sbi_omschrijving": "",
                        "kvk_rechtsvorm": "", "kvk_stad": "", "kvk_postcode": ""})

    print(f"\n[KVK] Geen API key beschikbaar.")
    print(f"[KVK] {len(rows)} unieke organisaties geëxporteerd naar: {path}")
    print(f"[KVK] Vul de KVK kolommen handmatig in en importeer met: python3 kvk_import.py")


def _write_csv(path, rows):
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    test_mode = "--test" in sys.argv
    force     = "--force" in sys.argv
    limit     = 10 if test_mode else None

    # Detect API
    api_type = None
    if "--api" in sys.argv:
        idx = sys.argv.index("--api")
        if idx + 1 < len(sys.argv):
            api_type = sys.argv[idx + 1]

    if not api_type:
        if OVERHEID_API_KEY:
            api_type = "overheid"
        elif KVK_API_KEY:
            api_type = "kvk"

    print(f"PocketBase: {PB_URL}")
    print(f"API: {api_type or 'none (export mode)'}")
    if test_mode:
        print(f"Mode: TEST (eerste 10 contacten)")
    print()

    token = pb_auth()
    print("Auth OK")

    contacts = fetch_contacts(token, limit=limit, force=force)
    print(f"Fetched {len(contacts)} contacts to process")

    if not contacts:
        print("Niets te verwerken.")
        sys.exit(0)

    if api_type:
        enrich(token, contacts, api_type, dry_run=test_mode)
    else:
        # No API key: export org list for manual enrichment
        export_orgs(token, contacts)


if __name__ == "__main__":
    main()
