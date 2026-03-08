#!/bin/bash
set -e

echo "=== Deploying 4 pages to root@46.225.61.78 ==="

# Create directories
ssh root@46.225.61.78 "mkdir -p /var/www/hes-consultancy-nl/icp/software-vendor /var/www/hes-consultancy-nl/icp/healthcare /var/www/hes-consultancy-nl/icp/government /var/www/hes-consultancy-nl/about"

# Deploy via SCP (simpler than heredoc for large files)
echo "=== Uploading software-vendor ==="
scp icp/software-vendor/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/software-vendor/index.html

echo "=== Uploading healthcare ==="
scp icp/healthcare/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/healthcare/index.html

echo "=== Uploading government ==="
scp icp/government/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/icp/government/index.html

echo "=== Uploading about ==="
scp about/index.html root@46.225.61.78:/var/www/hes-consultancy-nl/about/index.html

# Verify
echo "=== Verifying ==="
echo "Software Vendor: $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/software-vendor/)"
echo "Healthcare:      $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/healthcare/)"
echo "Government:      $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/icp/government/)"
echo "About:           $(curl -s -o /dev/null -w '%{http_code}' https://hes-consultancy.nl/about/)"
echo "=== DONE ==="
