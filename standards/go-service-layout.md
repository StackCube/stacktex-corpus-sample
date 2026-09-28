---
id: std-go-service-layout
type: standard
title: Go service directory layout
summary: "Directory layout, package boundaries and main.go conventions for Go services."
status: active
applies_to: {languages: [go]}
domain: [architecture]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Go service directory layout

## Rules

Every Go service follows the same top-level layout. The entry point lives at `cmd/<service>/main.go`; everything else the service needs lives under `internal/`, organized into one package per bounded context (for example `internal/shipment`, `internal/billing`). There is no `pkg/` directory: nothing in a Tidewater Go service is meant to be imported by another repository, so there is no reason to mark any package as "public" by convention. Code shared across services belongs in a separate library module, not in a service's `pkg/`.

`main.go` only wires dependencies together: it reads configuration, constructs clients and repositories, and starts the server or worker loop. It contains no business logic and no HTTP handlers. If a review finds domain logic in `main.go`, that logic should move into the relevant `internal/` package.

## Examples

A shipment-tracking service looks like:

```
cmd/shipment-tracker/main.go
internal/shipment/service.go
internal/shipment/repository.go
internal/httpapi/handlers.go
```

`main.go` constructs a `shipment.Repository`, a `shipment.Service`, and an `httpapi.Server`, then calls `server.ListenAndServe()`. All shipment business rules live in `internal/shipment`, not in `main.go` or in `internal/httpapi`.

## Exceptions

A service with more than one binary, such as a server and a worker sharing the same domain code, may have multiple `cmd/<service>-<binary>/main.go` entries under one repository, all importing the same `internal/` packages. This is the only case where a service directory has more than one `main.go`.
