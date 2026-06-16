import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { Plugin } from "vite";

function expressDevPlugin(): Plugin {
  return {
    name: "express-dev-plugin",
    configureServer(server) {
      let dbInitialized = false;

      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api")) {
          try {
            // ssrLoadModule dynamically compiles and runs backend code in Node environment.
            // This enables live hot reloading (HMR) for backend logic in development!
            const { default: app, initDB } = await server.ssrLoadModule("./server/src/app.ts");

            if (!dbInitialized) {
              dbInitialized = true;
              initDB().then(() => {
                console.log("✓ Dev Database successfully initialized");
              }).catch((err: any) => {
                console.error("Failed to initialize dev database:", err);
              });
            }

            // Route request to Express app
            app(req, res, next);
          } catch (error) {
            console.error("Express dev plugin error:", error);
            res.statusCode = 500;
            res.end("Internal Server Error in Dev Express Middleware");
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [expressDevPlugin()],
  },
});
