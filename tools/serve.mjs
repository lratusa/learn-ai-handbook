// Local preview of a build. Usage: node tools/serve.mjs [dir=dist] [port=8080]
// Build with the default config (base path /) first: npm run build
import { serve, origin } from "./lib.mjs";

const [dir = "dist", port = "8080"] = process.argv.slice(2);
const srv = await serve(dir, Number(port));
console.log(`serving ${dir} at ${origin(srv)}/  (Ctrl+C to stop)`);
