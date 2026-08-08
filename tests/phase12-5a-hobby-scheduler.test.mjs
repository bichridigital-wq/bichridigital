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

test("le scheduler Hobby est présent sans cron Vercel incompatible", async () => {
  await stat(workflowPath);
  await assert.rejects(stat(vercelConfigPath), { code: "ENOENT" });
});

test("le workflow utilise uniquement schedule et workflow_dispatch", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /^on:\s*\n\s{2}schedule:/m);
  assert.match(workflow, /cron:\s*["']\*\/5 \* \* \* \*["']/);
  assert.match(workflow, /^\s{2}workflow_dispatch:\s*$/m);
  assert.doesNotMatch(workflow, /\b(push|pull_request):/);
  assert.doesNotMatch(workflow, /actions\/checkout/);
});

test("l’appel HTTP est borné, silencieux et échoue hors 2xx", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /runs-on:\s*ubuntu-latest/);
  assert.match(workflow, /curl --fail --silent --show-error/);
  assert.match(workflow, /--max-time 30/);
  assert.match(workflow, /--request GET/);
  assert.match(workflow, /--output \/dev\/null/);
  assert.match(
    workflow,
    /https:\/\/www\.bichridigital\.com\/api\/internal\/push\/live-check/,
  );
});

test("le secret vient uniquement du coffre GitHub", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(
    workflow,
    /CRON_SECRET:\s*\$\{\{ secrets\.BICHRIDIGITAL_CRON_SECRET \}\}/,
  );
  assert.match(workflow, /Authorization: Bearer \$CRON_SECRET/);
  assert.doesNotMatch(workflow, /Authorization: Bearer [^$\s]/);
  assert.doesNotMatch(workflow, /ExponentPushToken|expo_push_token/);
});

test("la route et le mode sûr Phase 12.5A restent en place", async () => {
  const [route, service] = await Promise.all([
    readFile(routePath, "utf8"),
    readFile(servicePath, "utf8"),
  ]);
  assert.match(route, /export async function GET\(request: Request\)/);
  assert.match(route, /request\.headers\.get\("authorization"\)/);
  assert.match(route, /`Bearer \$\{cronSecret\}`/);
  assert.match(route, /checkLiveStartAutomation\(\)/);
  assert.match(
    service,
    /process\.env\.PUSH_LIVE_AUTOMATION_ENABLED === "true"/,
  );
});
