# Practical 8 — Performance Optimization and Lazy Loading in React

Applies to `Myportfolio/frontend`. No new dependencies were added. No UI/design changes were made.

## 1. What changed

Two focused changes:

**Route-level code splitting** — `src/App.jsx` now loads every route except the entry route `/` through `React.lazy(() => import(...))`, with a single `<Suspense>` boundary wrapping the route-level `<Routes>`.

**Supplementary heavy-library deferral** — `src/pages/Tasks.jsx` no longer statically imports `sweetalert2`. It is fetched via dynamic `import()` at the moment a user actually triggers a confirm dialog or toast. Same for its chunking effect: the modal library is no longer part of the initial `/tasks` route payload.

Files modified:

| File | Change |
| --- | --- |
| `frontend/src/App.jsx` | Added `lazy`/`Suspense` imports, lazy route declarations, `RouteFallback`, `<Suspense>` wrapper |
| `frontend/src/pages/Tasks.jsx` | Replaced static `import Swal from "sweetalert2"` with on-demand `loadSwal()` helper |

No other files were touched.

## 2. Routes converted to lazy loading

| Route | Component | Before | After |
| --- | --- | --- | --- |
| `/about` | `pages/About.jsx` | static import | `lazy(() => import("./pages/About"))` |
| `/skills` | `pages/Skills.jsx` | static import | `lazy(() => import("./pages/Skills"))` |
| `/projects` | `pages/Projects.jsx` | static import | `lazy(() => import("./pages/Projects"))` |
| `/experience` | `pages/Experience.jsx` | static import | `lazy(() => import("./pages/Experience"))` |
| `/contact` | `pages/Contact.jsx` | static import | `lazy(() => import("./pages/Contact"))` |
| `/tasks` | `pages/Tasks.jsx` | static import | `lazy(() => import("./pages/Tasks"))` |
| `/login` | `pages/Login.jsx` | static import | `lazy(() => import("./pages/Login"))` |
| `/register` | `pages/Register.jsx` | static import | `lazy(() => import("./pages/Register"))` |
| `*` (404) | `pages/NotFound.jsx` | static import | `lazy(() => import("./pages/NotFound"))` |

`/` (`pages/Home.jsx`) stays a static import on purpose — it is the entry route and should be in the initial payload.

All nine target files already used `export default`, so `lazy()` works with no export shims and no `export { X as default }` wrappers were needed.

`/tasks` remains wrapped in `ProtectedRoute` exactly as before. The auth redirect logic is unchanged; only the component inside the wrapper became lazy.

## 3. Suspense fallback

A single boundary sits around `<Routes>` in `App.jsx`:

```jsx
<Suspense fallback={<RouteFallback />}>
  <Routes>
    ...
  </Routes>
</Suspense>
```

`RouteFallback` reuses the existing `components/Spinner.jsx` so the loading state matches the current design instead of introducing a new visual:

```jsx
function RouteFallback() {
  return (
    <div className="page-section" role="status" aria-live="polite">
      <Spinner text="Loading page..." />
    </div>
  );
}
```

`role="status"` plus `aria-live="polite"` makes the load state announced to screen readers. `Spinner.css` was already imported by `Spinner.jsx`, so no stylesheet was added.

## 4. Build result

`npm run build` (Vite 8.1.4, rolldown) succeeds with no errors. Command:

```
cd Myportfolio/frontend
npm run build
```

Result: `✓ built in 781ms`, 511 modules transformed, no import/export resolution errors, no broken route paths. Every lazy chunk resolved to a real emitted file, which is the build-level proof that each `import()` target exists and has a compatible default export.

## 5. Generated chunks

Before (single-bundle baseline, captured before any edit):

```
dist/assets/index-pPArymPE.js   528.12 kB │ gzip: 164.26 kB
dist/assets/index-CBtg2Fk5.css   39.50 kB │ gzip:   8.21 kB
```

After:

```
dist/assets/index-BeHlX8b2.js             239.57 kB │ gzip: 76.57 kB   entry
dist/assets/Tasks-DzaQd0X1.js             141.07 kB │ gzip: 45.00 kB   /tasks
dist/assets/sweetalert2.all-DS0Kjt_M.js    78.15 kB │ gzip: 20.84 kB   deferred modal lib
dist/assets/taskApi-GsSvuBpE.js            47.58 kB │ gzip: 18.05 kB   shared axios/api
dist/assets/Projects-CO7XpEHE.js            5.40 kB │ gzip:  2.10 kB   /projects
dist/assets/Login-DYUbYd3g.js               3.63 kB │ gzip:  1.45 kB   /login
dist/assets/Register-CiC3HVvW.js            3.13 kB │ gzip:  1.18 kB   /register
dist/assets/Contact-Do1kw2e3.js             1.43 kB │ gzip:  0.57 kB   /contact
dist/assets/preload-helper-Czpn1I53.js      1.19 kB │ gzip:  0.67 kB   vite helper
dist/assets/react-9ZasmZpi.js               7.53 kB │ gzip:  2.88 kB   vendor
dist/assets/NotFound-BLqUiehZ.js            0.32 kB │ gzip:  0.23 kB   404
dist/assets/Skills-BaeT9Oeb.js              0.16 kB │ gzip:  0.15 kB   /skills
dist/assets/About-Di2I1gN5.js               0.16 kB │ gzip:  0.15 kB   /about
dist/assets/Experience-DHizwUg7.js          0.16 kB │ gzip:  0.15 kB   /experience
dist/assets/Projects-BUP-WeAW.css           4.03 kB │ gzip:  1.31 kB   repo card css
dist/assets/index-DfSbEf_p.css              35.47 kB │ gzip:  7.41 kB   global css
```

