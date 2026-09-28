---
id: adr-0005-python-kafka-client
type: adr
title: confluent-kafka-python for Kafka in Python services
summary: "Python services use confluent-kafka-python to produce and consume Kafka events."
status: active
applies_to: {languages: [python]}
domain: [messaging]
owner: data-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# confluent-kafka-python for Kafka in Python services

## Context

Tidewater's data platform runs several Python services that consume shipment and billing events for enrichment and analytics pipelines. These services needed a Kafka client with solid support for consumer groups, manual offset commits, and Avro/JSON schema-registry integration, matching the guarantees Go services already had through their Kafka client.

## Decision

Python services use `confluent-kafka-python` to produce and consume Kafka events. Like `confluent-kafka-go`, which Go services used under ADR-0004 (since superseded by ADR-0007), it wraps librdkafka, giving it mature consumer-group support, cooperative-sticky rebalancing, and schema-registry integration through `confluent_kafka.schema_registry`. Each Python service runs exactly one consumer group per service, named `<service-name>` with no shared groups between services, so that scaling a service's replica count scales its consumption in step without another service's consumption being affected.

Offsets are committed manually after a record is fully processed, not on an automatic timer. A record that fails processing after three retries is published to the `<topic>.dlq` topic with the original partition and offset attached as headers, the same convention Go services follow under ADR-0007, so that DLQ tooling and on-call runbooks work the same way regardless of which language produced the failure.

## Consequences

Python and Go services now share the same DLQ shape, so a single runbook and a single DLQ-replay tool cover both. Engineers moving between Python and Go services see a familiar consumer-group and retry model. The main cost is that confluent-kafka-python, like its Go counterpart, depends on librdkafka, which occasionally requires attention when base images are updated, but this cost is accepted as consistent with the rest of the Kafka client fleet.
