// Production Smoke Test Verification Script for ResQNet AI
import fs from "fs";
import path from "path";

// Manually parse .env file to avoid package resolution issues in the root workspace
try {
  const envPath = path.resolve(".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim();
        process.env[key] = val;
      }
    }
  }
} catch (err) {
  console.warn("Could not parse .env file:", err.message);
}

const API_URL = process.env.VITE_API_URL || "http://localhost:5000";

async function runProductionSmokeTest() {
  console.log("=================================================");
  console.log("STARTING RESQNET PRODUCTION SMOKE TEST...");
  console.log(`Targeting API Endpoint: ${API_URL}`);
  console.log("=================================================\n");

  try {
    // -----------------------------------------------------------------
    // 1. Citizen logs in
    // -----------------------------------------------------------------
    console.log("Step 1: Authenticating Citizen Account...");
    const citizenLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "citizen@resqnet.ai", password: "demo123" }),
    });
    if (!citizenLoginRes.ok) throw new Error(`Citizen login failed: ${await citizenLoginRes.text()}`);
    const loginData = await citizenLoginRes.json();
    const citizenToken = loginData.token;
    const citizenName = loginData.name;
    console.log(`✓ Citizen ${citizenName} authenticated! Token acquired.`);

    // -----------------------------------------------------------------
    // 2. Perform AI Triage
    // -----------------------------------------------------------------
    console.log("\nStep 2: Invoking backend Gemini AI Triage (/api/ai/triage)...");
    
    // A 1x1 transparent pixel base64 mock image for vision triage testing
    const mockImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const triageRes = await fetch(`${API_URL}/api/ai/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        description: "A major water main burst has flooded the basement levels of the civic apartment complex, and there is smoke coming from the power distributor box. People are trapped.",
        image: mockImageBase64
      }),
    });
    if (!triageRes.ok) throw new Error(`AI Triage failed: ${await triageRes.text()}`);
    const triageData = await triageRes.json();

    console.log("✓ AI Triage Response Received!");
    console.log(`  Suggested Category: ${triageData.category}`);
    console.log(`  Suggested Severity: ${triageData.severity}`);
    console.log(`  Suggested Priority: ${triageData.priority}`);
    console.log(`  Summary: "${triageData.summary}"`);
    console.log(`  Damage Assessment: "${triageData.damageAssessment}"`);
    console.log(`  Confidence: ${triageData.confidence}`);
    console.log(`  Recommended Resources: ${triageData.recommendedResources?.join(", ")}`);

    // Verify priority mapping rules: Critical -> P1, High -> P2, Medium -> P3, Low -> P4
    if (triageData.severity === "Critical" && triageData.priority !== "P1") throw new Error("Priority mapping failed for Critical severity");
    if (triageData.severity === "High" && triageData.priority !== "P2") throw new Error("Priority mapping failed for High severity");
    console.log("✓ AI Severity-to-Priority mapping validation passed!");

    // -----------------------------------------------------------------
    // 3. Create Incident using AI Triaged fields
    // -----------------------------------------------------------------
    console.log("\nStep 3: Submitting Incident Report containing AI diagnostics...");
    const reportRes = await fetch(`${API_URL}/api/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        title: triageData.title || "Flooding & Fire Hazard in Apartments",
        description: "A major water main burst has flooded the basement levels of the civic apartment complex, and there is smoke coming from the power distributor box. People are trapped.",
        category: triageData.category || "Flood",
        severity: triageData.severity || "Critical",
        coordinates: { lat: 19.076, lng: 72.877 },
        state: "Maharashtra",
        district: "Mumbai",
        address: "Sector 12, Andheri West",
        aiSummary: triageData.summary,
        aiCategorySuggested: triageData.category,
        aiSeveritySuggested: triageData.severity,
        aiPriority: triageData.priority,
        aiDamageAssessment: triageData.damageAssessment,
        aiConfidence: triageData.confidence,
        aiRecommendedResources: triageData.recommendedResources,
      }),
    });
    if (!reportRes.ok) throw new Error(`Incident creation failed: ${await reportRes.text()}`);
    const incident = await reportRes.json();
    const incidentId = incident._id;
    console.log(`✓ Incident successfully created: ${incident.incidentNumber} (ID: ${incidentId})`);
    console.log(`  Initial Status: ${incident.status}`);
    console.log(`  Persisted AI Priority: ${incident.aiPriority}`);

    // Verify AI fields are saved in MongoDB
    if (!incident.aiPriority) throw new Error("aiPriority field was not saved in DB");
    if (!incident.aiSummary) throw new Error("aiSummary field was not saved in DB");
    console.log("✓ MongoDB persistence of AI triage fields verified!");

    // -----------------------------------------------------------------
    // 4. Authority logs in and verifies the incident
    // -----------------------------------------------------------------
    console.log("\nStep 4: Authority reviews and verifies incident...");
    const authorityLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "authority@resqnet.ai", password: "demo123" }),
    });
    if (!authorityLoginRes.ok) throw new Error("Authority login failed");
    const { token: authorityToken } = await authorityLoginRes.json();
    
    const verifyRes = await fetch(`${API_URL}/api/incidents/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorityToken}`,
      },
      body: JSON.stringify({ status: "Verified" }),
    });
    if (!verifyRes.ok) throw new Error(`Verification failed: ${await verifyRes.text()}`);
    const verifiedIncident = await verifyRes.json();
    console.log(`✓ Incident Verified! Current Status: ${verifiedIncident.status}`);

    // -----------------------------------------------------------------
    // 5. Authority assigns responders
    // -----------------------------------------------------------------
    console.log("\nStep 5: Authority assigns Rescue Team and Volunteer responders...");
    const usersRes = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    if (!usersRes.ok) throw new Error("Failed to fetch users");
    const usersList = await usersRes.json();
    const rescueTeamUser = usersList.find((u) => u.email === "rescue@resqnet.ai");
    const volunteerUser = usersList.find((u) => u.email === "volunteer@resqnet.ai");

    if (!rescueTeamUser || !volunteerUser) {
      throw new Error("Seed accounts rescue@resqnet.ai or volunteer@resqnet.ai not found in database.");
    }

    const assignRes = await fetch(`${API_URL}/api/incidents/${incidentId}/assign`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorityToken}`,
      },
      body: JSON.stringify({
        assignedRescueTeam: rescueTeamUser._id,
        assignedVolunteers: [volunteerUser._id],
      }),
    });
    if (!assignRes.ok) throw new Error(`Assignment failed: ${await assignRes.text()}`);
    const assignedIncident = await assignRes.json();
    console.log(`✓ Responders assigned successfully. Status: ${assignedIncident.status}`);
    console.log(`  Assigned Rescue Squad: ${assignedIncident.assignedRescueTeam.name}`);
    console.log(`  Assigned Volunteer: ${assignedIncident.assignedVolunteers[0].name}`);

    // -----------------------------------------------------------------
    // 6. Authority allocates Stockpile Resource
    // -----------------------------------------------------------------
    console.log("\nStep 6: Authority allocates Stockpile Equipment to the scene...");
    const resourcesRes = await fetch(`${API_URL}/api/resources`, {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    if (!resourcesRes.ok) throw new Error("Failed to fetch resources");
    const resourcesList = await resourcesRes.json();
    
    // Find an available resource
    const availableResource = resourcesList.find((r) => r.status === "Available");
    if (!availableResource) {
      console.warn("⚠️ No Available resources in stockpile. Skipping equipment allocation verification.");
    } else {
      console.log(`  Allocating equipment: ${availableResource.name} (${availableResource.resourceId})`);
      const allocateRes = await fetch(`${API_URL}/api/incidents/${incidentId}/resources`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authorityToken}`,
        },
        body: JSON.stringify({
          resourceIds: [availableResource._id],
          release: false,
        }),
      });
      if (!allocateRes.ok) throw new Error(`Resource allocation failed: ${await allocateRes.text()}`);
      console.log("✓ Stockpile asset allocated! Status is locked.");
    }

    // -----------------------------------------------------------------
    // 7. Rescue Team starts operation
    // -----------------------------------------------------------------
    console.log("\nStep 7: Rescue squad logs in and starts operation...");
    const rescueLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rescue@resqnet.ai", password: "demo123" }),
    });
    if (!rescueLoginRes.ok) throw new Error("Rescue team login failed");
    const { token: rescueToken } = await rescueLoginRes.json();

    const startMissionRes = await fetch(`${API_URL}/api/incidents/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rescueToken}`,
      },
      body: JSON.stringify({ status: "In Progress" }),
    });
    if (!startMissionRes.ok) throw new Error(`Starting mission failed: ${await startMissionRes.text()}`);
    const inProgressIncident = await startMissionRes.json();
    console.log(`✓ Operation active! Current Status: ${inProgressIncident.status}`);

    // -----------------------------------------------------------------
    // 8. Volunteer checks dispatches
    // -----------------------------------------------------------------
    console.log("\nStep 8: Volunteer logs in and reviews task dispatches...");
    const volunteerLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "volunteer@resqnet.ai", password: "demo123" }),
    });
    if (!volunteerLoginRes.ok) throw new Error("Volunteer login failed");
    const { token: volunteerToken } = await volunteerLoginRes.json();

    const myMissionsRes = await fetch(`${API_URL}/api/incidents/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    if (!myMissionsRes.ok) throw new Error("Volunteer dispatches fetch failed");
    const myMissions = await myMissionsRes.json();
    const assignedMission = myMissions.find((m) => m._id === incidentId);
    if (!assignedMission) {
      throw new Error("Assigned mission not visible on volunteer dashboard.");
    }
    console.log(`✓ Volunteer verified dispatch: "${assignedMission.title}" is listed on dashboard!`);

    // -----------------------------------------------------------------
    // 9. Rescue Team resolves incident and releases resource
    // -----------------------------------------------------------------
    console.log("\nStep 9: Rescue squad resolves and closes case...");
    const resolveRes = await fetch(`${API_URL}/api/incidents/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rescueToken}`,
      },
      body: JSON.stringify({
        status: "Resolved",
        notes: "Debris cleared, water main isolated, and residents evacuated safely.",
      }),
    });
    if (!resolveRes.ok) throw new Error(`Resolution failed: ${await resolveRes.text()}`);
    const resolvedIncident = await resolveRes.json();
    console.log(`✓ Mission resolved successfully! Current Status: ${resolvedIncident.status}`);
    
    // Verify timeline / activity log
    const resolvedLog = resolvedIncident.activityLog.find(log => log.action === "Incident Resolved");
    if (!resolvedLog) throw new Error("Expected an activity log action to be 'Incident Resolved'");
    console.log(`✓ Timeline Log Verified: [Incident Resolved] ${resolvedLog.notes}`);

    // Verify resource lifecycle release
    if (availableResource) {
      const checkRes = await fetch(`${API_URL}/api/resources`, {
        headers: { Authorization: `Bearer ${authorityToken}` },
      });
      const checkedList = await checkRes.json();
      const updatedResource = checkedList.find((r) => r._id === availableResource._id);
      console.log(`✓ Resource Release Check: ${updatedResource.name} status is now ${updatedResource.status}`);
      if (updatedResource.status !== "Available") {
        throw new Error("Expected resource status to be returned to 'Available' upon incident resolution");
      }
    }

    console.log("\n=================================================");
    console.log("✓ RESQNET PRODUCTION SMOKE TEST ALL PASSED!");
    console.log("=================================================");

  } catch (err) {
    console.error("\n❌ Production Smoke Test Failed:", err.message);
    process.exit(1);
  }
}

runProductionSmokeTest();
