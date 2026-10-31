import http from "node:http";
import { fileURLToPath } from "node:url";
import next from "next";

const port = Number(process.argv[2] ?? "3100");
const basePath = process.env.NEXT_PUBLIC_ACCESSREADY_BASE_PATH;
if (!Number.isInteger(port) || port < 1024 || port > 65535 || !/^\/ports\/[1-9]\d*$/.test(basePath ?? "")) {
  throw new Error("Set NEXT_PUBLIC_ACCESSREADY_BASE_PATH=/ports/PORT and choose a valid listening port.");
}

const app = next({
  dev: false,
  dir: fileURLToPath(new URL("../", import.meta.url)),
  hostname: "0.0.0.0",
  port,
});
await app.prepare();
const handle = app.getRequestHandler();

const server = http.createServer((request, response) => {
  const incoming = request.url ?? "/";
  const [pathname, ...query] = incoming.split("?");
  const hasPrefix = pathname === basePath || pathname.startsWith(`${basePath}/`);
  // The workspace strips /ports/PORT before forwarding. Restore it for Next's
  // router while retaining the same prefix in browser-facing asset/link URLs.
  const restored = hasPrefix ? pathname : `${basePath}${pathname === "/" ? "" : pathname}`;
  request.url = `${restored}${query.length ? `?${query.join("?")}` : ""}`;

  // The workspace also prefixes relative Location headers. Avoid doubled
  // prefixes when Next canonicalizes a URL received through that proxy.
  const setHeader = response.setHeader.bind(response);
  response.setHeader = (name, value) => {
    if (!hasPrefix && name.toLowerCase() === "location" && typeof value === "string") {
      if (value === basePath) value = "/";
      else if (value.startsWith(`${basePath}/`)) value = value.slice(basePath.length);
    }
    return setHeader(name, value);
  };

  handle(request, response).catch((error) => {
    console.error("Preview request failed:", error);
    if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("The preview could not load this page.");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`AccessReady preview ready on port ${port}; browser path ${basePath}/`);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => app.close().finally(() => process.exit(0))));
}
