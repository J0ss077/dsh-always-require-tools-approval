# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-08-25

### Changed

- Refactored into three modules: `src/contracts.ts` (self-declared harness types), `src/gate.ts` (the pure approval-gate policy), and `src/index.ts` (wiring).
- Replaced the inline gate logic with a dependency-free `createGate()` core.
- Build now emits `.js` relative specifiers in both the JavaScript and declaration output.

### Added

- Unit tests for the gate core (`tests/gate.test.ts`).
- Project glossary (`CONTEXT.md`) and an ADR documenting the self-declared harness contracts.

## [1.0.2] - 2026-08-24

### Changed

- Expanded the README: installation, configuration (including the runtime settings override), safety model, developer guide, and FAQ.

## [1.0.1] - 2026-08-23

### Changed

- Version bump only (no functional changes).

## [1.0.0] - 2026-08-23

### Added

- Initial release: gates a configurable list of tools behind one-shot user approval before each execution.
