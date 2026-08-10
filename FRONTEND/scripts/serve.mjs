import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const port = Number(process.env.PORT) || 4173;
const mimeTypes = new Map([
  [".avif", "image/avif"], [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"], [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"], [".jpeg", "image/jpeg"], [".jpg", "image/jpeg"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".map", "application/json; charset=utf-8"],
  [".png", "image/png"], [".svg", "image/svg+xml"], [".webp", "image/webp"],
  [".woff", "font/woff"], [".woff2", "font/woff2"],
]);

if (!existsSync(join(root, "index.html"))) {
  throw new Error("Frontend nao compilado. Execute npm run build antes de iniciar.");
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const candidate = normalize(join(root, pathname.replace(/^[/\\]+/, "")));
  const isInsideRoot = candidate === root || candidate.startsWith(`${root}${sep}`);
  const fileExists = isInsideRoot && existsSync(candidate) && statSync(candidate).isFile();

  if (!fileExists && (pathname.startsWith("/assets/") || extname(pathname))) {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    response.end("Not Found");
    return;
  }

  const file = fileExists ? candidate : join(root, "index.html");
  response.setHeader("Content-Type", mimeTypes.get(extname(file)) ?? "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Frontend executando na porta ${port}.`);
});
