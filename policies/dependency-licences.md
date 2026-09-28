---
id: pol-dependency-licences
type: policy
title: Permitted open-source licences for dependencies
summary: "Which open-source licences are permitted, need review, or are forbidden for dependencies."
status: active
applies_to: {}
domain: [dependencies, security]
owner: security-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Permitted open-source licences for dependencies

## Policy

Every dependency Tidewater ships, directly or transitively, falls into one of three licence categories. Permitted licences may be used without further review: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause and ISC. These are the licences our legal counsel has already reviewed against Tidewater's business, and engineers may add a dependency under one of these licences without asking first.

Licences requiring review are MPL-2.0 and LGPL. A dependency under either licence may be used, but only after the security team has confirmed how it is linked and distributed, since both licences carry copyleft obligations that depend on those details. Do not add an MPL-2.0 or LGPL dependency to a shipping product without that review completing first.

Forbidden licences are AGPL-3.0, SSPL, and any licence that has not received OSI approval. AGPL-3.0's network-use clause and SSPL's terms around offering the software as a service are both incompatible with how Tidewater operates its own services, and an unapproved licence carries legal risk that has not been evaluated at all. No dependency under a forbidden licence may be added, regardless of how it is used.

## Scope

This policy covers every dependency in every Tidewater repository, including build-time and test-only dependencies, not just those that ship in a production artifact.

## Enforcement

A licence-scanning step runs in CI on every dependency change and fails the build if a forbidden licence is introduced, or if a review-required licence is added without an approval recorded by the security team. Existing dependencies are re-scanned quarterly in case an upstream project changes its licence.
