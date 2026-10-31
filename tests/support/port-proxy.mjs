// Reproduce the workspace's /ports/PORT proxy: remove its path prefix on
// requests and prepend that prefix to relative response redirects.
import http from "node:http";

const [port, targetPort, basePath] = process.argv.slice(2);
const server = http.createServer((request, response) => {
  const incoming = request.url ?? "/";
  if (incoming !== basePath && !incoming.startsWith(`${basePath}/`) && !incoming.startsWith(`${basePath}?`)) {
    response.writeHead(404);
    response.end("Request escaped the forwarded app path.");
    return;
  }
  const path = incoming.slice(basePath.length) || "/";
  const upstream = http.request({
    hostname: "127.0.0.1",
    port: Number(targetPort),
    path: path.startsWith("?") ? `/${path}` : path,
    method: request.method,
    headers: request.headers,
  }, (result) => {
    const headers = { ...result.headers };
    if (headers.location?.startsWith("/")) headers.location = `${basePath}${headers.location}`;
    response.writeHead(result.statusCode ?? 502, headers);
    result.pipe(response);
  });
  upstream.on("error", () => {
    response.writeHead(502);
    response.end("Preview server is unavailable.");
  });
  request.pipe(upstream);
});
server.listen(Number(port), "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
