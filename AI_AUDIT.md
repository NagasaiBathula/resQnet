# AI Auditor Report: ResQNet AI
*Prepared by Agent 5 — AI Auditor*

This document audits the Google Gemini generative AI client initialization, system prompting, chat interfaces, auto-triage workflows, damage assessments, and mock fallback handlers.

---

## 1. Gemini Client Initialization

The AI service is configured inside [ai.ts](file:///d:/resqnetai-main/server/src/routes/ai.ts):

- **SDK Library**: Uses the new official `@google/genai` library client (`GoogleGenAI`).
- **Initialization**:
  ```typescript
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  ```
- **Outage Guard**: If the API key is missing or the connection fails, the client gracefully falls back to mock routines, logging a warning rather than crashing the Express server.

---

## 2. API Endpoints Auditing

We verified two primary routes:

### A. Emergency Safety Chat (`/api/ai/chat`)
- **System Instruction**: Injects a custom prompt telling the model it is the "ResQNet AI Emergency Assistant", giving it the user's name and role, and instructing it to:
  - Provide structured, safety-focused advice (using bold headers and bullet points).
  - Remind users to seek professional help once safe when providing medical advice.
  - Suggest local shelter options (schools, community centers).
- **Format mapping**: Translates front-end message histories to standard Google Gen AI format (`role` and `parts`).
- **Audit**: **Pass**. Verified successful response using real Gemini API returning formatted markdown first-aid instructions.

### B. Automatic Triage & Vision Assessment (`/api/ai/triage`)
- **JSON Enforcer**: Tells Gemini to reply strictly in raw JSON matching a defined schema.
- **Multimodal capabilities**: Accepts an optional base64 image and passes it to the `contents` array for visual damage assessment.
- **Priority Rules**: Enforces a strict mapping:
  - `Critical` severity $\rightarrow$ `P1` priority.
  - `High` severity $\rightarrow$ `P2` priority.
  - `Medium` severity $\rightarrow$ `P3` priority.
  - `Low` severity $\rightarrow$ `P4` priority.
- **Audit**: **Pass**. Integration test results show Gemini correctly analyzed text descriptions (e.g. "5-foot flood") and marked them as `Critical` and `P1`, returning structural risk summaries.

---

## 3. Mock Fallback Routines

If the API key is not configured, the endpoint resolves matching regex patterns:
- "flood", "water", "rain" $\rightarrow$ category `Flood`, severity `High`, priority `P2`.
- "fire", "smoke", "burn" $\rightarrow$ category `Fire`, severity `Critical`, priority `P1`.
- "heart", "medical", "accident" $\rightarrow$ category `Medical Emergency`, severity `High`, priority `P2`.

This ensures that the incident reporting form auto-populates correctly and never freezes for citizens even during a complete Google Gemini API outage.
