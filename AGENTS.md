# Project Guidelines

These instructions apply to the entire repository.

## Purpose

Carfin is a frontend-only React single-page application for comparing car ownership costs. Users can configure multiple cars, define expenses, review computed results in charts and tables, and import or export their app state as JSON. There is no backend service.

## Stack

- React application bootstrapped with Create React App.
- JavaScript source under `src/`.
- Styling uses the existing CSS/Tailwind/PostCSS setup.
- Charts use ECharts.
- State is client-side only and persists through browser storage plus JSON import/export.

## Project Structure

- `src/components/` contains UI components, grouped by layout, sections, and tabs.
- `src/domain/` contains calculation and domain model helpers.
- `src/utils/` contains storage and portability helpers.
- `public/` contains CRA public assets.
- Tests are colocated with implementation files as `*.test.js`.

## Development Commands

- Install dependencies with `npm install` when needed.
- Start the dev server with `npm start`.
- Run tests with `npm test -- --watchAll=false`.
- Build for production with `npm run build`.

## Implementation Guidelines

- Keep changes small, cohesive, and consistent with the existing component and domain-helper patterns.
- Prefer pure domain helpers for calculations and data transformations.
- Keep persistence and import/export behavior compatible with existing saved JSON where practical.
- Respect the project design colors:
  - Graphite `#353535`
  - Stormy Teal `#3c6e71`
  - White `#ffffff`
- Do not add a backend or server-side dependency unless the user explicitly asks for one.
- Avoid unrelated refactors and formatting churn.

## Testing Expectations

- Add or update tests for new behavior and non-trivial logic.
- Cover core paths such as adding/removing cars, expenses, calculations, chart/table rendering states, and JSON import/export round trips when those areas change.
- Before finishing a code change, run `npm test -- --watchAll=false` when feasible.
- For larger or release-oriented changes, also run `npm run build`.

## Definition of Done

- The requested behavior is implemented.
- Relevant tests pass or any inability to run them is clearly reported.
- Documentation is updated when behavior, commands, or user-facing flows change.
