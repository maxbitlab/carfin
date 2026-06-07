# Project Guidelines

These guidelines define the project purpose and the exact steps required to complete any task in this repository.

## Purpose
- Build a simple, frontend‑only Single Page Application (SPA) to evaluate car ownership costs.
- Users can add multiple cars to a dashboard, define relevant expenses, and see results on a chart and in a table.
- Users can export their current state to a JSON file and import it later to continue their work. No backend is involved.

## Scope and Architecture
- Stack: React app bootstrapped with Create React App (CRA). No server components.
- State: Client-side only. Support export (download) and import (upload) of JSON to persist/restore state.
- Visualization: At least one chart component and a tabular view reflecting the same computed data.

## Core Features
1. Cars dashboard
   - Add, edit, remove cars.
2. Expenses per car
   - Define relevant expenses (e.g., fuel, maintenance, insurance, taxes, depreciation, others as needed).
3. Results views
   - Display computed totals/metrics in both a chart and a table.
4. Data portability
   - Export current app state to JSON and import JSON to restore the state.

## Design System (colors)
- Graphite #353535 — background
- Stormy Teal #3c6e71 — primary details
- White #ffffff — text and secondary details

## Repository Structure (high level)
- /public — CRA public assets
- /src — application code (components, hooks, utils, tests)
- package.json — scripts and dependencies
- tailwind/postcss configs — styling pipeline (where applicable)

## Scripts
- Development: npm start
- Tests: npm test
- Production build: npm run build

## Testing Policy
- For each feature and any non-trivial logic, implement unit tests.
- Keep tests colocated (e.g., ComponentName.test.tsx/tsx or .js) per CRA conventions.
- Aim for core path coverage: adding/removing cars, adding expenses, computing totals, chart/table rendering states, JSON export/import round‑trip.

## Definition of Done (for any task)
1. Plan
   - Clarify acceptance criteria; confirm if the task touches UI, state, import/export, or calculations.
2. Implement
   - Make minimal, cohesive changes in src/ following existing patterns.
   - Respect the design system colors listed above.
3. Tests
   - Add/update unit tests for the new/changed behavior.
   - Ensure tests are deterministic (mock time/randomness as needed).
4. Verify
   - Run npm test and confirm all tests pass.
   - If relevant, run npm start to sanity‑check key flows.
   - For releases or larger changes, ensure npm run build succeeds.
5. Documentation
   - Update README or inline docs when behavior or usage changes.

Completion of any task requires green tests and adherence to the design system and scope defined above.
