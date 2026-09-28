---
id: pol-pii-in-logs
type: policy
title: No personal data in logs
summary: "Personal data must never be logged; mask identifiers and drop request payloads."
status: active
applies_to: {}
domain: [security, observability]
owner: security-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# No personal data in logs

## Policy

Logs must never contain personal data. This means email addresses, full names, phone numbers and payment data — card numbers, bank details, anything used to charge or pay a customer — must not appear in a log line, at any level, in any environment. Where a log needs to identify which customer a request concerns, it logs the customer id only, never any personal attribute of that customer.

Request and response bodies are dropped from error logs entirely, rather than logged with fields redacted, because a body's shape changes over time and a redaction list drifts out of date. If a body must be inspected to debug an error, that inspection happens in a controlled environment with access logging of its own, not by writing the body into the general log stream.

## Scope

This policy applies to every service's application logs, access logs and error-tracking integration. It does not apply to data held in the primary database or in a purpose-built, access-controlled audit store, which are covered by pol-data-retention and separate access-control policies.

## Enforcement

Logging libraries used at Tidewater are configured with a field allowlist for anything derived from a request, so a new field added to a request object does not automatically start appearing in logs. Log samples are reviewed periodically by the security team, and any personal data found triggers an incident: the offending log lines are purged from the log backend and the code path that logged them is fixed.
