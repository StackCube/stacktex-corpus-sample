---
id: std-api-versioning
type: standard
title: URL path versioning for public APIs
summary: "Version public HTTP APIs in the URL path; a breaking change needs a new major version."
status: active
applies_to: {}
domain: [api]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# URL path versioning for public APIs

## Rules

Every public HTTP API is versioned in its URL path: `/v1/shipments`, `/v1/manifests`, and so on. The version is the first path segment after the host, never a header or a query parameter, so a version is visible in every log line, every curl command and every browser address bar without extra tooling.

A breaking change — removing a field, changing a field's type or meaning, removing an endpoint, or changing required request parameters — requires a new major version. A breaking change ships as `/v2` alongside `/v1` for at least 6 months: the new version, `/v2/...`, is added while the old version, `/v1/...`, keeps working, giving consumers time to migrate. `/v1` is not removed on the day `/v2` ships.

An additive change — a new optional field in a response, a new endpoint, a new optional query parameter — does not bump the version. Clients are expected to ignore fields and endpoints they don't recognise.

## Examples

Adding an optional `estimatedDelivery` field to the `/v1/shipments/{id}` response is additive and ships directly to `/v1`. Renaming that field to `estimatedDeliveryAt` is breaking and ships as part of `/v2/shipments/{id}`, with `/v1/shipments/{id}` continuing to return the old field name until `/v1` is retired.

## Exceptions

Internal service-to-service APIs that are not exposed publicly may use a lighter process, agreed directly between the calling and called teams, since both sides can coordinate a deploy. This standard applies to any API reachable from outside Tidewater's network.
