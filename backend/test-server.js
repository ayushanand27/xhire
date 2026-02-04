import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

server.listen(4000, "0.0.0.0", () => {
  console.log("Test server listening on port 4000");
  console.log("Try: curl http://localhost:4000/test");
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

// Keep the process running
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.close(() => {
    process.exit(0);
  });
});
