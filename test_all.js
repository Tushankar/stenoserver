
const http = require("http");

async function runTests() {
  console.log("Starting tests...");
  let userToken = "";
  let adminToken = "";
  
  // 1. Register User
  let res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Curl Tester", email: "curltest@test.com", password: "password123" })
  });
  let data = await res.json();
  if (data.success) {
      console.log("✅ User Register");
      userToken = data.token;
  } else {
      console.log("❌ User Register", data);
  }

  // 2. Login User
  res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "curltest@test.com", password: "password123" })
  });
  data = await res.json();
  if (data.success) {
      console.log("✅ User Login");
      userToken = data.token;
  } else console.log("❌ User Login", data);

  // 3. Create Session
  res = await fetch("http://localhost:5000/api/sessions", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken}` },
    body: JSON.stringify({ mode: "typing", wpm: 85, accuracy: 98, duration: 60, speed: 85, errorCount: 2, errors: [], keystrokeData: [], weakKeysDetected: ["t","s"] })
  });
  data = await res.json();
  if (data.success) console.log("✅ Create Session");
  else console.log("❌ Create Session", data);
  
  // 4. Get Dashboard
  res = await fetch("http://localhost:5000/api/analysis/dashboard", { headers: { "Authorization": `Bearer ${userToken}` }});
  data = await res.json();
  if (data.success) console.log("✅ Get Dashboard Data");
  else console.log("❌ Dashboard", data);

  // 5. Cleanup
  console.log("Tests done. Database cleanup should be manual or run a script.");
  process.exit(0);
}
runTests();
