import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL(
  "../.github/workflows/live-push-check.yml",
  import.meta.url,
);
const vercelConfigPath = new URL("../vercel.json", import.meta.url);
const routePath = new URL(
  "../app/api/internal/push/live-check/route.ts",
  import.meta.url,
);
const servicePath = new URL("../lib/push/service.ts", import.meta.url);
const cronAuthPath = new URL("../lib/push/cron-auth.ts", import.meta.url);

test("le scheduler GitHub obsolète est absent sans cron Vercel incompatible", async () => {
  await assert.rejects(stat(workflowPath), { code: "ENOENT" });
  await assert.rejects(stat(vercelConfigPath), { code: "ENOENT" });
});

test("la route et le mode sûr Phase 12.5A restent en place", async () => {
  const [route, service, cronAuth] = await Promise.all([
    readFile(routePath, "utf8"),
    readFile(servicePath, "utf8"),
    readFile(cronAuthPath, "utf8"),
  ]);
  assert.match(route, /export async function GET\(request: Request\)/);
  assert.match(route, /hasValidCronAuthorization\(request\)/);
  assert.match(cronAuth, /request\.headers\.get\("authorization"\)/);
  assert.match(cronAuth, /`Bearer \$\{cronSecret\}`/);
  assert.match(route, /checkLiveStartAutomation\(\)/);
  assert.match(
    service,
    /process\.env\.PUSH_LIVE_AUTOMATION_ENABLED === "true"/,
  );
});
