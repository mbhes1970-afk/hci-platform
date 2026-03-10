#!/bin/bash
set -e

echo "=== Deploying 6 pages to root@46.225.61.78 ==="

# Create directories
ssh root@46.225.61.78 "mkdir -p /var/www/hes-consultancy-nl/icp/software-vendor /var/www/hes-consultancy-nl/icp/healthcare /var/www/hes-consultancy-nl/icp/government /var/www/hes-consultancy-nl/about /var/www/hes-consultancy-nl/services/assessment"

# Deploy via SCP
echo "=== Uploading homepage ==="
scp index.html root@46.225.61.78:/var/www/hes-consultancy-nl/index.html

echo "=== Uploading software-vendor ==="
scp icp/software-vendor/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/software-vendor/index.html

echo "=== Uploading healthcare ==="
scp icp/healthcare/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/healthcare/index.html

echo "=== Uploading government ==="
scp icp/government/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/government/index.html

echo "=== Uploading about ==="
scp about/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/about/index.html

echo "=== Uploading EU Readiness Scan ==="
scp services/assessment/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/services/assessment/index.html

# Verify
echo "=== Verifying ==="
echo "Homepage:        $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/)"
echo "Software Vendor: $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/software-vendor/)"
echo "Healthcare:      $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/healthcare/)"
echo "Government:      $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/government/)"
echo "About:           $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/about/)"
echo "EU Scan:         $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/services/assessment/)"
echo "=== DONE ==="
