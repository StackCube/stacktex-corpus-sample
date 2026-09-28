---
id: tpl-go-service
type: template-pointer
title: Scaffold new Go services from template
summary: "Scaffold new Go services from the tidewater/go-service-template repository."
status: active
applies_to: {languages: [go]}
domain: [architecture]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Scaffold new Go services from template

## Where

New Go services are scaffolded from the `tidewater/go-service-template` repository using the GitHub CLI:

```
gh repo create tidewater/my-new-service --template tidewater/go-service-template --private
```

The template already follows std-go-service-layout: it ships with `cmd/<service>/main.go`, an `internal/` tree with an example bounded-context package, and no `pkg/` directory. It also includes the franz-go producer and consumer wiring described in ADR-0007 pre-configured against a placeholder topic, along with the cooperative-sticky consumer group setup and the `<topic>.dlq` handling convention, so a new service starts with Kafka access already working correctly rather than every team re-implementing it from the ADR by hand.

## When to use

Use the template whenever starting a genuinely new Go service — a new deployable, with its own `cmd/` entry point and its own repository. It is not the right starting point for adding a new bounded-context package inside an existing service, since that just means adding a new package under that service's existing `internal/` tree, following the layout the existing service already has. It is also not a fit for a one-off script or a CLI tool used only by engineers locally, which does not need the template's Kafka wiring, HTTP server scaffolding or deployment manifests, and would be needlessly heavy for that use.
