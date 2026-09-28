---
id: guide-local-kafka
type: guide
title: Run Kafka locally with docker compose
summary: "Run Kafka locally with docker compose for development and integration tests."
status: active
applies_to: {platforms: [docker]}
domain: [messaging]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Run Kafka locally with docker compose

## Steps

Clone `tidewater/dev-stack`, which holds the docker compose file shared by every team for local development. From that repository, run `docker compose up kafka` to start a single-broker Kafka instance along with its schema registry and a Kafka UI on `localhost:8080`. The first start takes a little longer while images are pulled; subsequent starts are quick.

Create the topics your service needs with the bundled CLI:

```
docker compose exec kafka kafka-topics --create \
  --topic shipping.manifest.closed \
  --bootstrap-server localhost:9092 \
  --partitions 3 --replication-factor 1
```

Point your service at `localhost:9092` for the bootstrap servers and `localhost:8081` for the schema registry, matching the ports the compose file exposes. Both match the values services use against MSK in every other environment, so no service code needs an environment-specific branch for local development.

To reset a consumer group's offsets, for example to reprocess a topic from the beginning while debugging:

```
docker compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group my-service --topic shipping.manifest.closed \
  --reset-offsets --to-earliest --execute
```

## Troubleshooting

If `docker compose up kafka` fails to become healthy, check that no other process on your machine is already bound to port 9092 or 8081; a leftover Kafka process from a previous session is the most common cause. If a consumer appears stuck and not receiving records, confirm its consumer group isn't already caught up — the Kafka UI at `localhost:8080` shows per-partition lag and is usually faster to check than the CLI. Deleting and recreating the `dev-stack` volumes with `docker compose down -v` clears out corrupted local state as a last resort.
