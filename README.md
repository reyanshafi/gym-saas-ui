# GymSaas frontend

Run `npm ci` to install dependencies, `npm run dev` to start development, and `npm run build` to check the production build.

## Where to make changes

| Change | Location |
| --- | --- |
| URLs, route entry points, root layout | `app/` |
| Sign-in page | `src/features/auth/` |
| Sidebar, top bar, profile menu, workspace search | `src/features/workspace/` |
| Gym and platform overviews and charts | `src/features/dashboard/` |
| Member profile, member list columns, CSV import | `src/features/members/` |
| Super Admin tenant profiles, SaaS analytics, KPI calculations | `src/features/platform/` |
| Payment validation, reversals, financial reports | `src/features/billing/` |
| Management screens, record drawers, field configuration | `src/features/records/` |
| Portal sections, navigation configuration, sample records | `src/data/catalog/` |
| Record data access and browser persistence | `src/data/records/` |
| Shared tables, confirmation dialogs, and styles | `src/shared/` |

The `@/` import alias points to `src/`. Keep route files small and put feature-specific behavior near its UI. Move components into `shared/` when multiple features use them.

## Backend integration

`use-records.js` is the current data entry point for the UI. `browser-record-repository.js` owns browser persistence and change notifications. It retains the existing storage keys and row format so current browser data remains usable.

Introduce authenticated API queries and individual create, update, and delete mutations at the data boundary. The current synchronous snapshot hook and whole-list writes are specific to local storage. The API integration needs loading, error, and refresh states, and should use named response fields and stable IDs for member, plan, branch, and tenant relationships. Keep translation from API responses at the feature data boundary while migrating the positional table rows.

The server must enforce role permissions and tenant scope, validate payment mutations, and record audit events. The browser ledger and activity log are local UI behavior.
