import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENV = [
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "ADMIN_PASSWORD",
  "HASH_SECRET",
  "BREVO_API_KEY",
  "MAIL_FROM",
  "MAIL_FROM_NAME",
  "SEED_DEMO_PARTNERS",
  "STORAGE_BACKEND",
];

const FUNCTIONS_DIR = path.resolve(here, "netlify/functions");

/** Wandelt einen Netlify-Pfad ("/api/admin/*") in einen regulären Ausdruck. */
function pathPattern(p) {
  return new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}/?$`);
}

/**
 * Führt die Netlify-Funktionen (netlify/functions/*.mjs) im Vite-Dev-Server unter ihrem
 * `config.path` aus, damit `npm run dev` ohne Netlify CLI funktioniert. Daten liegen lokal in .data/.
 */
function netlifyFunctionDev() {
  return {
    name: "netlify-function-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.originalUrl, "http://localhost").pathname;
        if (!pathname.startsWith("/api/")) return next();
        try {
          let handler = null;
          for (const file of fs.readdirSync(FUNCTIONS_DIR).filter((f) => f.endsWith(".mjs"))) {
            const mod = await server.ssrLoadModule(`/netlify/functions/${file}`);
            const paths = [mod.config?.path].flat().filter(Boolean);
            if (paths.some((p) => pathPattern(p).test(pathname))) handler = mod.default;
          }
          if (!handler) return next();

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (typeof value === "string") headers.set(key, value);
          const request = new Request(`http://${req.headers.host || "localhost"}${req.originalUrl}`, {
            method: req.method,
            headers,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
          });
          const response = await handler(request, { ip: req.socket.remoteAddress });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => key !== "set-cookie" && res.setHeader(key, value));
          const cookies = response.headers.getSetCookie();
          if (cookies.length) res.setHeader("set-cookie", cookies);
          res.end(Buffer.from(await response.arrayBuffer()));
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
  // Serverseitige Variablen aus .env für die Dev-Funktionen bereitstellen (nie im Browser-Bundle).
  const env = loadEnv(mode, here, "");
  for (const key of SERVER_ENV) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  // Lokal speichern die Funktionen in .data/ statt in Netlify Blobs.
  if (mode === "development" && !process.env.STORAGE_BACKEND) process.env.STORAGE_BACKEND = "file";

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
