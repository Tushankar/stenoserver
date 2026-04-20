const fetch = require("node-fetch"); // Native fetch in Node 18+
const mongoose = require("mongoose");
require("dotenv").config();

const API = "http://localhost:5000/api";
const EMAIL = "curl_audit_e2e_test@example.com";

async function testAll() {
  console.log("==> STARTING E2E API AUDIT (Curl Equivalent)");

  // 1. REGISTER
  console.log("\\n[1] POST /api/auth/register");
  let res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Curl Audit",
      email: EMAIL,
      password: "password123",
    }),
  });
  let data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);
  // 2. LOGIN
  console.log("\\n[2] POST /api/auth/login");
  res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: "password123" }),
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);
  let token = data.token; // Grab valid token from login

  // 3. ME (Auth verify)
  console.log("\\n[3] GET /api/auth/me");
  res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);

  // 4. CREATE SESSION
  console.log("\\n[4] POST /api/sessions");
  res = await fetch(`${API}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode: "typing",
      duration: 60,
      expectedText: "This is the expected passage text for testing",
      typedText: "This is the expected passage txxt for tesing",
      keystrokeData: [],
    }),
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);
  const sessionId = data.session?._id;

  // 5. GET DASHBOARD
  console.log("\\n[5] GET /api/analysis/dashboard");
  res = await fetch(`${API}/analysis/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);

  // 6. GET LEADERBOARD
  console.log("\\n[6] GET /api/leaderboard?period=all");
  res = await fetch(`${API}/leaderboard?period=all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);
  // 7. AI PASSAGE GENERATION
  console.log("\\n[7] POST /api/ai/generate-passage");
  res = await fetch(`${API}/ai/generate-passage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      weakKeys: ["t", "h"],
      level: "intermediate",
      wordCount: 50,
    }),
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);

  // 8. AI SESSION ANALYSIS
  console.log(`\\n[8] POST /api/ai/analyze/${sessionId}`);
  res = await fetch(`${API}/ai/analyze/${sessionId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Response:", data.success ? "✅ Success" : data);
  // ===============================
  // CLEANUP DELETION
  // ===============================
  console.log("\\n==> DELETING IMPLEMENTATION TEST RECORDS...");
  await mongoose.connect(process.env.MONGO_URI);

  const delUser = await mongoose.connection
    .collection("users")
    .deleteOne({ email: EMAIL });
  console.log(`Deleted Users: ${delUser.deletedCount}`);

  const delSess = await mongoose.connection
    .collection("sessions")
    .deleteMany({ duration: 60 });
  console.log(`Deleted Sessions: ${delSess.deletedCount}`);

  console.log("\\n==> AUDIT COMPLETE.");
  process.exit(0);
}

testAll().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
