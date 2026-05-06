# Style Guide for Contributors

## Code Standards
- Node.js 18+ required
- ESLint with standard config
- Prettier for formatting
- Jest for testing

## Commit Messages
```
type(scope): subject
```
Types: feat, fix, docs, style, refactor, test, chore

## Anti-AIism Policy
All generated content must pass AntiAIismFilter with score >= 90.
Banned patterns are non-negotiable and cause CI failure.

## Quality Gate Policy
- EXCELLENT (>= 90): Auto-publish eligible
- PUBLISH_READY (>= 85): Publish with confidence
- NEEDS_REVISION (75-84): Requires human review
- REJECT (< 75): Blocked from publication
