PR: Feature/taxi module — Accessibility checklist and notes

This file is committed to `feature/taxi-module` to make it visible in the existing pull request and provide a short accessibility checklist for reviewers.

Summary of changes included in this branch:
- Skip-link and `id="main-content"` added to MainLayout
- `sr-only` labels and `aria-label` additions on ClientsPage
- `id` attributes added to Profile inputs
- Footer updated to reflect three activities
- Backend runtime filter applied for DEP0169

Accessibility checklist:
- [x] Skip-link present and focused state visible
- [x] Form inputs have associated labels (visible or sr-only)
- [x] Buttons and interactive elements include accessible names (`aria-label` or visible text)
- [x] Selects and inputs have `id` matching `label.htmlFor`
- [ ] Run automated a11y tests (axe/core) and fix critical failures
- [ ] Manual keyboard navigation review

Notes for reviewers:
- I pushed the accessibility-focused commits to this branch; please review UI changes in `frontend/src`.
- If you want me to update the PR description or add a GitHub comment, I can do that too.
