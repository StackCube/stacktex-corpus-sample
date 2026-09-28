---
id: std-structured-logging
type: standard
title: Structured JSON logging for services
summary: "All services emit JSON logs with trace_id, service and level; errors are logged once, at the boundary."
status: active
applies_to: {}
domain: [observability]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Structured JSON logging for services

## Rules

Every service emits logs as single-line JSON objects. Each log line carries five required fields: `ts` (RFC 3339 timestamp), `level`, `service` (the service's name as registered in its Go service layout or Python service scaffold), `trace_id` (empty string if no trace is active), and `msg`. Additional fields are encouraged for context, but these five are never omitted.

Go services use the standard library's `slog` package configured with a JSON handler, so the required fields are set once in a shared logger constructor rather than repeated at every call site. Python services use `structlog` configured with a JSON renderer and the same field names, so a log line looks the same whether it came from a Go or a Python service.

An error is logged once, at the boundary where it is handled — the HTTP handler that turns it into a response, or the top of a worker's processing loop — and not again at every layer it passed through on its way up. A function that wraps and returns an error should not also log it; logging and returning the same error produces duplicate, misleading log lines for one failure.

### Consumers and workers

A Kafka consumer or background worker that fails to process a message logs that failure exactly once, including the `topic`, `partition` and `offset` the message came from, so the failure can be located and replayed. The message payload itself is never included in the log line, even on failure, since payloads may be large or contain data the log pipeline should not retain.

## Examples

```go
logger.Error("processing shipment event", "err", err, "topic", topic, "partition", partition, "offset", offset)
```

## Exceptions

Local development tooling may use a human-readable console format instead of JSON, provided the same field names are used, so that switching to JSON output for CI or production requires only a configuration change.
