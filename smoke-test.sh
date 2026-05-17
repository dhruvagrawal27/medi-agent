#!/usr/bin/env bash
# ClinicalCopilot smoke test - validates the running API end-to-end

set +e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3001}"
BASE_URL="http://localhost:${PORT}"

PASS=0
FAIL=0
declare -a FAILED_CHECKS=()

check() {
    local name="$1"
    local status="$2"
    if [ "$status" = "pass" ]; then
        echo "  [PASS] $name"
        PASS=$((PASS + 1))
    else
        echo "  [FAIL] $name"
        FAIL=$((FAIL + 1))
        FAILED_CHECKS+=("$name")
    fi
}

echo ""
echo "==============================================="
echo "  ClinicalCopilot - Smoke Test"
echo "==============================================="
echo ""

# Start server in background
echo "[*] Starting backend server..."
cd backend
npm run dev > /tmp/clinicalcopilot-server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for health endpoint
echo "[*] Waiting for server (PID $SERVER_PID)..."
for i in {1..30}; do
    if curl -s -f "${BASE_URL}/api/health" > /dev/null 2>&1; then
        echo "    Server is up."
        break
    fi
    sleep 1
done

# Test 1: Health
RESP=$(curl -s "${BASE_URL}/api/health")
if echo "$RESP" | grep -q '"status":"ok"'; then check "GET /api/health" pass; else check "GET /api/health" fail; fi

# Test 2: Patients list
RESP=$(curl -s "${BASE_URL}/api/patients")
PATIENT_COUNT=$(echo "$RESP" | grep -o '"id":"P00[0-9]"' | wc -l | tr -d ' ')
if [ "$PATIENT_COUNT" -eq 5 ]; then check "GET /api/patients returns 5 patients" pass; else check "GET /api/patients returns 5 patients (got $PATIENT_COUNT)" fail; fi

# Test 3: Analyze P001
RESP=$(curl -s -X POST "${BASE_URL}/api/analyze" -H "Content-Type: application/json" -d '{"patientId":"P001"}')
if echo "$RESP" | grep -q '"triage"' && echo "$RESP" | grep -q '"diagnosis"' && echo "$RESP" | grep -q '"summary"'; then
    check "POST /api/analyze P001 returns all agents" pass
else
    check "POST /api/analyze P001 returns all agents" fail
fi

# Test 4: Analyze P002 - high urgency
RESP=$(curl -s -X POST "${BASE_URL}/api/analyze" -H "Content-Type: application/json" -d '{"patientId":"P002"}')
if echo "$RESP" | grep -qE '"urgencyScore":[45]'; then
    check "POST /api/analyze P002 high urgency" pass
else
    check "POST /api/analyze P002 high urgency" fail
fi

# Test 5: GraphQL patients query
RESP=$(curl -s -X POST "${BASE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ patients { id name } }"}')
if echo "$RESP" | grep -q '"Rajesh Kumar"'; then check "GraphQL patients query" pass; else check "GraphQL patients query" fail; fi

# Test 6: GraphQL drug interactions
RESP=$(curl -s -X POST "${BASE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ drugInteractions(medications:[\"metformin\",\"lisinopril\"]) { drug severity effect } }"}')
if echo "$RESP" | grep -q '"drugInteractions"'; then check "GraphQL drugInteractions query" pass; else check "GraphQL drugInteractions query" fail; fi

# Test 7: GraphQL ICD search
RESP=$(curl -s -X POST "${BASE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ searchICDBySymptoms(symptoms:[\"chest pain\",\"dyspnea\"]) { code description } }"}')
if echo "$RESP" | grep -q '"code"'; then check "GraphQL searchICDBySymptoms" pass; else check "GraphQL searchICDBySymptoms" fail; fi

# Test 8: Hallucination report present
RESP=$(curl -s -X POST "${BASE_URL}/api/analyze" -H "Content-Type: application/json" -d '{"patientId":"P003"}')
if echo "$RESP" | grep -q '"hallucinationReport"'; then check "Hallucination report present" pass; else check "Hallucination report present" fail; fi

# Test 9: Agent trace has all 6 agents
if echo "$RESP" | grep -q '"agentTrace"'; then check "agentTrace present" pass; else check "agentTrace present" fail; fi

# Test 10: Analyze P004 hyperthyroid
RESP=$(curl -s -X POST "${BASE_URL}/api/analyze" -H "Content-Type: application/json" -d '{"patientId":"P004"}')
if echo "$RESP" | grep -qi "graves\|hyperthyroid\|thyrotoxicosis"; then check "P004 hyperthyroid diagnosis" pass; else check "P004 hyperthyroid diagnosis" fail; fi

# Cleanup
echo ""
echo "[*] Stopping server (PID $SERVER_PID)..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

TOTAL=$((PASS + FAIL))
echo ""
echo "==============================================="
echo "  ClinicalCopilot - Smoke Test Results"
echo "==============================================="
echo "  Smoke Tests:    ${PASS}/${TOTAL} passed"
if [ $FAIL -gt 0 ]; then
    echo ""
    echo "  Failed checks:"
    for c in "${FAILED_CHECKS[@]}"; do
        echo "    - $c"
    done
fi
echo "==============================================="
echo ""

[ $FAIL -eq 0 ] && exit 0 || exit 1
