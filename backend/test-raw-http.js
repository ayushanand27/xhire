import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Raw HTTP server works!" }));
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Try visiting http://localhost:4000 in your browser");
});

server.on("error", (error) => {
  console.error("Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on("listening", () => {
  const addr = server.address();
  console.log("Server is actually listening on:", addr);
});
