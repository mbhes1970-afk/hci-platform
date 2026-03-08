#!/usr/bin/env python3
"""
HCI Slack Proxy — lightweight HTTP handler for Caddy reverse_proxy
Listens on 127.0.0.1:8765, forwards structured alerts to Slack webhook.

Deploy: /opt/hci-slack-proxy/proxy.py
Service: /etc/systemd/system/hci-slack-proxy.service
"""

import json
import sys
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler

SLACK_WEBHOOK = "https://hooks.slack.com/services/T0AKAFST1B6/B0AKKRRJGDP/fiqGxhsMEhfZEIrHxCF1qW"
BIND_HOST = "127.0.0.1"
BIND_PORT = 8765


class SlackProxyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
        except Exception:
            self._respond(400, {"error": "invalid json"})
            return

        tier = body.get("tier", "unknown")
        score = body.get("score", 0)
        icp = body.get("icp", "onbekend")
        org = body.get("org", "onbekend")
        page = body.get("page", self.headers.get("Referer", "?"))

        emoji = "\U0001f525" if tier == "tier1" else "\U0001f3af"
        msg = {
            "text": f"{emoji} *HCI Lead Alert \u2014 {tier.upper()}*",
            "blocks": [
                {"type": "header", "text": {"type": "plain_text", "text": f"{emoji} Lead Alert \u2014 {tier.upper()}"}},
                {"type": "section", "fields": [
                    {"type": "mrkdwn", "text": f"*Score:* {score}"},
                    {"type": "mrkdwn", "text": f"*ICP:* {icp}"},
                    {"type": "mrkdwn", "text": f"*Org:* {org}"},
                    {"type": "mrkdwn", "text": f"*Pagina:* {page}"},
                ]},
                {"type": "actions", "elements": [
                    {"type": "button", "text": {"type": "plain_text", "text": "Open DealFlow"},
                     "url": "https://api.hes-consultancy-international.com/_/#/collections/deals"}
                ]}
            ]
        }

        try:
            req = urllib.request.Request(
                SLACK_WEBHOOK,
                data=json.dumps(msg).encode(),
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=10)
            self._respond(200, {"ok": True})
        except Exception as e:
            self._respond(502, {"error": str(e)})

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")

    def log_message(self, fmt, *args):
        pass  # silent


def main():
    server = HTTPServer((BIND_HOST, BIND_PORT), SlackProxyHandler)
    print(f"HCI Slack proxy listening on {BIND_HOST}:{BIND_PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
