import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines Vitae Studio product metadata and landing content", async () => {
  const [layout, page] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /title:\s*"Vitae Studio"/i);
  assert.match(layout, /standard-format resume/i);
  assert.match(page, /Your experience/i);
  assert.match(page, /Europass/i);
  assert.match(page, /LaTeX/i);
  assert.doesNotMatch(layout, /codex-preview/i);
});
