import app, { initDB } from "./app.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Seed Demo Users
initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
