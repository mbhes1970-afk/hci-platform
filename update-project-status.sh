#!/bin/bash
# Gebruik: ./update-project-status.sh
# Kopieert project-status.json + .html naar de server
set -e

SERVER=root@46.225.61.78
WEBROOT=/var/www/hes-consultancy-nl

echo "→ Uploading project status files..."
scp project-status.json "$SERVER:$WEBROOT/"
scp project-status.html "$SERVER:$WEBROOT/"
echo "✓ Project status bijgewerkt op server"
