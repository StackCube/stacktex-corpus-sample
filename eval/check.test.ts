// Consistency checks for the sample corpus and its eval questions.
// Until the CLI exists (M1), this stands in for `stacktex lint`: it checks what the eval relies on.
import { describe, expect, test } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

const root = join(import.meta.dir, "..");
type Fm = {
  id: string; status: string; title: string; summary: string; domain: string[];
  applies_to: { paths?: string[]; languages?: string[]; platforms?: string[] };
  supersedes?: string[]; superseded_by?: string[]; review_by: string;
};
type Doc = { path: string; fm: Fm; body: string };
type Question = {
  id: string; q: string; scope: { languages?: string[]; platforms?: string[]; path?: string };
  expected_ids: string[]; forbidden_ids: string[]; max_find_calls: number;
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".") || name === "node_modules") return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith(".md") ? [full] : [];
  });
}

const docs: Doc[] = walk(root).flatMap((full) => {
  const text = readFileSync(full, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return m ? [{ path: relative(root, full), fm: parse(m[1]) as Fm, body: m[2] }] : [];
});
const byId = new Map(docs.map((d) => [d.fm.id, d]));
const vocab = parse(readFileSync(join(root, "stacktex.yaml"), "utf8"));
const questions: Question[] = parse(readFileSync(join(root, "eval/questions.yaml"), "utf8"));

// copy of stacktex-contract v0.1.0 test/ref/applies-to.ts; replaced by stacktex lint in M1
const glob = (g: string) => {
  const segs = g.split("/");
  let re = "^";
  segs.forEach((s, i) => {
    const last = i === segs.length - 1;
    if (s === "**") { re += last ? ".+" : "(?:[^/]+/)*"; return; }
    re += s.replace(/[.+^$(){}|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
    if (!last) re += "/";
  });
  // u: `?` and `[^/]` match one code point, not one UTF-16 unit. s: `.` also matches LF.
  return new RegExp(re + "$", "su");
};
const overlaps = (d?: string[], s?: string[]) => !d?.length || !s?.length || d.some((x) => s.includes(x));
const inScope = (fm: Fm, s: Question["scope"]) =>
  overlaps(fm.applies_to.languages, s.languages) &&
  overlaps(fm.applies_to.platforms, s.platforms) &&
  (!fm.applies_to.paths?.length || s.path === undefined || fm.applies_to.paths.some((p) => glob(p).test(s.path!)));

describe("corpus", () => {
  test("has 20 documents with unique ids", () => {
    expect(docs.length).toBe(20);
    expect(byId.size).toBe(20);
  });

  test.each(docs.map((d) => [d.path, d] as const))("vocabulary: %s", (_p, d) => {
    for (const x of d.fm.domain) expect(vocab.domains, `${d.path} domain ${x}`).toContain(x);
    for (const x of d.fm.applies_to.languages ?? []) expect(vocab.languages, `${d.path} language ${x}`).toContain(x);
    for (const x of d.fm.applies_to.platforms ?? []) expect(vocab.platforms, `${d.path} platform ${x}`).toContain(x);
  });

  test("supersession is symmetric and statuses agree", () => {
    for (const d of docs) {
      for (const s of d.fm.supersedes ?? []) expect(byId.get(s)?.fm.superseded_by ?? [], `${d.fm.id} supersedes ${s}`).toContain(d.fm.id);
      for (const s of d.fm.superseded_by ?? []) expect(byId.get(s)?.fm.supersedes ?? [], `${d.fm.id} superseded_by ${s}`).toContain(d.fm.id);
      expect(d.fm.status === "superseded", `${d.fm.id} status vs superseded_by`).toBe((d.fm.superseded_by ?? []).length > 0);
    }
  });

  test("the Go Kafka chain is three steps long and ends at franz-go", () => {
    expect(byId.get("adr-0001-go-kafka-client-sarama")!.fm.superseded_by).toEqual(["adr-0004-go-kafka-client-confluent"]);
    expect(byId.get("adr-0004-go-kafka-client-confluent")!.fm.superseded_by).toEqual(["adr-0007-go-kafka-client-franz-go"]);
    expect(byId.get("adr-0007-go-kafka-client-franz-go")!.fm.status).toBe("active");
  });

  test("the synonym decoy avoids its question's key terms", () => {
    const d = byId.get("adr-0002-event-backbone-kafka")!;
    const text = `${d.fm.title}\n${d.fm.summary}\n${d.body}`.toLowerCase();
    for (const w of ["pub/sub", "pubsub", "publish/subscribe", "asynchronous", "async", "communication", "broker", "message bus"]) {
      expect(text.includes(w), `adr-0002 contains "${w}"`).toBe(false);
    }
  });

  test("no review_by falls before 2027-06-30", () => {
    for (const d of docs) expect(d.fm.review_by >= "2027-06-30", d.fm.id).toBe(true);
  });

  const schemaPath = join(root, "..", "contract", "schemas", "frontmatter.json");
  test.skipIf(!existsSync(schemaPath))("every document is valid against the contract schema (needs ../contract)", () => {
    const ajv = new Ajv2020({ strict: true, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf8")));
    for (const d of docs) expect(validate(d.fm), `${d.path}: ${JSON.stringify(validate.errors)}`).toBe(true);
  });
});

describe("eval questions", () => {
  test("ids are unique and there are at least 10", () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  test.each(questions.map((q) => [q.id, q] as const))("question: %s", (_id, q) => {
    expect(q.q.length).toBeGreaterThan(0);
    expect(q.q.length).toBeLessThanOrEqual(256);
    expect(q.expected_ids.length).toBeGreaterThan(0);
    expect(q.max_find_calls).toBeGreaterThanOrEqual(1);
    expect(q.max_find_calls).toBeLessThanOrEqual(2);
    for (const id of [...q.expected_ids, ...q.forbidden_ids]) expect(byId.has(id), `${q.id}: unknown id ${id}`).toBe(true);
    for (const id of q.expected_ids) {
      expect(q.forbidden_ids, `${q.id}: ${id} both expected and forbidden`).not.toContain(id);
      const fm = byId.get(id)!.fm;
      expect(fm.status, `${q.id}: expected ${id} is not active`).toBe("active");
      expect(inScope(fm, q.scope), `${q.id}: expected ${id} is outside the scope`).toBe(true);
    }
    // Filters alone (status=active + scope) must exclude every forbidden id; ranking is not trusted to.
    for (const id of q.forbidden_ids) {
      const fm = byId.get(id)!.fm;
      expect(fm.status !== "active" || !inScope(fm, q.scope), `${q.id}: forbidden ${id} survives the filters`).toBe(true);
    }
  });
});
