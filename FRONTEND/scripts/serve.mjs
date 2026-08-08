import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT) || 4173;
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"], [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".png", "image/png"],
  [".svg", "image/svg+xml"], [".webp", "image/webp"],
]);

if (!existsSync(join(root, "index.html"))) {
  throw new Error("Frontend nao compilado. Execute npm run build antes de iniciar.");
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const candidate = normalize(join(root, pathname.replace(/^[/\\]+/, "")));
  const safeCandidate = candidate === root || candidate.startsWith(`${root}${sep}`)
    ? candidate
    : join(root, "index.html");
  const file = existsSync(safeCandidate) && statSync(safeCandidate).isFile() ? safeCandidate : join(root, "index.html");
  response.setHeader("Content-Type", mimeTypes.get(extname(file)) ?? "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Frontend executando na porta ${port}.`);
});
