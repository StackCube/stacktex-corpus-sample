---
id: adr-0008-otel-logs
type: adr
title: OpenTelemetry logs via OTLP (draft)
summary: "Draft: replace JSON log shipping with OpenTelemetry logs exported over OTLP."
status: draft
applies_to: {}
domain: [observability]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# OpenTelemetry logs via OTLP (draft)

## Context

Tidewater's services currently ship JSON logs to our log backend using a Fluent Bit sidecar that tails stdout and forwards over HTTP. This works, but it means logs, traces and metrics use three different pipelines with three different correlation stories, and adding a new log destination means reconfiguring every Fluent Bit sidecar in the fleet.

## Decision

This ADR proposes replacing JSON log shipping with OpenTelemetry logs, exported over OTLP from an OpenTelemetry Collector sidecar or daemonset instead of Fluent Bit. Services would keep emitting structured JSON to stdout as they do today; the change is in how those lines are collected and forwarded, not in the log format itself. The Collector would attach trace and span IDs where available, aligning log correlation with the tracing pipeline already in place.

This decision is not yet approved; follow std-structured-logging until this is accepted. It is a proposal only, open for comment from the platform and observability teams. Until it is accepted, services should continue to follow std-structured-logging for their log format and continue shipping through the existing Fluent Bit pipeline; no service should adopt OTLP log export ahead of this ADR being accepted.

## Consequences

If accepted, this would let Tidewater manage one collector configuration for logs, traces and metrics instead of a separate Fluent Bit configuration per fleet. It would also require validating that OTLP log export handles our current log volume without dropping records, which has not yet been tested at production scale. No consequence described here is final until the ADR is accepted.
