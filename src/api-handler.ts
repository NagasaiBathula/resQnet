import { fromNodeMiddleware } from "h3";
import app, { initDB } from "../server/src/app.js";

let dbConnected = false;

// Ensure database is initialized before serving requests
const dbConnectMiddleware = async (req: any, res: any, next: any) => {
  if (!dbConnected) {
    try {
      await initDB();
      dbConnected = true;
    } catch (err) {
      console.error("Vercel lazy-connect DB error:", err);
    }
  }
  next();
};

app.use(dbConnectMiddleware);

export default fromNodeMiddleware(app);
