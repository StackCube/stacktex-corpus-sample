---
id: std-typescript-lint
type: standard
title: Shared ESLint and tsconfig for TypeScript
summary: "Shared ESLint flat config and strict tsconfig settings for TypeScript projects."
status: active
applies_to: {languages: [typescript], paths: ["**/*.ts", "**/*.tsx"]}
domain: [delivery]
owner: web-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Shared ESLint and tsconfig for TypeScript

## Rules

Every TypeScript project depends on `@tidewater/eslint-config` and extends its flat config rather than assembling its own ESLint rule set. This keeps lint behaviour consistent across the web team's repositories and means a rule change only needs to happen in one package for it to reach every project on its next dependency bump.

Every project's `tsconfig.json` sets `strict: true` and `noUncheckedIndexedAccess: true`. `strict` catches the usual class of null and implicit-any bugs; `noUncheckedIndexedAccess` additionally requires that indexing into an array or a record be treated as possibly `undefined`, which has caught a meaningful number of production bugs where code assumed a lookup always succeeded.

## Examples

```json
{
  "extends": "@tidewater/eslint-config"
}
```

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

With `noUncheckedIndexedAccess` on, `const x = records[id]` has type `Record | undefined`, and the compiler forces a check before `x` is used, rather than allowing a silent `undefined` to flow further into the program.

## Exceptions

Generated code, such as OpenAPI client types produced by a code generator, is excluded from linting via an `ignorePatterns` entry, since it is not hand-edited and regenerating it does not go through code review. Generated code is not exempt from the `tsconfig.json` strict settings if it is imported by hand-written code; only the lint pass is skipped.
