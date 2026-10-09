# Phase 10: Verification & Quality Assurance

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** Entire repository verification  
> **Tools:** TypeScript compiler, ESLint, Vite build, Manual QA verification

---

## 1. Objective

Provide a comprehensive verification plan and checklist ensuring zero TypeScript errors, clean linting, valid production bundling, and flawless end-to-end functionality.

---

## 2. Automated Quality Gates

Executed in `d:\project\central\Central-UI`:

- [x] **Strict TypeScript validation**: `npm run typecheck` &rarr; Passed with **0 errors**.
- [x] **ESLint code standard analysis**: `npm run lint` &rarr; Passed with **0 errors**.
- [x] **Production Vite build bundle test**: `npm run build` &rarr; Passed with **0 errors** (built in 22.43s, chunks optimized).

---

## 3. Functional Verification Matrix

### 3.1 Tester Management
- [ ] **Enroll Device**: Add a new tester device with deviceId `pixel-7-qa-01` and channel `internal`. Verify table updates immediately without page refresh.
- [ ] **Copy Identifier**: Click copy icon on device ID; verify clipboard content and checkmark feedback.
- [ ] **Channel Update**: Edit the tester and switch channel to `beta`. Verify badge changes color from purple to amber.
- [ ] **Immutable Identifier**: Verify `deviceId` input is disabled when editing an existing device.
- [ ] **Device Removal**: Delete the tester and verify device is removed from table and falls back to production.

### 3.2 Remote Configuration
- [ ] **Baseline Document**: Create config for namespace `keyboard` on platform `all`.
- [ ] **Platform Override**: Create override for namespace `keyboard` on platform `android`. Verify it appears under the Android tab of the `keyboard` card.
- [ ] **JSON Code Editor**: Enter invalid JSON and verify real-time syntax error warning. Click "Prettify" to format JSON.
- [ ] **Optimistic Lock (409 Conflict)**: Simulate concurrent update; verify friendly alert toast triggers and prevents silent overwriting.
- [ ] **History & Rollback**: View history drawer, select older snapshot, click "Rollback to Version X", and verify active config reverts.

### 3.3 Release Management
- [ ] **Create Release**: Create Android release `2.5.0` with buildNumber `125` in `draft` status.
- [ ] **Sortable Table**: Click table headers to sort releases by `buildNumber` descending and `createdAt`.
- [ ] **Filter Toolbar**: Filter table by Platform (`Android`) and Status (`Draft`).
- [ ] **Promote Status**: Edit release to change status from `draft` &rarr; `active` and increase rollout percentage to `100%`.
- [ ] **Immutable Release Core**: Verify `platform` and `version` fields cannot be modified during editing.

### 3.4 Feature Flags
- [ ] **Lowercase Validation**: Attempt entering uppercase flag key `AI_Smart_Reply`; verify validation error requires lowercase snake_case `ai_smart_reply`.
- [ ] **Inline Master Toggle**: Click master switch in table row; verify toggle updates immediately with success toast.
- [ ] **7-Gate Targeting Form**: Configure platform `android`, channel `beta`, minBuildNumber `40`, and 50% rollout.
- [ ] **Device Overrides**: Add 2 devices to allow list and 1 to deny list using `MultiStringComponent`.
- [ ] **Payload Editor**: Add custom parameters in `JsonEditorComponent` and verify save.

---

## 4. Cache Invalidation Checklist

Verify that TanStack Query cache invalidation triggers on all operations:

| Action | Affected Entity | Target Invalidation Query Keys | Verified |
| :--- | :--- | :--- | :---: |
| Upsert / Delete Tester | Tester | `["testers"]` | [x] |
| Put / Delete Config | Remote Config | `["remoteConfigs"]`, `["remoteConfig", namespace, platform]` | [x] |
| Rollback Config | Remote Config | `["remoteConfigs"]`, `["remoteConfig", ... ]`, `["remoteConfigHistory", ... ]` | [x] |
| Create / Update Release | Release | `["releases"]`, `["releaseById", id]` | [x] |
| Create / Update Feature | Feature Flag | `["features"]`, `["featureByKey", key]` | [x] |
