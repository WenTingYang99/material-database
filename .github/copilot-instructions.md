# Copilot Instructions for material-database-just_html

- This is a static front-end project. The app runs from `index.html` and loads scripts in this order: `app-infra.js`, `app-core.js`, `app-render.js`, `app-actions.js`, `app-workflows.js`, `app-utils.js`, then `app.js`.
- There is no `package.json` or build tool in this repo. Use `node server.js` to serve files locally or open `index.html` in a browser.
- The main entrypoint is `bootstrap()` in `app.js`. Most runtime state and navigation come from `app-core.js`.
- `db` and `state` are the app data sources. Persistent data is stored in browser `localStorage` under `STORAGE_KEY = "dp-material-library-state-v2"`.
- `app-render.js` splits pages into asset pages (`all`, `pending`, `created`) and management pages. Page routing is driven by `state.page` and the `db.menus` tree.
- `index.html` contains the page shell and template DOM for all modals, buttons, nav, filters, and page action panels. Do not rename `id`/`data-*` selectors without verifying corresponding JS usage.
- `app-actions.js` handles upload/import, asset menu actions, file reading, asset creation, deletion, download, and tag recognition.
- `app-workflows.js` handles the material basket, share dialogs, collect tasks, permission flows, and recycle bin operations.
- `app-utils.js` contains filtering, sorting, similarity scoring, date normalization, and asset-matching logic. If a feature behaves unexpectedly in search/filter, start here.
- `app-infra.js` provides UI helpers: toast, confirm modal, loading indicator, HTTP wrapper, debounce, and date picker enforcement.
- The project uses a dynamic left nav from `db.menus`; menu visibility is controlled by menu metadata (`valid`, `hidden`, `canViewMenu`). The left nav is built in `app-core.js`.
- Existing project notes are in `CODE_MEMORY.md` and `PROJECT_BASELINE.md`. Refer to `CODE_MEMORY.md` first for function-level context when making changes.
- Keep CSS class names and layout conventions stable. `styles.css` is global and many JS modules rely on DOM structure from `index.html`.
- Because the app is data-driven, prefer updating menu/page metadata and state logic over hardcoding new page switches.
- The repo uses front-end-only login/session simulation; `currentUser` and `db.users` are managed in `app-core.js` and do not connect to a real backend here.
