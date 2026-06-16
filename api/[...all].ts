import app, { initDB } from "../server/src/app.js";

let dbConnected = false;

app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    try {
      await initDB();
      dbConnected = true;
    } catch (err) {
      console.error("Vercel lazy-connect DB error:", err);
    }
  }
  next();
});

export default app;
