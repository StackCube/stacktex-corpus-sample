---
id: guide-terraform-modules
type: guide
title: Using Tidewater's shared Terraform modules
summary: "How to consume and publish Tidewater's shared Terraform modules."
status: active
applies_to: {platforms: [terraform], paths: ["infra/**", "**/*.tf"]}
domain: [delivery]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Using Tidewater's shared Terraform modules

## Steps

Tidewater's shared Terraform modules — for things like an ECS service, an RDS instance, or a standard VPC — are published to a private Terraform registry. To consume one, reference it by registry source and a pinned version, never a branch or an unpinned range:

```hcl
module "shipment_service" {
  source  = "app.terraform.io/tidewater/ecs-service/aws"
  version = "3.4.1"
}
```

Pinning to an exact version means a module maintainer publishing a new version never silently changes what your `terraform plan` shows; you upgrade deliberately by bumping the version string and reviewing the module's changelog first.

To publish a change to a shared module, merge your change to the module repository's default branch, then tag the resulting commit `vX.Y.Z` following semantic versioning — a patch for a bug fix, a minor version for a backward-compatible addition, and a major version for anything that requires consumers to change their own configuration. Pushing the tag triggers the registry publish automatically; there is no separate manual publish step.

## Troubleshooting

If `terraform init` can't find a module version, confirm the tag was pushed, not just created locally — `git push --tags` or an explicit `git push origin vX.Y.Z` is required. If a module upgrade produces an unexpected plan, check the module's changelog for the version range you crossed; a major version bump is expected to require configuration changes, and skipping several major versions at once compounds them.
