
$URL = "https://stenoserver.onrender.com/api"

Write-Host "Registering User..."
$reg = curl.exe -s -X POST "$URL/auth/register" -H "Content-Type: application/json" -d "{\`"name\`": \`"CurlTest\`", \`"email\`": \`"curl@example.com\`", \`"password\`": \`"curlpass123\`"}"
Write-Host $reg
$token = ($reg | ConvertFrom-Json).token

Write-Host "Fetching User Profile..."
curl.exe -s -X GET "$URL/auth/me" -H "Authorization: Bearer $token"

Write-Host "Getting Dashboard Data..."
curl.exe -s -X GET "$URL/analysis/dashboard" -H "Authorization: Bearer $token"

Write-Host "Cleaning up test user in MongoDB..."
# we will use an inline mongo script or node script to clean it up:

