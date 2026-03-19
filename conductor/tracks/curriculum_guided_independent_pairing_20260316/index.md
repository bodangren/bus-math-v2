# Track: Curriculum Guided/Independent Practice Rollout

Roll out the canonical `practice.v1` modes across authored lessons so instruction, guided practice, independent practice, and assessment phases each use the right practice configuration.

## Artifacts

- **Specification**: [./spec.md](./spec.md)
- **Implementation Plan**: [./plan.md](./plan.md)

## Summary

This rollout now represents the residual authored-curriculum scope after the `practice_*` sequence establishes the shared target. It then updates authored curriculum content so:

1. instruction phases can use worked examples or teacher models when appropriate
2. guided practice is scaffolded
3. independent practice uses distinct ids and fresher data
4. assessment phases keep the right contract behavior
5. manifest and curriculum regressions prevent future drift

This track no longer owns contract definition, normalized submission persistence, generic teacher review, or family-level component migrations. Those concerns belong to the preceding `practice_*` tracks.

## Dependencies

- Practice Component Contract Foundation
- Practice Submission Evidence and Teacher Review
- Practice Component Legacy Backfill

## Progress

See [./plan.md](./plan.md) for detailed task status.
