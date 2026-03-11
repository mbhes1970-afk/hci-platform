#!/usr/bin/env python3
"""
Build all n8n workflows for HCI Sprint via the n8n API.
Creates: Module 02-08, Module 06 (re-create), Module 11A-D
All workflows are created INACTIVE — manual activation required in n8n UI.

NOTE: Module 04 uses Google News RSS as proxy because AP website (autoriteitpersoonsgegevens.nl)
returns 503 on all direct requests. Google News indexes AP content and serves it reliably.
Disk Check uses server cron (not n8n) because executeCommand node is disabled.
"""
import json
import time
import urllib.request

N8N_URL = "https://n8n.hes-consultancy-international.com"
N8N_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTRhNzYzMi04YWY1LTQxZjgtYmY3Ni0xZjkzNTE5MDZkYTgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTBhYTc1YjYtODJiNy00MjI5LTliZjUtOTM2MjBiZGM0MGM3IiwiaWF0IjoxNzcyOTYzMzM1fQ.juf4Dxh-Cw3_JL3hfWilDIrn4bNKQr_lHfJYhfBgtkg"
PB_URL = "https://api.hes-consultancy-international.com"
PB_LOCAL = "http://localhost:8090"  # n8n uses local PB
SLACK_DEALFLOW = "https://hooks.slack.com/services/T0AKAFST1B6/B0AKKRRJGDP/fiqGxhsMEhfZEIrHxCF1qW"
SLACK_SYSTEEM = SLACK_DEALFLOW  # Same hook for now

