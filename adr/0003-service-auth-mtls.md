---
id: adr-0003-service-auth-mtls
type: adr
title: mTLS for service-to-service auth
summary: "Services authenticate each other with mesh-issued mTLS certificates; no shared API keys."
status: active
applies_to: {platforms: [kubernetes]}
domain: [security]
owner: security-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# mTLS for service-to-service auth

## Context

Tidewater Freight runs its services on Kubernetes behind Istio. Before this decision, services that needed to call each other in-cluster shared long-lived API keys, distributed as Kubernetes secrets and rotated manually, if at all. A leaked key gave an attacker the same access as the legitimate caller, with no way to tell them apart from logs alone.

## Decision

Services authenticate each other using mesh-issued mTLS certificates. Istio's control plane issues each workload a short-lived certificate carrying a SPIFFE identity derived from its Kubernetes service account, and rotates it automatically well before expiry. The mesh terminates and verifies mTLS on both sides of every in-cluster call, so a service never sees a request that didn't come from an mTLS-verified peer.

Authorization is enforced with an Istio `AuthorizationPolicy` per service, naming the SPIFFE identities allowed to call it and which paths and methods they may use. A new caller must be added explicitly to the callee's `AuthorizationPolicy` before its calls succeed; there is no default-allow.

No service issues or accepts static API keys for service-to-service calls. API keys remain in use only for external, non-mesh clients such as partner integrations, and are out of scope for this decision.

## Consequences

A compromised pod's certificate is short-lived and identity-bound, so the blast radius of a leaked credential is far smaller than a shared key. Every in-cluster call is authenticated and can be tied back to a specific service account in logs and traces. Onboarding a new internal caller now requires a review of the callee's `AuthorizationPolicy`, adding a small amount of process overhead compared to a shared key.
