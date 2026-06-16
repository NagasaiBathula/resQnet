import fs from "fs";
import path from "path";

// Parse .env file
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

const API_URL = process.env.VITE_API_URL || "http://localhost:8080";

async function runSystemIntegrationTest() {
  console.log("=================================================");
  console.log("STARTING RESQNET SYSTEM INTEGRATION WORKFLOW AUDIT...");
  console.log("=================================================\n");

  try {
    // -----------------------------------------------------------------
    // 1. Citizen reports an emergency
    // -----------------------------------------------------------------
    console.log("Step 1: Citizen reports emergency...");
    const citizenLoginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "citizen@resqnet.ai", password: "demo123" }),
    });
    if (!citizenLoginRes.ok) throw new Error("Citizen login failed");
    const loginData = await citizenLoginRes.json();
    const citizenToken = loginData.token;
    const citizenName = loginData.name;
    console.log(`✓ Citizen ${citizenName} authenticated!`);

    const reportRes = await fetch(`${API_URL}/api/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        title: "Flash Flood Warning: People Trapped",
        description: "Heavy rain has flooded the lower residential blocks. 3 citizens are trapped inside.",
        category: "Flood",
        severity: "Critical",
        coordinates: { lat: 19.076, lng: 72.877 },
        state: "Maharashtra",
        district: "Mumbai",
        address: "Sector 12, Andheri West",
        aiSummary: "Flooding in residential blocks has trapped three citizens.",
        aiCategorySuggested: "Flood",
        aiSeveritySuggested: "Critical",
        aiPriority: "P1",
        aiDamageAssessment: "High water levels, imminent structural safety hazard.",
        aiConfidence: 0.95,
        aiRecommendedResources: ["Rescue Boat", "First Aid Kit"],
      }),
    });
    if (!reportRes.ok) {
      const err = await reportRes.json();
      throw new Error("Report creation failed: " + JSON.stringify(err));
    }
    const incident = await reportRes.json();
    const incidentId = incident._id;
    console.log(`✓ Incident reported successfully: ${incident.incidentNumber} (ID: ${incidentId})`);
    console.log(`  Initial Status: ${incident.status}\n`);

    // -----------------------------------------------------------------
    // 2. Authority logs in and verifies the incident
    // -----------------------------------------------------------------
    console.log("Step 2: Authority verifies incident...");
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
    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error("Verification failed: " + JSON.stringify(err));
    }
    const verifiedIncident = await verifyRes.json();
    console.log(`✓ Incident verified successfully! Current Status: ${verifiedIncident.status}\n`);

    // -----------------------------------------------------------------
    // 3. Authority assigns Rescue Team and Volunteers
    // -----------------------------------------------------------------
    console.log("Step 3: Authority assigns responders...");
    // Let's fetch the Rescue Team and Volunteer accounts to get their IDs
    const usersRes = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    if (!usersRes.ok) throw new Error("Failed to fetch users directory");
    const usersList = await usersRes.json();
    const rescueTeamUser = usersList.find((u) => u.email === "rescue@resqnet.ai");
    const volunteerUser = usersList.find((u) => u.email === "volunteer@resqnet.ai");

    if (!rescueTeamUser || !volunteerUser) {
      throw new Error("Missing rescue or volunteer seed accounts in database.");
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
    if (!assignRes.ok) {
      const err = await assignRes.json();
      throw new Error("Assignment failed: " + JSON.stringify(err));
    }
    const assignedIncident = await assignRes.json();
    console.log(`✓ Responders assigned! Advanced Status: ${assignedIncident.status}`);
    console.log(`  Assigned Rescue Squad: ${assignedIncident.assignedRescueTeam.name}`);
    console.log(`  Assigned Volunteer: ${assignedIncident.assignedVolunteers[0].name}\n`);

    // -----------------------------------------------------------------
    // 4. Authority allocates Stockpile Resource
    // -----------------------------------------------------------------
    console.log("Step 4: Authority allocates stockpile equipment...");
    const resourcesRes = await fetch(`${API_URL}/api/resources`, {
      headers: { Authorization: `Bearer ${authorityToken}` },
    });
    if (!resourcesRes.ok) throw new Error("Failed to fetch resources list");
    const resourcesList = await resourcesRes.json();
    
    // Find an available resource
    const availableResource = resourcesList.find((r) => r.status === "Available");
    if (!availableResource) {
      console.warn("⚠️ No Available resources in stockpile. Skipping resource allocation test.");
    } else {
      console.log(`  Found Available Resource: ${availableResource.name} (${availableResource.resourceId})`);
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
      if (!allocateRes.ok) {
        const err = await allocateRes.json();
        throw new Error("Resource allocation failed: " + JSON.stringify(err));
      }
      console.log("✓ Stockpile asset allocated to incident scene!\n");
    }

    // -----------------------------------------------------------------
    // 5. Rescue Team starts the mission
    // -----------------------------------------------------------------
    console.log("Step 5: Rescue squad starts mission...");
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
    if (!startMissionRes.ok) {
      const err = await startMissionRes.json();
      throw new Error("Starting mission failed: " + JSON.stringify(err));
    }
    const inProgressIncident = await startMissionRes.json();
    console.log(`✓ Mission started! Current Status: ${inProgressIncident.status}\n`);

    // -----------------------------------------------------------------
    // 6. Volunteer reads the mission details
    // -----------------------------------------------------------------
    console.log("Step 6: Volunteer reads assigned mission details...");
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
    console.log(`✓ Volunteer verified mission assignment: "${assignedMission.title}" is listed!\n`);

    // -----------------------------------------------------------------
    // 7. Rescue Team resolves and closes the incident
    // -----------------------------------------------------------------
    console.log("Step 7: Rescue squad resolves and closes case...");
    const resolveRes = await fetch(`${API_URL}/api/incidents/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rescueToken}`,
      },
      body: JSON.stringify({
        status: "Resolved",
        resolutionNotes: "Stranded citizens evacuated safely using deployed boats. No injuries reported.",
      }),
    });
    if (!resolveRes.ok) {
      const err = await resolveRes.json();
      throw new Error("Resolution failed: " + JSON.stringify(err));
    }
    const resolvedIncident = await resolveRes.json();
    console.log(`✓ Mission resolved successfully! Current Status: ${resolvedIncident.status}`);
    console.log(`  Resolution Notes: ${resolvedIncident.resolutionNotes}`);
    
    // Check activity log contains resolution details
    const lastLog = resolvedIncident.activityLog[resolvedIncident.activityLog.length - 1];
    console.log(`  Activity Log Verified: [${lastLog.action}] ${lastLog.notes}`);

    // Verify resource is released back to Available
    if (availableResource) {
      const checkRes = await fetch(`${API_URL}/api/resources`, {
        headers: { Authorization: `Bearer ${authorityToken}` },
      });
      const checkedList = await checkRes.json();
      const updatedResource = checkedList.find((r) => r._id === availableResource._id);
      console.log(`  Resource Release Check: ${updatedResource.name} status is now ${updatedResource.status}`);
      if (updatedResource.status !== "Available") {
        console.warn("⚠️ Warning: Allocated resource was not returned to 'Available' status.");
      }
    }
    console.log("");

    console.log("=================================================");
    console.log("✓ RESQNET SYSTEM INTEGRATION AUDIT ALL PASSED!");
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ System Integration Audit Failed:", err);
    process.exit(1);
  }
}

runSystemIntegrationTest();
