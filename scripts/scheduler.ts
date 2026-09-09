// Long-running process that re-runs the ingest logic on a cron schedule.
// For local dev: run `npm run schedule` in a separate terminal alongside
// `npm run dev` and leave it running.
//
// For a hosted deployment this process model doesn't apply — long-running
// background processes don't work on serverless platforms like Vercel.
// Use a platform cron instead: Vercel Cron Jobs hitting a protected API
// route that calls runIngestOnce(), or a GitHub Actions scheduled workflow
// running `npm run ingest`. See README.md "Scheduled ingestion".
import cron from "node-cron";
import { runIngestOnce } from "./ingest";

const SCHEDULE = process.env.INGEST_CRON ?? "*/15 * * * *"; // every 15 minutes by default

if (!cron.validate(SCHEDULE)) {
  console.error(`Invalid cron expression: "${SCHEDULE}"`);
  process.exit(1);
}

let running = false;
async function tick() {
  if (running) {
    console.log(`[${new Date().toISOString()}] previous ingest still running, skipping this tick`);
    return;
  }
  running = true;
  try {
    await runIngestOnce();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ingest run failed:`, err);
  } finally {
    running = false;
  }
}

console.log(`Scheduler started. Ingesting on cron "${SCHEDULE}".`);
tick(); // run once immediately on startup
cron.schedule(SCHEDULE, tick);
