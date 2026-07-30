# Test Environment Menu Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the first batch of prototype menus with the test environment.

**Architecture:** Remove the standalone revision-notes route and apply one test-environment whitelist after Mock routes are converted. Keep hidden page components in the repository.

**Tech Stack:** Vue 2, Vue Router, local Mock routes, Node.js validation scripts

## Global Constraints

- Keep hidden page components available.
- Do not publish to GitHub.
- Verify the real local sidebar.

---

### Task 1: Align visible routes

**Files:**
- Modify: `src/router/index.js`
- Create: `src/utils/testEnvironmentMenu.js`
- Modify: `src/store/modules/permission.js`
- Test: `scripts/check-test-env-menu-alignment.js`

- [x] Add a failing static menu-alignment check.
- [x] Remove the revision-notes menu route.
- [x] Apply the approved site-management whitelist and labels.
- [ ] Run the static check and confirm it passes.

### Task 2: Synchronize permissions and verify

**Files:**
- Verify: `src/views/system/role/permissionCatalog.js`

- [ ] Run the permission catalog check and production build.
- [ ] Start the local server and inspect the sidebar in a browser.
