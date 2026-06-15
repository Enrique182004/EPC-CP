const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./app");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(
    `[Server] Running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
  );
  startScheduler();
});

const shutdown = () => {
  server.close(() => {
    console.log("[Server] Graceful shutdown complete");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
