---
id: adr-0007-go-kafka-client-franz-go
type: adr
title: franz-go for Kafka in Go services
summary: "Use franz-go (kgo) for all Kafka producers and consumers in Go services."
status: active
applies_to: {languages: [go]}
domain: [messaging]
supersedes: [adr-0004-go-kafka-client-confluent]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# franz-go for Kafka in Go services

## Context

ADR-0004 moved Go services from sarama to confluent-kafka-go. That library wraps librdkafka through cgo, which broke static builds, complicated our distroless images, and made race-detector runs in CI unreliable. Consumer-group rebalances also stalled for up to a minute during deploys.

## Decision

All Go services use [franz-go](https://github.com/twmb/franz-go) (`github.com/twmb/franz-go/pkg/kgo`) for producing and consuming Kafka events. It is pure Go, supports cooperative-sticky rebalancing and idempotent producers, and needs no cgo.

## Consumer groups

- Use `kgo.ConsumerGroup` with the cooperative-sticky balancer.
- Commit offsets only after a record is fully processed. Use `kgo.DisableAutoCommit` and commit with `CommitRecords`.
- A record that fails processing after three retries goes to the `<topic>.dlq` topic, with the original partition and offset in its headers. Log the failure once, following std-structured-logging.

## Consequences

- Services on confluent-kafka-go migrate by 2027-03-31. The migration guide is in the platform wiki.
- cgo is no longer needed for Kafka, so Go services build with `CGO_ENABLED=0`.
