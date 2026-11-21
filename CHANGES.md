# Changes

## 0.2.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history. This release is built from `main`; it replaces 0.1.2, which was
published from a fork, and changes the message API.

- Seneca 4: the peer dependency is `seneca` `^4.0.0` (was
  `>=3||>=4.0.0-rc2`). Seneca 3 users stay on `@seneca/traverse@0.1`.
- The entity peer dependency is `@seneca/entity` `^29.0.0` (was
  `seneca-entity` `>=26`). The old peer made npm install `seneca-entity` 28,
  which stops a Seneca 4 process at startup with `plugin_gubu_shape`. Load the
  entity plugin by its full name: `seneca.use('@seneca/entity')`.
- The `seneca-promisify`, `gubu` and unused `@seneca/entity-util` peer
  dependencies are removed. Seneca 4 has promises built in; do not call
  `use('promisify')` (D4).
- The plugin no longer depends on the `shape` package: it builds its message
  checks with the shape builders that Seneca provides (`seneca.valid`), so only
  Seneca's own copy of shape is loaded (B15).
- Node.js 24 or later (`engines.node` `>=24`, was `>=22`).
- TypeScript: the types load the `@seneca/entity` 29 declarations of
  `seneca.entity()`, so a TypeScript build needs `@seneca/entity` installed.
- Message API changes since 0.1.2:
  - `sys:traverse,on:task,do:next` is removed. A task handler reports
    completion with `sys:traverse,on:task,do:complete` (`taskId`, optional
    `result` and `fragment`), which dispatches the next pending task. One task
    is in flight at a time, and `do:start` returns without waiting for tasks.
  - New overridable `sys:traverse,on:task,do:dispatch` (deliver a task, for
    example through a transport) and `sys:traverse,on:run,do:claim` (complete a
    run exactly once), and the notification `sys:traverse,on:run,did:complete`.
  - `sys:traverse,on:run,do:create` rolls back when a task cannot be saved and
    returns `{ ok: false, why: 'task-create-failed' }`.
  - New options `reverse` (deepest first), `awaitDispatch` and `taskMsgAllow`.
- Tests run on Seneca 4 with `@seneca/entity` 29, load it by its full name
  (B14) and no longer use `promisify`. devDependencies: `seneca` `^4.0.0`,
  `@seneca/entity` `^29.0.0` and `@seneca/doc` `^9.0.0`; the unused
  `seneca-msg-test` and `@seneca/maintain` and the stale Jest configuration
  are removed.
- `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
