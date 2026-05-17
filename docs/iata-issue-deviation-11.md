<!--
Draft of the issue body to file at:
  https://github.com/IATA-Cargo/ONE-Record/issues/new

Recommended title:
  [Orch] STATE_DIAGRAM source-state keys for BookingOption don't match optionStatus enum (§5.4)

Convention notes (matching the existing issue style at IATA-Cargo/ONE-Record):
  - [Orch] tag for state-machine / orchestration concerns (cf. #384)
  - "### Problem statement" / "### Proposed solution" template (cf. #384)
  - Spec section reference in title where applicable
  - Concise — one technical concern per issue

Delete this comment block before pasting into GitHub.
-->

### Problem statement

Spec §5.4 `STATE_DIAGRAM.BookingOption` and the data-model `BookingOption.optionStatus` enum disagree on what the source state of a transition is, with no overlap.

A natural reading of §5.4 is that a `BookingOption`'s permitted transitions are gated by its own `optionStatus` field — i.e. `STATE_DIAGRAM.BookingOption[opt.optionStatus][action]` should resolve to the next state.

In practice the two namespaces don't intersect:

| Source | Values |
|---|---|
| `STATE_DIAGRAM.BookingOption` (state-machine source-state keys) | `REQUEST_PENDING` |
| `BookingOptionSchema.optionStatus` (data-model enum) | `OPTION_PROPOSED`, `OPTION_ACCEPTED`, `OPTION_REJECTED` |

So `STATE_DIAGRAM.BookingOption[opt.optionStatus]` is always `undefined`, regardless of what value `opt.optionStatus` holds. An implementation that drives the state machine off `optionStatus` would reject every transition (`forbidden_state_transition`).

Two related observations from the same area:

1. **`OPTION_REVOKED` is not in the schema enum** even though `revokeBookingOption` is one of the four documented transitions in §5.4. Any implementation of revoke has to pick a status value not in the enum, or reuse `OPTION_REJECTED` (which is what we currently do, and clearly wrong).
2. The four `*BookingOption` transitions (`acceptBookingOption`, `rejectBookingOption`, `revokeBookingOption`, plus `acceptBookingOptionViaRequest` per §5.2/§5.4) all have to hardcode `'REQUEST_PENDING'` as the source state to keep the state-machine call resolvable. There's no implementation that can read the source state from `opt.optionStatus` until this is reconciled.

### Proposed solution

Two coherent reconciliation paths; either resolves the inconsistency without splitting the spec into edge cases:

**(a) Align the state-machine to the data-model** — change `STATE_DIAGRAM.BookingOption` source-state keys to `OPTION_PROPOSED` / `OPTION_ACCEPTED` / `OPTION_REJECTED`, and add `OPTION_REVOKED` to `BookingOptionSchema.optionStatus`. Implementations would then read `opt.optionStatus` directly. Higher implementation churn for spec authors but simpler downstream.

**(b) Align the data-model to the state-machine** — replace `BookingOption.optionStatus` enum values with `REQUEST_PENDING` / `REQUEST_ACCEPTED` / `REQUEST_REJECTED` / `REQUEST_REVOKED` to match the existing `STATE_DIAGRAM` keys (and harmonise with `BookingOptionRequest.requestStatus`, which already uses the `REQUEST_*` namespace). Lower spec churn but reuses the `REQUEST_*` namespace for two distinct LOs.

Path (a) is closer to the §5.2 wording and the `OPTION_*` vocabulary already used in `BookingOption`; path (b) is closer to the §5.4 state-diagram and minimises the changes to existing implementations that already follow the diagram literally. Either way, **the schema enum and state-machine keys need to land in the same namespace**, and `OPTION_REVOKED` (or its `REQUEST_*` equivalent) needs to be reachable.

### Context

Found while building an open-source TypeScript reference implementation of the data model + API. The deviation is documented (with a workaround that hardcodes `'REQUEST_PENDING'`) at:

- spec-deviation registry: https://github.com/tjo099/onerecord-mapper/blob/main/docs/spec-deviations.md#11
- transition wrappers: https://github.com/tjo099/onerecord-mapper/blob/main/src/booking-flow/transitions.ts
- v0.2.0 CHANGELOG (#11): https://github.com/tjo099/onerecord-mapper/blob/main/CHANGELOG.md

Happy to update the implementation against whichever direction the working group settles on.
