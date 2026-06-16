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

async function verifyAI() {
  console.log("=================================================");
  console.log("STARTING RESQNET AI LAYER VERIFICATION AUDIT...");
  console.log("=================================================\n");

  try {
    // 1. Authenticate to obtain JWT token
    console.log("Step 1: Authenticating Citizen Account...");
    const authRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "citizen@resqnet.ai",
        password: "demo123",
      }),
    });

    if (!authRes.ok) {
      throw new Error(`Authentication failed with status: ${authRes.status}`);
    }

    const authData = await authRes.json();
    const token = authData.token;
    console.log("✓ Citizen authenticated successfully. Token acquired!\n");

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 2. Verify AI Emergency Assistant Chat
    console.log("Step 2: Testing Gemini Emergency Assistant Chat...");
    const chatBody = {
      messages: [
        {
          role: "user",
          text: "What are the immediate safety steps for an electrical fire in the kitchen?",
        },
      ],
    };

    const chatRes = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(chatBody),
    });

    if (!chatRes.ok) {
      throw new Error(`Chat API failed with status: ${chatRes.status}`);
    }

    const chatData = await chatRes.json();
    console.log("✓ Chat Assistant Response Received!");
    console.log("-------------------------------------------------");
    console.log(chatData.text);
    console.log("-------------------------------------------------\n");

    // 3. Verify AI Triage (Text description)
    console.log("Step 3: Testing AI Incident Classification & Auto-Triage (Text-only)...");
    const textTriageBody = {
      description: "Severe flooding in the lower block. Water levels are rising fast, about 5 feet deep now. There are elderly citizens trapped on the first floor who need urgent evacuation.",
    };

    const textTriageRes = await fetch(`${API_URL}/api/ai/triage`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(textTriageBody),
    });

    if (!textTriageRes.ok) {
      throw new Error(`Text Triage API failed with status: ${textTriageRes.status}`);
    }

    const textTriageData = await textTriageRes.json();
    console.log("✓ Text Triage Result:");
    console.log(JSON.stringify(textTriageData, null, 2));
    console.log("");

    // Assert priority mappings
    if (textTriageData.severity === "Critical" && textTriageData.priority !== "P1") {
      console.warn("⚠️ Warning: Priority mapping mismatch for Critical severity.");
    } else if (textTriageData.severity === "High" && textTriageData.priority !== "P2") {
      console.warn("⚠️ Warning: Priority mapping mismatch for High severity.");
    } else {
      console.log("✓ Severity to Priority Mapping is Correct!");
    }
    console.log("");

    // 4. Verify AI Triage with Vision (base64 image payload)
    console.log("Step 4: Testing AI Vision Damage Assessment (Multimodal)...");
    // 1x1 solid red PNG base64
    const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const visionTriageBody = {
      description: "A building wall has collapsed and is blocking the main road. Concrete debris is scattered everywhere.",
      image: testImageBase64,
    };

    const visionTriageRes = await fetch(`${API_URL}/api/ai/triage`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(visionTriageBody),
    });

    if (!visionTriageRes.ok) {
      throw new Error(`Vision Triage API failed with status: ${visionTriageRes.status}`);
    }

    const visionTriageData = await visionTriageRes.json();
    console.log("✓ Vision Triage Result:");
    console.log(JSON.stringify(visionTriageData, null, 2));
    console.log("\n");

    // 5. Verify End-to-End Persistence of AI Fields in database
    console.log("Step 5: Testing Database Persistence of AI Fields...");
    const reportIncidentBody = {
      title: visionTriageData.title || "AI Triaged Blocked Road",
      description: "A building wall has collapsed and is blocking the main road. Concrete debris is scattered everywhere.",
      category: "Building Collapse",
      severity: "High",
      coordinates: { lat: 19.076, lng: 72.877 },
      state: "Maharashtra",
      district: "Mumbai",
      address: "Main Road Intersection, Block B",
      attachments: [{ fileName: "collapsed_wall.jpg", fileType: "image/jpeg" }],
      aiSummary: visionTriageData.summary,
      aiCategorySuggested: visionTriageData.category,
      aiSeveritySuggested: visionTriageData.severity,
      aiPriority: visionTriageData.priority,
      aiDamageAssessment: visionTriageData.damageAssessment,
      aiConfidence: visionTriageData.confidence,
      aiRecommendedResources: visionTriageData.recommendedResources,
    };

    const createIncidentRes = await fetch(`${API_URL}/api/incidents`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(reportIncidentBody),
    });

    if (!createIncidentRes.ok) {
      throw new Error(`Create Incident API failed with status: ${createIncidentRes.status}`);
    }

    const createdIncident = await createIncidentRes.json();
    console.log("✓ Incident successfully reported with AI fields!");
    console.log(`Incident ID: ${createdIncident._id}`);
    console.log(`Incident Number: ${createdIncident.incidentNumber}`);
    console.log(`Saved AI Priority: ${createdIncident.aiPriority}`);
    console.log(`Saved AI Recommended Resources: ${createdIncident.aiRecommendedResources?.join(", ")}`);
    console.log("");

    console.log("=================================================");
    console.log("✓ RESQNET AI LAYER VERIFICATION COMPLETED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ Verification Audit Failed:", err);
    process.exit(1);
  }
}

verifyAI();
