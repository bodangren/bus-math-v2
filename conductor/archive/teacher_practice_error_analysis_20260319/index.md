# Track: Teacher Practice Error Analysis

Layer deterministic and AI-assisted error summaries onto normalized practice evidence so teachers can interpret student work faster without losing direct access to the underlying submission.

## Artifacts

- **Specification**: [./spec.md](./spec.md)
- **Implementation Plan**: [./plan.md](./plan.md)

## Summary

This track builds the interpretation layer on top of the practice evidence model:

1. deterministic summary assembly
2. AI-assisted interpretation with evidence grounding
3. read-only teacher access and fallback safety

This track no longer owns generic teacher submission detail, normalized submission persistence, or practice-component migration work. It starts only once those earlier tracks are complete and stable.

## Progress

See [./plan.md](./plan.md) for detailed task status.
