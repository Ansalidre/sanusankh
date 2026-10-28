import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Führt die Netlify-Funktion im Vite-Dev-Server unter /api/assistant aus,
 * damit `npm run dev` ohne Netlify CLI funktioniert.
 */
function netlifyFunctionDev() {
  return {
    name: "netlify-function-dev",
    configureServer(server) {
      server.middlewares.use("/api/assistant", async (req, res) => {
        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString("utf8");
          const request = new Request(`http://localhost${req.originalUrl}`, {
            method: req.method,
            headers: { "content-type": req.headers["content-type"] || "application/json" },
            body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
          });
          const mod = await server.ssrLoadModule("/netlify/functions/assistant.mjs");
          const response = await mod.default(request, {});
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: String(error?.message || error) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Serverseitige Variablen (ANTHROPIC_API_KEY) aus .env für die Dev-Funktion bereitstellen.
  const env = loadEnv(mode, here, "");
  for (const key of ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), netlifyFunctionDev()],
    resolve: {
      alias: { "@": path.resolve(here, "src") },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("lucide-react")) return "icons";
            return "vendor";
          },
        },
      },
    },
  };
});
