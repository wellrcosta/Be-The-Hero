#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-admin@example.com}"
PASSWORD="${PASSWORD:-admin123}"

log() { printf "[smoke] %s\n" "$*"; }

log "Health"
curl -fsS "$API_URL/health" >/dev/null

log "Login"
TOKEN=$(
  curl -fsS -X POST "$API_URL/auth/login" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).access_token"
)

log "Me"
curl -fsS "$API_URL/me" -H "authorization: Bearer $TOKEN" \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!d.email) process.exit(1);" \
  >/dev/null

log "Create organization"
ORG_ID=$(
  curl -fsS -X POST "$API_URL/organizations" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $TOKEN" \
    -d '{"name":"Smoke Org","email":"smoke@org.com"}' \
  | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).id"
)

log "Create case"
CASE_ID=$(
  curl -fsS -X POST "$API_URL/cases" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $TOKEN" \
    -d "{\"title\":\"Smoke Case\",\"description\":\"Help\",\"value\":\"10.50\",\"organizationId\":\"$ORG_ID\"}" \
  | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).id"
)

log "List cases"
curl -fsS "$API_URL/cases?skip=0&take=10" -H "authorization: Bearer $TOKEN" \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!Array.isArray(d.items)) process.exit(1);" \
  >/dev/null

log "Close + reopen"
curl -fsS -X PATCH "$API_URL/cases/$CASE_ID/status" \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $TOKEN" \
  -d '{"status":"CLOSED"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(d.status!=='CLOSED') process.exit(1);" \
  >/dev/null

curl -fsS -X PATCH "$API_URL/cases/$CASE_ID/status" \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $TOKEN" \
  -d '{"status":"OPEN"}' \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(d.status!=='OPEN') process.exit(1);" \
  >/dev/null

log "Delete case + organization"
curl -fsS -X DELETE "$API_URL/cases/$CASE_ID" -H "authorization: Bearer $TOKEN" >/dev/null
curl -fsS -X DELETE "$API_URL/organizations/$ORG_ID" -H "authorization: Bearer $TOKEN" >/dev/null

log "OK"