Gzip of the entry JS dropped from 164.26 kB to 76.57 kB, a reduction of 87.69 kB (about 53%) on the critical path. The initial download for a first-time visitor to `/` no longer includes the task manager, the OAuth screens, the contact form, or `sweetalert2`.

The `sweetalert2` split is visible in the numbers: before deferring it, the `/tasks` chunk was 219.03 kB; after, it is 141.07 kB and `sweetalert2.all` is a separate 78.15 kB file that is not requested until a dialog is actually opened.

The previous "Some chunks are larger than 500 kB" build warning is gone, since the largest chunk is now 239.57 kB.

## 6. Expected performance benefit

- Visitors landing on `/` download roughly half the JavaScript they did before.
- Payloads scale with what is actually visited. A visitor who only reads `/about` never downloads the task manager, `framer-motion`, `axios`, or `sweetalert2`.
- `/tasks` no longer drags the modal library into its first paint. `sweetalert2` is fetched on the first user action that needs it.
- Parse and execute cost on the main thread at first load drops, since fewer modules are compiled before hydration.
- Network requests increase slightly on navigation (one extra request per route chunk). This is the expected trade-off and is why `Navbar`/`Footer`/`Home` remain eager.

## 7. What must be measured manually in browser DevTools

None of the following were measured here, because browser testing was out of scope for this task. All numbers below are placeholders to be filled in.

Run the **production** build, not the dev server, since dev mode disables minification and pre-bundling and makes the numbers meaningless:

```
cd Myportfolio/frontend
npm run build
npm run preview
```

Checklist:

1. **Network tab, first load of `/`** — record the entry JS transfer size and the total transferred bytes. Confirm no `Tasks-*.js` or `sweetalert2.all-*.js` request appears.
2. **Network tab, click through to `/projects` then `/contact`** — confirm two separate chunk requests fire and each is served from cache on repeat visits.
3. **Network tab, confirm the fallback** — throttle to Slow 3G, click a nav link, and check the spinner appears in the gap between request start and chunk arrival.
4. **Performance panel** — record FCP and Total Blocking Time on `/` before and after, with "Disable cache" checked.
5. **Coverage panel** — confirm unused route chunks show as uncovered on a `/`-only visit.
6. **Coverage panel on `/tasks`** — check how much of `sweetalert2.all-*.js` is covered before and after opening a delete-confirmation dialog. It should be near 0% on mount and rise only after the dialog is opened.
7. **Verify nothing broke** — log in, create/edit/delete/complete a task, confirm the unauthenticated `/tasks` redirect still fires, and confirm the 404 route renders.

## 8. Before / after metrics

Build-level bundle sizes are real measurements from `npm run build` and are listed in section 5. Runtime metrics below were **not** measured (no browser testing performed) and are left as placeholders.

### Bundle sizes (measured, from build output)

| Metric | Before | After | Delta |
| --- | --- | --- | --- |
| Entry JS, raw | 528.12 kB | 239.57 kB | -288.55 kB |
| Entry JS, gzip | 164.26 kB | 76.57 kB | -87.69 kB (-53%) |
| Number of JS chunks | 1 | 15 | +14 |
| Largest chunk | 528.12 kB | 239.57 kB | -288.55 kB |
| `/tasks` chunk, raw | n/a (inside entry) | 141.07 kB | split out |
| `sweetalert2` | n/a (inside entry) | 78.15 kB deferred | split out |

### Runtime metrics (NOT measured — fill in manually)

| Metric | Before | After |
| --- | --- | --- |
| First Contentful Paint on `/` | _TBD_ | _TBD_ |
| Largest Contentful Paint on `/` | _TBD_ | _TBD_ |
| Total Blocking Time on `/` | _TBD_ | _TBD_ |
| Total transferred JS on `/` | _TBD_ | _TBD_ |
| Time to interactive `/tasks` | _TBD_ | _TBD_ |
| Screenshots | _not captured_ | _not captured_ |

## 9. Notes on scope

- No dependency was added. `sweetalert2` and `framer-motion` were already present and were simply re-pointed to load on demand.
- `pages/Tasks.test.jsx` still mocks `../components/Spinner`, `../components/TaskCard`, `framer-motion`, and `sweetalert2` by module path. The dynamic `import("sweetalert2")` resolves through the same module id, so the mock still applies and the test is unaffected.
- `npm run lint` reports 11 errors, all of which pre-date this change (unused `React` import in `main.jsx`, unused `error` bindings in `AuthContext.jsx` and `services/taskApi.js`, the pre-existing unused `motion` import in `Tasks.jsx`, `react-hooks/set-state-in-effect` in `Tasks.jsx` and `Projects.jsx`, and undefined test globals in `Tasks.test.jsx`). No new lint errors were introduced by Practical 8.
