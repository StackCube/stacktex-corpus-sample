---
id: adr-0002-event-backbone-kafka
type: adr
title: Kafka is the event backbone
summary: "Kafka on Amazon MSK is the event backbone; services publish domain events to it."
status: active
applies_to: {}
domain: [messaging, architecture]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Kafka is the event backbone

## Context

Tidewater Freight's services increasingly need to react to events happening in other parts of the system: a shipment created, a manifest closed, a driver assigned. Before this decision, services called each other directly over HTTP for this, which created tight coupling and made it hard to add a new service that cared about an existing event without changing the service that produced it.

## Decision

Kafka, running on Amazon MSK, is the event backbone for Tidewater Freight. Services emit domain events to Kafka topics instead of calling downstream services directly. Topics are named `<domain>.<entity>.<event>`, for example `shipping.manifest.closed` or `fleet.driver.assigned`. The domain segment matches one of the domains in this corpus's vocabulary, so topic ownership lines up with document ownership.

Every event schema is registered in the schema registry before a producer ships it, and consumers validate incoming records against the registered schema. This catches incompatible changes before they reach a consumer, rather than after.

The team that owns a domain owns every topic under that domain's prefix: it decides the schema, decides when a new event type is added, and is the point of contact for any service that wants to add a new topic under its prefix. Consumers do not write to topics they don't own, and any change to an existing schema must be backward compatible or ship as a new topic name.

## Consequences

New services can react to existing events without the producing service knowing they exist. Amazon MSK removes the operational burden of running Kafka clusters ourselves: upgrades, disk management and multi-AZ replication are handled by AWS. Producers take on more responsibility for schema quality, since a bad schema now affects every downstream consumer at once rather than a single caller.
