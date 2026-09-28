---
id: std-go-error-handling
type: standard
title: Go error handling conventions
summary: "Wrap errors with %w, use sentinel errors for expected cases, never panic across packages."
status: active
applies_to: {languages: [go]}
domain: [architecture]
owner: platform-team
last_reviewed: 2026-09-01
review_by: 2027-09-01
---
# Go error handling conventions

## Rules

Errors returned from a lower layer are wrapped with context using `fmt.Errorf("…: %w", err)` before being returned up the call stack, so callers can inspect the original error with `errors.Is` or `errors.As` while still getting a readable message at each layer. Expected, recoverable conditions — a record not found, a duplicate key, a validation failure — are represented as sentinel errors or typed errors declared alongside the package that returns them, not as raw strings compared with `errors.New`.

`panic` is never used outside `main` or an `init` function. A library or service package that encounters an unrecoverable condition returns an error; it does not panic and expect a caller elsewhere in the call stack to recover it. The only acceptable use of `panic` is a genuine programming invariant violation caught during startup, such as a missing required configuration value, where `main` panics rather than starting in a broken state.

## Examples

```go
var ErrShipmentNotFound = errors.New("shipment not found")

func (r *Repository) Get(id string) (*Shipment, error) {
    row, err := r.db.QueryRow(...).Scan(...)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, ErrShipmentNotFound
    }
    if err != nil {
        return nil, fmt.Errorf("querying shipment %s: %w", id, err)
    }
    return row, nil
}
```

A caller checks the sentinel with `errors.Is(err, ErrShipmentNotFound)` to return a 404, rather than comparing error strings.

## Exceptions

Code that must satisfy an external interface which panics by contract, such as some `encoding/json` `Marshaler` implementations mirroring the standard library's own behaviour, may panic internally only if it is documented in the function's comment and the panic never crosses a goroutine boundary uncaught.
