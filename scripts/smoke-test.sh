#!/usr/bin/env bash
# Usage: scripts/smoke-test.sh <base url>, for example http://127.0.0.1:4330
# Health, the app shell, one recipe and the submit page (the router's fallback serves the shell).
set -euo pipefail
base="${1:?base url required}"
fetch() { curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-all-errors "$@"; }

fetch "$base/api/health" > /dev/null
fetch "$base/" | grep --quiet '<div id="app">'
fetch "$base/submit" | grep --quiet '<div id="app">'
slug=$(fetch "$base/api/recipes?pageSize=1" | jq --exit-status --raw-output '.items[0].slug')
fetch "$base/api/recipes/$slug" | jq --exit-status '.languages.en.title' > /dev/null
echo "smoke test passed: $base"
