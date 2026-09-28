---
id: pol-data-retention
type: policy
title: Retention periods for logs and backups
summary: "Retention periods for operational data, logs and backups."
status: active
applies_to: {}
domain: [data]
owner: data-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Retention periods for logs and backups

## Policy

Operational data at Tidewater is retained for a fixed period depending on its kind. Application logs — the JSON logs services emit for debugging and observability — are retained for 30 days, after which they are deleted from the log backend. Audit logs, which record security-relevant events such as authentication, authorization decisions and changes to secrets, are retained for 1 year, reflecting their use in incident investigation and compliance reviews long after the event occurred. Database backups are retained for 35 days, giving enough overlap to recover from an issue discovered up to a month after it happened, without keeping backups indefinitely.

## Scope

These periods apply to every production service and every production database at Tidewater. Non-production environments may use shorter retention at each team's discretion, but never longer than production's periods, since staging and development environments should not become a place where old data lingers past its production equivalent.

## Enforcement

Retention is enforced automatically wherever possible: log backend indices older than 30 days are deleted by a scheduled job, audit log storage has a 1-year lifecycle policy, and backup storage has a 35-day lifecycle policy. Any exception — a longer retention period needed for a specific investigation — requires a written request to the data team and is time-boxed, not indefinite.
