---
id: pol-secrets-handling
type: policy
title: Secrets in AWS Secrets Manager
summary: "Secrets live in AWS Secrets Manager, never in env files, images or repositories."
status: active
applies_to: {}
domain: [security]
owner: security-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Secrets in AWS Secrets Manager

## Policy

All secrets — database passwords, API keys, signing keys, third-party credentials — live in AWS Secrets Manager. They are never committed to a repository, baked into a container image, or written into a `.env` file that is deployed to any environment. On Kubernetes, the External Secrets Operator syncs secrets from AWS Secrets Manager into Kubernetes `Secret` objects, which are then mounted into pods; no team manages Kubernetes secrets by hand or applies them from a local YAML file containing real values.

Database passwords rotate automatically every 30 days. Rotation is handled by AWS Secrets Manager's rotation Lambda for supported databases, and the External Secrets Operator picks up the new value on its next sync without requiring a manual restart, since services are expected to reload credentials rather than caching them for the lifetime of the process.

## Scope

This policy covers every environment except an individual engineer's local machine. Locally, `.env` files are permitted, but they hold fake, non-functioning values only — a local Postgres password for a database running in Docker, not a copy of any staging or production credential. No real secret is ever written into a `.env` file, checked in or not.

## Enforcement

Secret-scanning runs on every pull request and blocks merges that introduce a value matching known credential patterns. Any real secret found in a repository, image, or `.env` file committed to version control is rotated immediately, whether or not it appears to have been used, and the incident is reported to the security team.
