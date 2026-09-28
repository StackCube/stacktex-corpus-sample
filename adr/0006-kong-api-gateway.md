---
id: adr-0006-kong-api-gateway
type: adr
title: Kong as the public API gateway (deprecated)
summary: "Deprecated: route public APIs through the self-managed Kong gateway."
status: deprecated
applies_to: {platforms: [aws]}
domain: [api]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Kong as the public API gateway (deprecated)

## Context

Tidewater Freight has routed all public HTTP APIs through a self-managed Kong gateway running on EC2 since the company's public API first launched. Kong gave us rate limiting, API-key management and request logging in one place, ahead of any AWS-native alternative being mature enough for our needs at the time.

## Decision

Public APIs are routed through the self-managed Kong gateway. Operating this decision has since become the more expensive option: the platform team maintains Kong's EC2 fleet, its Postgres backing store and its plugin configuration by hand, and every gateway upgrade is a manual, coordinated change. This decision is now deprecated.

The gateway is being retired in favour of an AWS-managed API Gateway, though no ADR has yet been written to record the replacement decision or its migration plan. Until that ADR exists, Kong remains in production for existing APIs.

New APIs must not be added to Kong. Teams building a new public API should raise this with the platform team so a temporary routing approach can be agreed while the AWS API Gateway migration is designed, rather than adding another API to a gateway that is being phased out.

## Consequences

Existing APIs continue running on Kong until the replacement is designed and an ADR is written. Adding no new APIs to Kong caps the size of the eventual migration rather than letting it grow. Teams should expect a follow-up ADR describing the AWS API Gateway migration path and timeline.
