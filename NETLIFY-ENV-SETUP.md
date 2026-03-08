# Netlify Environment Variables — hci-platform

In te stellen via: **Netlify Dashboard > Site > Settings > Environment Variables**

## Vereist

| Variable | Beschrijving | Voorbeeld |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | Anthropic API key voor Claude proxy | `sk-ant-...` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook voor SignalMesh alerts | `https://hooks.slack.com/services/...` |

## Optioneel

| Variable | Beschrijving | Voorbeeld |
|----------|-------------|-----------|
| `IPINFO_TOKEN` | IP intelligence (gratis: ipinfo.io/signup) | `abc123...` |
| `POCKETBASE_URL` | PocketBase instance URL | `https://api.hes-consultancy-international.com` |
| `PB_ADMIN_EMAIL` | PocketBase admin email | `mbhes@hes-consultancy-international.com` |
| `PB_ADMIN_PASSWORD` | PocketBase admin wachtwoord | *zie wachtwoord manager* |
| `PLAUSIBLE_DOMAIN` | Plausible analytics domein | `hes-consultancy.nl` |

## Stappen

1. Ga naar [Netlify Dashboard](https://app.netlify.com)
2. Open de hci-platform site
3. Settings > Environment Variables
4. Voeg bovenstaande variabelen toe
5. Trigger een nieuwe deploy (Deploys > Trigger deploy)

**Let op:** Commit NOOIT echte API keys of wachtwoorden naar git.
