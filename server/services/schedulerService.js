const cron = require("node-cron");
const { checkExpirations } = require("./alertService");

function startScheduler() {
  // Run daily at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("[Scheduler] Running daily expiration check");
    try {
      await checkExpirations();
    } catch (err) {
      console.error("[Scheduler] Error in expiration check:", err.message);
    }
  });
  console.log("[Scheduler] Daily alert scheduler started (8:00 AM)");
}

module.exports = { startScheduler };