def create_workflow(payload):
    """POST workflow to n8n API."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{N8N_URL}/api/v1/workflows",
        data=data,
        headers={
            "X-N8N-API-KEY": N8N_KEY,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            print(f"  OK: {result.get('id')} — {result.get('name')}")
            return result
    except Exception as e:
        body = ""
        if hasattr(e, "read"):
            body = e.read().decode()
        print(f"  FOUT: {e} — {body[:200]}")
        return None


def slack_node(name, channel_desc, message_expr, position):
    """Helper: HTTP Request node that posts to Slack."""
    return {
        "parameters": {
            "method": "POST",
            "url": SLACK_DEALFLOW if "dealflow" in channel_desc.lower() else SLACK_SYSTEEM,
            "sendHeaders": True,
            "headerParameters": {"parameters": [{"name": "Content-Type", "value": "application/json"}]},
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": message_expr,
            "options": {},
        },
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": position,
    }


def pb_request(name, method, path, body_expr=None, position=[0, 0]):
    """Helper: HTTP Request to PocketBase local."""
    node = {
        "parameters": {
            "method": method,
            "url": f"{PB_LOCAL}{path}",
            "sendHeaders": True,
            "headerParameters": {"parameters": [{"name": "Content-Type", "value": "application/json"}]},
            "options": {},
        },
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": position,
    }
    if body_expr:
        node["parameters"]["sendBody"] = True
        node["parameters"]["specifyBody"] = "json"
        node["parameters"]["jsonBody"] = body_expr
    return node


# ═══════════════════════════════════════════════════════════
# NOTE: Disk Check uses server cron (setup-pruning.sh) instead of n8n
# because n8n-nodes-base.executeCommand is disabled on this server.
# ═══════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 06 — SignalMesh (re-create)
# ═══════════════════════════════════════════════════════════
def build_module_06():
    def pb_save(name, pos):
        return pb_request(
            name, "POST",
            "/api/collections/signalmesh_leads/records",
            '={{ JSON.stringify({session_id:$json.sessionId,icp_type:$json.icpType,sector:$json.sector,tier:$json.tier,fit_score:$json.fitScore,intent_score:$json.intentScore,deal_flow_score:$json.dealFlowScore,qualifier_answers:$json.qualifierAnswers,story_sections_read:$json.storySectionsRead,utm_source:$json.utmSource,is_return_visitor:$json.isReturnVisitor,device_type:$json.deviceType,language:$json.language}) }}',
            pos,
        )

    return {
        "name": "[MODULE 06] SignalMesh Alert Ontvanger",
        "nodes": [
            {
                "parameters": {"httpMethod": "POST", "path": "signalmesh-alert", "responseMode": "responseNode", "options": {}},
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1.1,
                "position": [250, 300],
            },
            {
                "parameters": {"respondWith": "json", "responseBody": '={"status":"received","tier":"{{ $json.tier }}"}', "options": {}},
                "name": "Respond",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [450, 200],
            },
            {
                "parameters": {
                    "rules": {"rules": [
                        {"conditions": {"conditions": [{"leftValue": "={{ $json.tier }}", "rightValue": "warm", "operator": {"type": "string", "operation": "equals"}}]}, "renameOutput": "WARM"},
                        {"conditions": {"conditions": [{"leftValue": "={{ $json.tier }}", "rightValue": "hot", "operator": {"type": "string", "operation": "equals"}}]}, "renameOutput": "HOT"},
                        {"conditions": {"conditions": [{"leftValue": "={{ $json.tier }}", "rightValue": "tier1", "operator": {"type": "string", "operation": "equals"}}]}, "renameOutput": "TIER1"},
                    ], "fallbackOutput": {}},
                    "options": {},
                },
                "name": "Switch Tier",
                "type": "n8n-nodes-base.switch",
                "typeVersion": 3,
                "position": [450, 400],
            },
            pb_save("PB WARM", [700, 200]),
            pb_save("PB HOT", [700, 400]),
            pb_save("PB TIER1", [700, 600]),
            slack_node("Slack HOT", "#hci-dealflow",
                '={{ JSON.stringify({text:"HOT Lead - "+$json.icpType+" ("+$json.sector+")",blocks:[{type:"section",text:{type:"mrkdwn",text:"*HOT Lead*\\n*ICP:* "+$json.icpType+" | *Sector:* "+$json.sector+" | *Tier:* "+$json.tier+"\\n*Fit:* "+$json.fitScore+"/100 | *Intent:* "+$json.intentScore+"/100 | *DealFlow:* "+$json.dealFlowScore+"/100\\n*Bron:* "+($json.utmSource||"direct")+"\\n*Qualifier:* "+JSON.stringify($json.qualifierAnswers||{})+"\\n*Storytelling:* "+($json.storySectionsRead||0)+"/5"}},{type:"actions",elements:[{type:"button",text:{type:"plain_text",text:"DealFlow"},url:"https://api.hes-consultancy-international.com/_/collections/signalmesh_leads"}]}]}) }}',
                [950, 400]),
            slack_node("Slack TIER1", "#hci-dealflow",
                '={{ JSON.stringify({text:"TIER 1 LEAD - DIRECT ACTIE",blocks:[{type:"section",text:{type:"mrkdwn",text:"*TIER 1 LEAD - DIRECT ACTIE*\\n*ICP:* "+$json.icpType+" | *Sector:* "+$json.sector+"\\n*DealFlow:* "+$json.dealFlowScore+"/100 | *Fit:* "+$json.fitScore+"/100 | *Intent:* "+$json.intentScore+"/100\\n*Bron:* "+($json.utmSource||"direct")+"\\nCalendly: https://calendly.com/mbhes1970/30min"}},{type:"actions",elements:[{type:"button",text:{type:"plain_text",text:"DealFlow"},url:"https://api.hes-consultancy-international.com/_/collections/signalmesh_leads"}]}]}) }}',
                [950, 600]),
        ],
        "connections": {
            "Webhook": {"main": [[{"node": "Respond", "type": "main", "index": 0}, {"node": "Switch Tier", "type": "main", "index": 0}]]},
            "Switch Tier": {"main": [
                [{"node": "PB WARM", "type": "main", "index": 0}],
                [{"node": "PB HOT", "type": "main", "index": 0}],
                [{"node": "PB TIER1", "type": "main", "index": 0}],
            ]},
            "PB HOT": {"main": [[{"node": "Slack HOT", "type": "main", "index": 0}]]},
            "PB TIER1": {"main": [[{"node": "Slack TIER1", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 02 — NCSC Advisories
# ═══════════════════════════════════════════════════════════
def build_module_02():
    return {
        "name": "[MODULE 02] NCSC Advisories Monitor",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 7}]}},
                "name": "Schedule 07:00",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": "https://advisories.ncsc.nl/rss/advisories",
                    "options": {"response": {"response": {"responseFormat": "text"}}},
                },
                "name": "Fetch RSS",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {"options": {}},
                "name": "XML to JSON",
                "type": "n8n-nodes-base.xml",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {
                    "fieldToSplitOut": "rss.channel.item",
                    "options": {},
                },
                "name": "Split Items",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [850, 300],
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {"id": "a1", "name": "titel", "value": "={{ $json.title }}", "type": "string"},
                            {"id": "a2", "name": "url", "value": "={{ $json.link }}", "type": "string"},
                            {"id": "a3", "name": "publicatie", "value": "={{ $json.pubDate }}", "type": "string"},
                            {"id": "a4", "name": "beschrijving", "value": "={{ ($json.description || '').substring(0, 500) }}", "type": "string"},
                        ],
                    },
                },
                "name": "Extract Fields",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [1050, 300],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/ncsc_alerts/records?filter=(advisory_url='{{{{$json.url}}}}')",
                    "options": {},
                },
                "name": "Check Duplicaat",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1250, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "equal", "value2": 0}],
                    },
                },
                "name": "Is Nieuw?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [1450, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://api.anthropic.com/v1/messages",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [
                        {"name": "x-api-key", "value": "={{ $env.ANTHROPIC_API_KEY }}"},
                        {"name": "anthropic-version", "value": "2023-06-01"},
                        {"name": "Content-Type", "value": "application/json"},
                    ]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:200,messages:[{role:"user",content:"Advisory titel: "+$node["Extract Fields"].json.titel+"\\nBeschrijving: "+$node["Extract Fields"].json.beschrijving+"\\nBepal urgentie en sector. urgentie: hoog (actief misbruik/kritiek), midden (patch beschikbaar), laag (informatief). sector: s01=Overheid,s02=Zorg,s03=Financieel,s04=Energie,s05=Onderwijs,s06=Software,s07=Logistiek,s08=Legal, of algemeen. Geef ALLEEN JSON: {\\\"urgentie\\\":\\\"...\\\",\\\"sector\\\":\\\"...\\\",\\\"reden\\\":\\\"kort\\\"}"}]}) }}',
                    "options": {},
                },
                "name": "Claude Classify",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1650, 200],
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {"id": "b1", "name": "parsed", "value": "={{ JSON.parse($json.content[0].text) }}", "type": "object"},
                        ],
                    },
                },
                "name": "Parse Claude",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [1850, 200],
            },
            pb_request(
                "Save to PB", "POST",
                "/api/collections/ncsc_alerts/records",
                '={{ JSON.stringify({titel:$node["Extract Fields"].json.titel,advisory_url:$node["Extract Fields"].json.url,publicatiedatum:$node["Extract Fields"].json.publicatie,urgentie:$json.parsed.urgentie||"laag",sector:$json.parsed.sector||"algemeen",linkedin_draft:"",gepubliceerd:false}) }}',
                [2050, 200],
            ),
            {
                "parameters": {
                    "rules": {"rules": [
                        {"conditions": {"conditions": [{"leftValue": "={{ $json.parsed.urgentie }}", "rightValue": "hoog", "operator": {"type": "string", "operation": "equals"}}]}, "renameOutput": "HOOG"},
                        {"conditions": {"conditions": [{"leftValue": "={{ $json.parsed.urgentie }}", "rightValue": "midden", "operator": {"type": "string", "operation": "equals"}}]}, "renameOutput": "MIDDEN"},
                    ], "fallbackOutput": {}},
                    "options": {},
                },
                "name": "Switch Urgentie",
                "type": "n8n-nodes-base.switch",
                "typeVersion": 3,
                "position": [2250, 200],
            },
            slack_node("Slack HOOG", "#hci-dealflow",
                '={{ JSON.stringify({text:"NCSC Advisory - HOOG: "+$node["Extract Fields"].json.titel,blocks:[{type:"section",text:{type:"mrkdwn",text:"*NCSC Advisory \\u2014 HOOG*\\n*"+$node["Extract Fields"].json.titel+"*\\nSector: "+($json.parsed.sector||"algemeen")+" | "+$node["Extract Fields"].json.publicatie+"\\n"+$node["Extract Fields"].json.beschrijving.substring(0,200)+"\\n"+$node["Extract Fields"].json.url}}]}) }}',
                [2500, 100]),
            slack_node("Slack MIDDEN", "#hci-systeem",
                '={{ JSON.stringify({text:"NCSC Advisory - "+$node["Extract Fields"].json.titel+" | "+$node["Extract Fields"].json.url}) }}',
                [2500, 300]),
        ],
        "connections": {
            "Schedule 07:00": {"main": [[{"node": "Fetch RSS", "type": "main", "index": 0}]]},
            "Fetch RSS": {"main": [[{"node": "XML to JSON", "type": "main", "index": 0}]]},
            "XML to JSON": {"main": [[{"node": "Split Items", "type": "main", "index": 0}]]},
            "Split Items": {"main": [[{"node": "Extract Fields", "type": "main", "index": 0}]]},
            "Extract Fields": {"main": [[{"node": "Check Duplicaat", "type": "main", "index": 0}]]},
            "Check Duplicaat": {"main": [[{"node": "Is Nieuw?", "type": "main", "index": 0}]]},
            "Is Nieuw?": {"main": [[{"node": "Claude Classify", "type": "main", "index": 0}], []]},
            "Claude Classify": {"main": [[{"node": "Parse Claude", "type": "main", "index": 0}]]},
            "Parse Claude": {"main": [[{"node": "Save to PB", "type": "main", "index": 0}]]},
            "Save to PB": {"main": [[{"node": "Switch Urgentie", "type": "main", "index": 0}]]},
            "Switch Urgentie": {"main": [
                [{"node": "Slack HOOG", "type": "main", "index": 0}],
                [{"node": "Slack MIDDEN", "type": "main", "index": 0}],
                [],
            ]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 03 — TED Europa Tenders
# ═══════════════════════════════════════════════════════════
def build_module_03():
    return {
        "name": "[MODULE 03] TED Europa Tenders",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 6, "triggerAtMinute": 30}]}},
                "name": "Schedule 06:30",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://ted.europa.eu/api/v3.0/notices/search",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [{"name": "Content-Type", "value": "application/json"}]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '{"query":"cybersecurity OR informatiebeveiliging OR NIS2 OR compliance OR cloud OR IT-diensten","scope":"ACTIVE","fields":["title","publicationDate","contractorName","estimatedValue","deadline","url","cpvCodes"],"paginationPage":1,"paginationSize":10,"reverseOrder":false,"sortField":"publicationDate","onlyLatestVersions":true}',
                    "options": {},
                },
                "name": "TED API",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {
                    "fieldToSplitOut": "notices",
                    "options": {},
                },
                "name": "Split Notices",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "string": [{"value1": "={{ $json.country }}", "operation": "regex", "value2": "NL|BE|DE"}],
                    },
                },
                "name": "NL/BE/DE Filter",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [850, 300],
            },
            pb_request(
                "Save TED", "POST",
                "/api/collections/ted_tenders/records",
                '={{ JSON.stringify({notice_id:$json.noticeId||"",titel:($json.title||"").substring(0,500),land:$json.country||"",cpv_code:($json.cpvCodes||[]).join(","),waarde:$json.estimatedValue||0,relevant:true,score:0,ted_url:$json.url||"",status:"nieuw"}) }}',
                [1050, 200],
            ),
            slack_node("Slack TED", "#hci-dealflow",
                '={{ JSON.stringify({text:"TED Tender - "+($json.country||"EU"),blocks:[{type:"section",text:{type:"mrkdwn",text:"*TED Tender \\u2014 "+($json.country||"EU")+"*\\n*"+($json.title||"Geen titel").substring(0,200)+"*\\nWaarde: "+($json.estimatedValue||"onbekend")+" | Deadline: "+($json.deadline||"onbekend")+"\\n"+($json.url||"")}}]}) }}',
                [1250, 200]),
        ],
        "connections": {
            "Schedule 06:30": {"main": [[{"node": "TED API", "type": "main", "index": 0}]]},
            "TED API": {"main": [[{"node": "Split Notices", "type": "main", "index": 0}]]},
            "Split Notices": {"main": [[{"node": "NL/BE/DE Filter", "type": "main", "index": 0}]]},
            "NL/BE/DE Filter": {"main": [[{"node": "Save TED", "type": "main", "index": 0}], []]},
            "Save TED": {"main": [[{"node": "Slack TED", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 04 — AP Handhaving
# NOTE: AP website (autoriteitpersoonsgegevens.nl) returns 503 on all requests.
# Using Google News RSS as proxy — indexes AP content reliably.
# ═══════════════════════════════════════════════════════════
def build_module_04():
    google_news_url = (
        "https://news.google.com/rss/search?"
        "q=site:autoriteitpersoonsgegevens.nl+boete+OR+handhaving+OR+onderzoek+OR+besluit"
        "&hl=nl&gl=NL&ceid=NL:nl"
    )
    return {
        "name": "[MODULE 04] AP Handhaving Monitor",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 7, "triggerAtMinute": 30}]}},
                "name": "Schedule 07:30",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": google_news_url,
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [
                        {"name": "User-Agent", "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"},
                    ]},
                    "options": {"response": {"response": {"responseFormat": "text"}}},
                },
                "name": "Google News RSS",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {"options": {}},
                "name": "XML to JSON",
                "type": "n8n-nodes-base.xml",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {"fieldToSplitOut": "rss.channel.item", "options": {}},
                "name": "Split Items",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [850, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "string": [{"value1": "={{ ($json.title || '').toLowerCase() }}", "operation": "regex", "value2": "boete|besluit|onderzoek|handhaving|overtreding|sanctie|cookie|privacy|avg|gdpr"}],
                    },
                },
                "name": "AP Relevant?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [1050, 300],
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {"id": "t1", "name": "titel", "value": "={{ ($json.title || '').replace(' - Autoriteit Persoonsgegevens', '') }}", "type": "string"},
                            {"id": "t2", "name": "google_url", "value": "={{ $json.link }}", "type": "string"},
                            {"id": "t3", "name": "publicatie", "value": "={{ $json.pubDate }}", "type": "string"},
                            {"id": "t4", "name": "beschrijving", "value": "={{ ($json.description || '').replace(/<[^>]*>/g, '').substring(0, 500) }}", "type": "string"},
                        ],
                    },
                },
                "name": "Extract Fields",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [1250, 200],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/ap_handhaving/records?filter=(titel='{{{{encodeURIComponent($json.titel)}}}}')&perPage=1",
                    "options": {},
                },
                "name": "Check Duplicaat",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1450, 200],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "equal", "value2": 0}],
                    },
                },
                "name": "Is Nieuw?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [1650, 200],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://api.anthropic.com/v1/messages",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [
                        {"name": "x-api-key", "value": "={{ $env.ANTHROPIC_API_KEY }}"},
                        {"name": "anthropic-version", "value": "2023-06-01"},
                        {"name": "Content-Type", "value": "application/json"},
                    ]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:200,messages:[{role:"user",content:"AP bericht titel: "+$node["Extract Fields"].json.titel+"\\nBeschrijving: "+$node["Extract Fields"].json.beschrijving+"\\nExtraheer als JSON: {\\\"boete_bedrag\\\":\\\"bedrag of null\\\",\\\"organisatie\\\":\\\"naam of null\\\",\\\"overtreding\\\":\\\"korte omschrijving\\\",\\\"sector\\\":\\\"s01=Overheid,s02=Zorg,s03=Financieel,s04=Energie,s05=Onderwijs,s06=Software,s07=Logistiek,s08=Legal of algemeen\\\",\\\"urgentie\\\":\\\"hoog/midden/laag\\\"}\\nALLEEN JSON."}]}) }}',
                    "options": {},
                },
                "name": "Claude Extract",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1850, 100],
            },
            {
                "parameters": {
                    "assignments": {"assignments": [
                        {"id": "p1", "name": "parsed", "value": "={{ JSON.parse($json.content[0].text) }}", "type": "object"},
                    ]},
                },
                "name": "Parse Claude",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [2050, 100],
            },
            pb_request(
                "Save to PB", "POST",
                "/api/collections/ap_handhaving/records",
                '={{ JSON.stringify({titel:$node["Extract Fields"].json.titel,type:$json.parsed.urgentie==="hoog"?"boete":"handhaving",bedrag:parseInt($json.parsed.boete_bedrag)||0,sector:$json.parsed.sector||"algemeen",organisatie_type:$json.parsed.organisatie||"",overtreding_kort:$json.parsed.overtreding||"",ap_url:$node["Extract Fields"].json.google_url,publicatiedatum:$node["Extract Fields"].json.publicatie}) }}',
                [2250, 100],
            ),
            slack_node("Slack AP", "#hci-dealflow",
                '={{ JSON.stringify({text:"AP Handhaving: "+$node["Extract Fields"].json.titel,blocks:[{type:"section",text:{type:"mrkdwn",text:"*AP Handhaving \\u2014 "+($json.parsed.urgentie||"").toUpperCase()+"*\\n*"+$node["Extract Fields"].json.titel+"*\\nOrganisatie: "+($json.parsed.organisatie||"onbekend")+" | Boete: "+($json.parsed.boete_bedrag||"nvt")+"\\nOvertreding: "+($json.parsed.overtreding||"")+"\\nSector: "+($json.parsed.sector||"algemeen")+"\\nBron: Google News (AP site 503)"}}]}) }}',
                [2450, 100]),
            # Campaign trigger for non-low urgency
            {
                "parameters": {
                    "conditions": {
                        "string": [{"value1": "={{ $json.parsed.urgentie }}", "operation": "notEqual", "value2": "laag"}],
                    },
                },
                "name": "Trigger Campaign?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [2450, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://n8n.hes-consultancy-international.com/webhook/campaign-trigger",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [{"name": "Content-Type", "value": "application/json"}]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({bron:"ap",titel:$node["Extract Fields"].json.titel,sector:$json.parsed.sector,urgentie:$json.parsed.urgentie,samenvatting:"AP "+($json.parsed.boete_bedrag?"boete "+$json.parsed.boete_bedrag+" voor ":"")+($json.parsed.organisatie||"")+": "+($json.parsed.overtreding||""),bron_url:$node["Extract Fields"].json.google_url}) }}',
                    "options": {},
                },
                "name": "Trigger 11A",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [2650, 250],
            },
        ],
        "connections": {
            "Schedule 07:30": {"main": [[{"node": "Google News RSS", "type": "main", "index": 0}]]},
            "Google News RSS": {"main": [[{"node": "XML to JSON", "type": "main", "index": 0}]]},
            "XML to JSON": {"main": [[{"node": "Split Items", "type": "main", "index": 0}]]},
            "Split Items": {"main": [[{"node": "AP Relevant?", "type": "main", "index": 0}]]},
            "AP Relevant?": {"main": [[{"node": "Extract Fields", "type": "main", "index": 0}], []]},
            "Extract Fields": {"main": [[{"node": "Check Duplicaat", "type": "main", "index": 0}]]},
            "Check Duplicaat": {"main": [[{"node": "Is Nieuw?", "type": "main", "index": 0}]]},
            "Is Nieuw?": {"main": [[{"node": "Claude Extract", "type": "main", "index": 0}], []]},
            "Claude Extract": {"main": [[{"node": "Parse Claude", "type": "main", "index": 0}]]},
            "Parse Claude": {"main": [[{"node": "Save to PB", "type": "main", "index": 0}]]},
            "Save to PB": {"main": [[{"node": "Slack AP", "type": "main", "index": 0}, {"node": "Trigger Campaign?", "type": "main", "index": 0}]]},
            "Trigger Campaign?": {"main": [[{"node": "Trigger 11A", "type": "main", "index": 0}], []]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 05 — DealFlow Follow-up
# ═══════════════════════════════════════════════════════════
def build_module_05():
    return {
        "name": "[MODULE 05] DealFlow Follow-up Reminder",
        "nodes": [
            {
                "parameters": {
                    "rule": {"interval": [{"triggerAtHour": 8, "triggerAtDay": [1, 2, 3, 4, 5]}]},
                },
                "name": "Schedule Werkdagen 08:00",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/deals/records?filter=(status='new'||status='contacted'||status='qualified')&&follow_up_geblokkeerd=false&sort=-overall_score&perPage=10",
                    "options": {},
                },
                "name": "Fetch Deals",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "largerEqual", "value2": 1}],
                    },
                },
                "name": "Has Deals?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {"fieldToSplitOut": "items", "options": {}},
                "name": "Split Deals",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [850, 200],
            },
            {
                "parameters": {
                    "aggregate": "aggregateAllItemData",
                    "options": {},
                },
                "name": "Merge All",
                "type": "n8n-nodes-base.aggregate",
                "typeVersion": 1,
                "position": [1050, 200],
            },
            slack_node("Slack Follow-up", "#hci-dealflow",
                '={{ JSON.stringify({text:"Follow-up overzicht \\u2014 "+new Date().toLocaleDateString("nl-NL"),blocks:[{type:"section",text:{type:"mrkdwn",text:"*Follow-up overzicht \\u2014 "+new Date().toLocaleDateString("nl-NL")+"*\\n"+$json.data.slice(0,10).map((d,i)=>"*"+(i+1)+". "+d.company+"* | Score: "+d.overall_score+" | Status: "+d.status).join("\\n")}}]}) }}',
                [1250, 200]),
        ],
        "connections": {
            "Schedule Werkdagen 08:00": {"main": [[{"node": "Fetch Deals", "type": "main", "index": 0}]]},
            "Fetch Deals": {"main": [[{"node": "Has Deals?", "type": "main", "index": 0}]]},
            "Has Deals?": {"main": [[{"node": "Split Deals", "type": "main", "index": 0}], []]},
            "Split Deals": {"main": [[{"node": "Merge All", "type": "main", "index": 0}]]},
            "Merge All": {"main": [[{"node": "Slack Follow-up", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 07 — LinkedIn Content Machine
# ═══════════════════════════════════════════════════════════
def build_module_07():
    return {
        "name": "[MODULE 07] LinkedIn Content Machine",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 9, "triggerAtDay": 1}]}},
                "name": "Schedule Maandag 09:00",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/ncsc_alerts/records?filter=(urgentie='hoog'||urgentie='midden')&sort=-created&perPage=5",
                    "options": {},
                },
                "name": "NCSC Recent",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 200],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/ap_handhaving/records?sort=-created&perPage=5",
                    "options": {},
                },
                "name": "AP Recent",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 400],
            },
            {
                "parameters": {
                    "mode": "combine",
                    "combineBy": "combineAll",
                    "options": {},
                },
                "name": "Merge Data",
                "type": "n8n-nodes-base.merge",
                "typeVersion": 3,
                "position": [700, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://api.anthropic.com/v1/messages",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [
                        {"name": "x-api-key", "value": "={{ $env.ANTHROPIC_API_KEY }}"},
                        {"name": "anthropic-version", "value": "2023-06-01"},
                        {"name": "Content-Type", "value": "application/json"},
                    ]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:"Je schrijft LinkedIn posts namens Mike Hesselink van HES Consultancy International. From Strategy to First Customer. 30+ jaar EU ICT expertise. Toon: gezaghebbend, direct, geen buzzwords, geen emojis, geen zelfpromotie. Taal: Nederlands.",messages:[{role:"user",content:"Nieuws van afgelopen week:\\nNCSC: "+JSON.stringify(($input.first().json.items||[]).map(i=>i.titel).slice(0,3))+"\\nAP: "+JSON.stringify(($input.last().json.items||[]).map(i=>i.titel).slice(0,3))+"\\nSchrijf een LinkedIn post van 200-250 woorden. Open met concrete observatie. Benoem patroon/trend. Eindig met vraag. Max 2 hashtags. Geen emojis. Output: JSON {\\\"post\\\":\\\"...\\\",\\\"hashtags\\\":[\\\"...\\\",\\\"...\\\"]}"}]}) }}',
                    "options": {},
                },
                "name": "Claude Write Post",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [950, 300],
            },
            {
                "parameters": {
                    "assignments": {"assignments": [
                        {"id": "lp1", "name": "parsed", "value": "={{ JSON.parse($json.content[0].text) }}", "type": "object"},
                    ]},
                },
                "name": "Parse Post",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [1150, 300],
            },
            pb_request(
                "Save LinkedIn", "POST",
                "/api/collections/linkedin_posts/records",
                '={{ JSON.stringify({post_tekst:$json.parsed.post,thema:($json.parsed.hashtags||[]).join(" "),doelgroep:"IT-beslissers",bron_type:"auto",status:"draft"}) }}',
                [1350, 300],
            ),
            slack_node("Slack Post", "#hci-dealflow",
                '={{ JSON.stringify({text:"LinkedIn post klaar",blocks:[{type:"section",text:{type:"mrkdwn",text:"*LinkedIn post klaar \\u2014 week "+Math.ceil((new Date()-new Date(new Date().getFullYear(),0,1))/604800000)+"*\\n\\n"+$json.parsed.post+"\\n\\nHashtags: "+($json.parsed.hashtags||[]).join(" ")+"\\n_Kopieer en publiceer handmatig op LinkedIn_"}}]}) }}',
                [1550, 300]),
        ],
        "connections": {
            "Schedule Maandag 09:00": {"main": [[{"node": "NCSC Recent", "type": "main", "index": 0}, {"node": "AP Recent", "type": "main", "index": 0}]]},
            "NCSC Recent": {"main": [[{"node": "Merge Data", "type": "main", "index": 0}]]},
            "AP Recent": {"main": [[{"node": "Merge Data", "type": "main", "index": 1}]]},
            "Merge Data": {"main": [[{"node": "Claude Write Post", "type": "main", "index": 0}]]},
            "Claude Write Post": {"main": [[{"node": "Parse Post", "type": "main", "index": 0}]]},
            "Parse Post": {"main": [[{"node": "Save LinkedIn", "type": "main", "index": 0}]]},
            "Save LinkedIn": {"main": [[{"node": "Slack Post", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 08 — KVK Enrichment
# ═══════════════════════════════════════════════════════════
def build_module_08():
    return {
        "name": "[MODULE 08] KVK Enrichment",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 2}]}},
                "name": "Schedule 02:00",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/contacts/records?filter=(kvk_verrijkt=false||kvk_verrijkt=null)&sort=-created&perPage=50",
                    "options": {},
                },
                "name": "Fetch Contacts",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "largerEqual", "value2": 1}],
                    },
                },
                "name": "Has Contacts?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {"fieldToSplitOut": "items", "options": {}},
                "name": "Split Contacts",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [850, 200],
            },
            {
                "parameters": {
                    "url": "=https://openkvk.nl/api/?q={{ encodeURIComponent($json.org_name || $json.company || '') }}&format=json",
                    "options": {"timeout": 10000},
                },
                "name": "KVK Lookup",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1050, 200],
            },
            {
                "parameters": {
                    "method": "PATCH",
                    "url": f"={PB_LOCAL}/api/collections/contacts/records/{{{{$node[\"Split Contacts\"].json.id}}}}",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [{"name": "Content-Type", "value": "application/json"}]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({kvk_verrijkt:true,kvk_nummer:($json[0]?.kvk_nummer||""),sbi_code:($json[0]?.sbi_code||"")}) }}',
                    "options": {},
                },
                "name": "Update Contact",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1250, 200],
            },
            {
                "parameters": {"amount": 1},
                "name": "Wait 1s",
                "type": "n8n-nodes-base.wait",
                "typeVersion": 1.1,
                "position": [1450, 200],
            },
            slack_node("Slack Done", "#hci-systeem",
                '={{ JSON.stringify({text:"KVK Enrichment klaar \\u2014 contacten verrijkt"}) }}',
                [1050, 400]),
        ],
        "connections": {
            "Schedule 02:00": {"main": [[{"node": "Fetch Contacts", "type": "main", "index": 0}]]},
            "Fetch Contacts": {"main": [[{"node": "Has Contacts?", "type": "main", "index": 0}]]},
            "Has Contacts?": {"main": [[{"node": "Split Contacts", "type": "main", "index": 0}], []]},
            "Split Contacts": {"main": [[{"node": "KVK Lookup", "type": "main", "index": 0}]]},
            "KVK Lookup": {"main": [[{"node": "Update Contact", "type": "main", "index": 0}]]},
            "Update Contact": {"main": [[{"node": "Wait 1s", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 11A — Campaign Builder Auto
# ═══════════════════════════════════════════════════════════
def build_module_11a():
    return {
        "name": "[MODULE 11A] Campaign Builder — Auto",
        "nodes": [
            {
                "parameters": {"httpMethod": "POST", "path": "campaign-trigger", "responseMode": "responseNode", "options": {}},
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1.1,
                "position": [250, 300],
            },
            {
                "parameters": {"respondWith": "json", "responseBody": '={"status":"received"}', "options": {}},
                "name": "Respond",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [450, 150],
            },
            {
                "parameters": {
                    "conditions": {
                        "string": [{"value1": "={{ $json.urgentie }}", "operation": "notEqual", "value2": "laag"}],
                    },
                },
                "name": "Urgentie Check",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [450, 350],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/contacts/records?filter=(sector~'{{{{$json.sector}}}}')&sort=-created&perPage=20",
                    "options": {},
                },
                "name": "Fetch Doelgroep",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [700, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "largerEqual", "value2": 1}],
                    },
                },
                "name": "Has Contacts?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [900, 300],
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://api.anthropic.com/v1/messages",
                    "sendHeaders": True,
                    "headerParameters": {"parameters": [
                        {"name": "x-api-key", "value": "={{ $env.ANTHROPIC_API_KEY }}"},
                        {"name": "anthropic-version", "value": "2023-06-01"},
                        {"name": "Content-Type", "value": "application/json"},
                    ]},
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": '={{ JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:500,system:"Je schrijft campagne-content namens Mike Hesselink van HES Consultancy International. From Strategy to First Customer. 30+ jaar EU ICT expertise. Direct, gezaghebbend, geen buzzwords, geen emojis. Schrijf altijd in het Nederlands.",messages:[{role:"user",content:"TRIGGER: Bron: "+$node.Webhook.json.bron+" | "+$node.Webhook.json.titel+" | "+$node.Webhook.json.samenvatting+" | Sector: "+$node.Webhook.json.sector+"\\nDoelgroep: "+$json.totalItems+" contacten\\nJSON output: {\\\"linkedin_post\\\":\\\"150-200 woorden\\\",\\\"email_subject\\\":\\\"max 8 woorden\\\",\\\"email_body\\\":\\\"max 150 woorden, plain-text, verwijs naar nieuws. Sluit: Mike Hesselink | HES Consultancy International | mbhes@hes-consultancy-international.com\\\"}\\nALLEEN JSON."}]}) }}',
                    "options": {},
                },
                "name": "Claude Campaign",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1100, 250],
            },
            {
                "parameters": {
                    "assignments": {"assignments": [
                        {"id": "cp1", "name": "campaign", "value": "={{ JSON.parse($json.content[0].text) }}", "type": "object"},
                    ]},
                },
                "name": "Parse Campaign",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [1300, 250],
            },
            pb_request(
                "Save Campaign", "POST",
                "/api/collections/campaigns/records",
                '={{ JSON.stringify({onderwerp:$node.Webhook.json.titel,sector:$node.Webhook.json.sector,trigger_bron:$node.Webhook.json.bron,linkedin_draft:$json.campaign.linkedin_post,email_subject:$json.campaign.email_subject,email_body:$json.campaign.email_body,doelgroep_ids:($node["Fetch Doelgroep"].json.items||[]).map(c=>c.id),doelgroep_namen:($node["Fetch Doelgroep"].json.items||[]).map(c=>c.name||c.org_name||"").slice(0,5),status:"draft",aangemaakt_op:new Date().toISOString()}) }}',
                [1500, 250],
            ),
            slack_node("Slack Approval", "#hci-dealflow",
                '={{ JSON.stringify({text:"Campagne klaar voor goedkeuring",blocks:[{type:"section",text:{type:"mrkdwn",text:"*Campagne klaar voor goedkeuring*\\nOnderwerp: "+$node.Webhook.json.titel+" | Sector: "+$node.Webhook.json.sector+"\\nDoelgroep: "+$node["Fetch Doelgroep"].json.totalItems+" contacten\\n\\n*LINKEDIN DRAFT:*\\n"+$json.campaign.linkedin_post+"\\n\\n*EMAIL \\u2014 "+$json.campaign.email_subject+"*\\n"+$json.campaign.email_body.substring(0,300)+"\\n\\nCampaign ID: "+$node["Save Campaign"].json.id+"\\n\\u2705 `ja "+$node["Save Campaign"].json.id+"` om te versturen\\n\\u274c `nee "+$node["Save Campaign"].json.id+"` om te annuleren"}}]}) }}',
                [1700, 250]),
        ],
        "connections": {
            "Webhook": {"main": [[{"node": "Respond", "type": "main", "index": 0}, {"node": "Urgentie Check", "type": "main", "index": 0}]]},
            "Urgentie Check": {"main": [[{"node": "Fetch Doelgroep", "type": "main", "index": 0}], []]},
            "Fetch Doelgroep": {"main": [[{"node": "Has Contacts?", "type": "main", "index": 0}]]},
            "Has Contacts?": {"main": [[{"node": "Claude Campaign", "type": "main", "index": 0}], []]},
            "Claude Campaign": {"main": [[{"node": "Parse Campaign", "type": "main", "index": 0}]]},
            "Parse Campaign": {"main": [[{"node": "Save Campaign", "type": "main", "index": 0}]]},
            "Save Campaign": {"main": [[{"node": "Slack Approval", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW: Module 11D — Campaign Cleanup
# ═══════════════════════════════════════════════════════════
def build_module_11d():
    return {
        "name": "[MODULE 11D] Campaign Cleanup",
        "nodes": [
            {
                "parameters": {"rule": {"interval": [{"triggerAtHour": 3, "triggerAtDay": 0}]}},
                "name": "Schedule Zondag 03:00",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1.2,
                "position": [250, 300],
            },
            {
                "parameters": {
                    "url": f"={PB_LOCAL}/api/collections/campaigns/records?filter=(status='verlopen'||status='afgewezen')&perPage=100",
                    "options": {},
                },
                "name": "Fetch Expired",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [450, 300],
            },
            {
                "parameters": {
                    "conditions": {
                        "number": [{"value1": "={{ $json.totalItems }}", "operation": "largerEqual", "value2": 1}],
                    },
                },
                "name": "Has Expired?",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [650, 300],
            },
            {
                "parameters": {"fieldToSplitOut": "items", "options": {}},
                "name": "Split Items",
                "type": "n8n-nodes-base.splitOut",
                "typeVersion": 1,
                "position": [850, 200],
            },
            {
                "parameters": {
                    "method": "DELETE",
                    "url": f"={PB_LOCAL}/api/collections/campaigns/records/{{{{$json.id}}}}",
                    "options": {},
                },
                "name": "Delete Record",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1050, 200],
            },
            slack_node("Slack Cleanup", "#hci-systeem",
                '={{ JSON.stringify({text:"Cleanup: "+$node["Fetch Expired"].json.totalItems+" verlopen campagnes verwijderd."}) }}',
                [850, 400]),
        ],
        "connections": {
            "Schedule Zondag 03:00": {"main": [[{"node": "Fetch Expired", "type": "main", "index": 0}]]},
            "Fetch Expired": {"main": [[{"node": "Has Expired?", "type": "main", "index": 0}]]},
            "Has Expired?": {"main": [[{"node": "Split Items", "type": "main", "index": 0}], [{"node": "Slack Cleanup", "type": "main", "index": 0}]]},
            "Split Items": {"main": [[{"node": "Delete Record", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1"},
    }


# ═══════════════════════════════════════════════════════════
# MAIN — Build all workflows
# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":
    workflows = [
        # Disk Check uses server cron — see scripts/server/setup-pruning.sh
        ("Module 06", build_module_06),
        ("Module 02", build_module_02),
        ("Module 03", build_module_03),
        ("Module 04", build_module_04),
        ("Module 05", build_module_05),
        ("Module 07", build_module_07),
        ("Module 08", build_module_08),
        ("Module 11A", build_module_11a),
        ("Module 11D", build_module_11d),
    ]

    print("=" * 60)
    print("HCI n8n Workflow Builder")
    print("=" * 60)

    results = {}
    for name, builder in workflows:
        print(f"\n[{name}]")
        payload = builder()
        result = create_workflow(payload)
        results[name] = result
        time.sleep(1)  # Rate limiting

    print("\n" + "=" * 60)
    print("SAMENVATTING")
    print("=" * 60)
    for name, result in results.items():
        if result:
            print(f"  {name:20s} ID: {result['id']}")
        else:
            print(f"  {name:20s} FOUT")

    print("\nAlle workflows zijn INACTIEF.")
    print("Activeer ze handmatig in de n8n UI: toggle rechts-boven per workflow.")
