# AGENTS.md

## Cursor Cloud specific instructions

### Product

Next.js PWA (App Router under `src/app/`) for IoT-Wizard temperature control. No local backend — the browser talks to ThingsBoard at `NEXT_PUBLIC_THINGSBOARD_URL` (default `https://kundenportal.iot-wizard.at`).

### Services

| Service | Command | Port |
|---------|---------|------|
| Next.js dev server | `npm run dev` | 3000 |
| ThingsBoard (external) | — | HTTPS only |

### Standard commands

See `package.json` scripts and `README.md`:

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Build: `npm run build`
- Prod local: `npm run start` (after build)

Copy `.env.example` to `.env.local` before running. Required variable: `NEXT_PUBLIC_THINGSBOARD_URL`.

### Non-obvious notes

- **Node**: Use Node 20+ (LTS 22 works). No `.nvmrc` in repo; match the VM Node version if installs fail.
- **Next.js 16**: Project uses Next 16.x. Lint is `eslint .` (not `next lint`).
- **Turbopack**: `npm run dev` uses `--turbopack`. If dev fails, try `npx next dev` without turbopack.
- **ThingsBoard login E2E**: Full login needs valid ThingsBoard credentials. The `/login` page checks API reachability via `GET /api/auth/user` (expect 401 when unauthenticated).
- **CORS**: Browser calls to ThingsBoard may be blocked by CORS from localhost; the reachability check can show "unreachable" even when the portal works in production. Phase 1 login may need a proxy or ThingsBoard CORS config.
- **No Docker**: Nothing to compose locally except the Next.js process.
