---
id: adr-0004-go-kafka-client-confluent
type: adr
title: confluent-kafka-go for Kafka in Go services
summary: "Use confluent-kafka-go for Go Kafka clients, replacing sarama."
status: superseded
applies_to: {languages: [go]}
domain: [messaging]
supersedes: [adr-0001-go-kafka-client-sarama]
superseded_by: [adr-0007-go-kafka-client-franz-go]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# confluent-kafka-go for Kafka in Go services

## Context

ADR-0001 chose sarama as Tidewater's Go Kafka client in 2021. By 2023, sarama's maintenance had slowed: releases were infrequent, several open issues around consumer-group rebalancing had sat unaddressed for over a year, and the maintainers had publicly signalled reduced capacity. Meanwhile Confluent had matured its own Go client, backed by the same battle-tested librdkafka library used by Confluent's other official clients.

## Decision

Go services replace sarama with `confluent-kafka-go`, Confluent's officially supported client. It wraps librdkafka via cgo, which gives it feature parity with Confluent's Java and Python clients, more predictable consumer-group behaviour, and a maintenance commitment backed by a company whose business depends on Kafka working correctly. Services migrate their producer and consumer code to the confluent-kafka-go API, replacing sarama's `AsyncProducer` and `ConsumerGroup` types.

## Consequences

Replacing sarama removed the maintenance risk of depending on a slowing open-source project, and gave us feature parity with Confluent's other clients across languages. The cgo dependency, however, turned out to be a real cost: it broke fully static builds, complicated the distroless base images used in production, and made race-detector runs unreliable in CI because of how librdkafka manages its own threads. Consumer-group rebalances also stalled for up to a minute during rolling deploys, disrupting throughput more than sarama's had.

These problems are significant enough that this decision is itself superseded: ADR-0007 moves Go services to franz-go specifically because it needs no cgo, resolving the build and CI issues introduced here.
