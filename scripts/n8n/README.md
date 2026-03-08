# n8n Workflow Configuration

## Environment Variables Required

Before importing these workflows into n8n, configure the following
values as n8n credentials or environment variables:

| Placeholder          | Description                              |
|----------------------|------------------------------------------|
| `{{PB_ADMIN_EMAIL}}` | PocketBase admin email address           |
| `{{PB_ADMIN_PASSWORD}}` | PocketBase admin password             |
| `{{SLACK_WEBHOOK_URL}}` | Slack incoming webhook URL for alerts |

Replace all `{{...}}` placeholders in the workflow JSON files with
actual values via n8n's credential system or environment variables.
Do NOT commit real credentials to this repository.
