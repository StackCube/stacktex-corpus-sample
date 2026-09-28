# stacktex-corpus-sample

A sample [stacktex](https://stackcube.dev) corpus: twenty ADRs, standards, policies and guides for **Tidewater Freight**, a fictional logistics company. It backs the stacktex hosted demo and is a starting point for your own corpus.

## Start your own corpus

1. Fork or copy this repo.
2. Edit `stacktex.yaml` to hold your vocabulary: the domains, languages and platforms your documents may use.
3. Replace the documents. Any `*.md` with a frontmatter block is a document; layout is up to you. The frontmatter contract is in the stacktex docs.
4. Run `stacktex lint` in CI.

## What's in here

| Folder | Type |
|---|---|
| `adr/` | Architecture decision records, including a three-step supersession chain for the Go Kafka client |
| `standards/` | Engineering standards |
| `policies/` | Security and data policies |
| `guides/` | How-to guides |
| `templates/` | Pointers to template repositories |
| `eval/` | Retrieval evaluation questions and a consistency check |

Everything here is fiction.
