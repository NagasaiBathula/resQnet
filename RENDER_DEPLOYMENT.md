# ResQNet Backend: Render Deployment Guide

This document outlines the step-by-step instructions to deploy the ResQNet Express.js backend on **Render** (as a Web Service) connected to **MongoDB Atlas** and **Google Gemini**.

---

## 1. Render Web Service Configuration

Follow these settings when creating a new **Web Service** in Render:

| Field | Configuration | Notes |
| :--- | :--- | :--- |
| **Runtime** | `Node` | Node.js environment |
| **Root Directory** | `server` | Focuses the build process inside the server subfolder |
| **Build Command** | `npm install && npm run build` | Installs server packages and compiles TypeScript to `dist/` |
| **Start Command** | `npm start` | Executes the compiled script `node dist/index.js` |
| **Instance Type** | `Free` or `Starter` | Starter is recommended to avoid service sleeping |

---

## 2. Environment Variables Setup

Configure the following environment variables under the **Environment** tab on the Render Dashboard:

| Key | Example Value | Purpose |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.liffy0m.mongodb.net/?...` | MongoDB Atlas cluster connection URI |
| `GEMINI_API_KEY` | `AQ.Ab8RN6IUg...` | Google Gen AI API key for triage and assistant features |
| `JWT_SECRET` | `your_secure_jwt_random_salt_hash` | Private key used to sign client authorization JWTs |
| `FRONTEND_URL` | `https://resqnet.vercel.app` | The production URL of the frontend (for CORS hardening) |
| `NODE_ENV` | `production` | Sets the application to production mode |
| `PORT` | `10000` | Render binds this dynamically, but setting it ensures Express resolves it |

---

## 3. MongoDB Atlas & Network Settings

To allow the Render backend to read/write to your MongoDB Atlas cluster:
1.  Log in to the **MongoDB Atlas Console**.
2.  Navigate to **Network Access** under Security.
3.  Click **Add IP Address**.
4.  Since Render uses dynamic IP addresses for its services, select **Allow Access From Anywhere** (`0.0.0.0/0`) or configure a static IP outbound proxy on Render.
5.  Save changes.

---

## 4. Google Gemini API Verification

To obtain a Google Gen AI developer key:
1.  Navigate to the **Google AI Studio** console.
2.  Click **Get API key**.
3.  Copy the generated key (starts with `AQ.`) and save it as the `GEMINI_API_KEY` environment variable in Render.

---

## 5. Health Check & Live Verification

Once deployment completes, Render provides a service URL (e.g., `https://resqnet-api.onrender.com`). Verify that the server is online and running cleanly:

### Check URL
`GET https://[your-service-name].onrender.com/api/health`

### Expected Response
```json
{
  "status": "ok",
  "timestamp": "2026-06-16T12:00:00.000Z",
  "message": "ResQNet AI API Server is online and healthy"
}
```

---

## 6. Common Deployment Issues & Resolutions

### A. Port Bind Error (`EADDRINUSE` or service failing to boot)
*   **Cause**: Port conflicts or not reading the Render-provided port.
*   **Fix**: Render binds the process port using the `PORT` environment variable dynamically. Ensure `server/src/index.ts` is reading `process.env.PORT` and binding it correctly:
    ```javascript
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => { ... });
    ```

### B. Payload Too Large (HTTP 413)
*   **Cause**: Uploading high-resolution base64 incident photos exceeding default body-parser limits.
*   **Fix**: Verified express JSON limits are set to `50mb` in `server/src/index.ts`. Do not change these configurations.

### C. CORS Errors on Frontend
*   **Cause**: The `FRONTEND_URL` environment variable on Render does not match the actual Vercel URL.
*   **Fix**: Check Vercel's active URL (make sure it includes `https://` and has no trailing slash `/`) and update the `FRONTEND_URL` variable on Render. Restart Render service.
