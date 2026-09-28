---
id: adr-0001-go-kafka-client-sarama
type: adr
title: sarama for Kafka in Go services
summary: "Use Shopify's sarama as the Kafka client library for Go services."
status: superseded
applies_to: {languages: [go]}
domain: [messaging]
superseded_by: [adr-0004-go-kafka-client-confluent]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# sarama for Kafka in Go services

## Context

In 2021, Tidewater Freight's platform team needed a Kafka client library for the first generation of Go services publishing shipment events. At the time only a handful of Go Kafka libraries existed, and most were incomplete or unmaintained forks. We needed something already running in production elsewhere, with active maintenance, without introducing a dependency we would have to fork ourselves.

## Decision

We chose `github.com/Shopify/sarama` as the Kafka client library for all Go services. sarama was mature by 2021 standards: it had years of production use at Shopify and other companies, broad protocol support, and a straightforward producer/consumer API that didn't require deep Kafka protocol knowledge from every engineer touching a service. It is a pure Go implementation with no cgo dependency, which fit our static-binary build pipeline.

## Consequences

Adopting sarama let early services ship without spending engineering time evaluating alternatives. Its consumer-group implementation, however, proved to have rough edges: rebalances were slow, and error handling around partial batch failures needed custom retry logic in every service. As Tidewater's Kafka usage grew and confluent's official Go client matured, the case for switching strengthened. This decision is superseded by ADR-0004, which moves Go services to confluent-kafka-go for better maintenance guarantees and clearer semantics around delivery reports.
