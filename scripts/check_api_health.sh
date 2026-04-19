#!/bin/zsh

BASE_URL="http://localhost:3000"

echo "🔍 Starting API Health Audit..."
echo "--------------------------------"

# 1. AI Chat (Simplified)
echo -n "AI Chat: "
curl -s -X POST "$BASE_URL/api/ai/chat" -H "Content-Type: application/json" -d '{"prompt":"health check"}' -w "%{http_code}\n" -o /dev/null

# 2. Upload (Should fail with 401/400 but not 500)
echo -n "Upload: "
curl -s -X POST "$BASE_URL/api/upload" -w "%{http_code}\n" -o /dev/null

# 3. Create User (Admin - should be 401)
echo -n "Admin Create User: "
curl -s -X POST "$BASE_URL/api/admin/create-user" -w "%{http_code}\n" -o /dev/null

# 4. Media Token (should be 401)
echo -n "Media Token: "
curl -s -X GET "$BASE_URL/api/media/token" -w "%{http_code}\n" -o /dev/null

# 5. Media Note (should be 401)
echo -n "Media Note: "
curl -s -X GET "$BASE_URL/api/media/note" -w "%{http_code}\n" -o /dev/null

echo "--------------------------------"
echo "✅ Audit Complete. If all codes are 200, 401, or 400, the routing is HEALTHY."
echo "❌ If any code is 500 or 404, there is a CRITICAL issue."
