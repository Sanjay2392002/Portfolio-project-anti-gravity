# Admin and database setup

## Local development

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_EMAIL` to the email used for the admin account and set `ADMIN_PASSWORD` to a unique password with at least 14 characters and at most 72 UTF-8 bytes.
3. Start the site with `npm run dev`. Local development uses `server/data/db.json`; the admin panel is at `/admin/login`.

The password environment variable is used when the first admin account is created or when replacing the known legacy default password. For an existing secure account, change its password from **Admin → Site Settings**. A password change signs out other active sessions.

## PostgreSQL deployment

Set these production environment variables in the hosting provider:

- `NODE_ENV=production`
- `DATABASE_URL` for a PostgreSQL database with TLS enabled
- `APP_ORIGIN` as the exact public HTTPS origin, with no path
- `JWT_SECRET` as a unique random value of at least 32 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the initial administrator (14+ characters; at most 72 UTF-8 bytes)
- `TRUST_PROXY_HOPS=1` only when requests pass through one trusted reverse proxy; leave it at `0` when clients connect directly

PostgreSQL TLS certificate validation is on by default, including during local development. Set `DATABASE_SSL=disable` only when connecting to a trusted PostgreSQL server on the same machine; production refuses that setting.

The server applies `server/db/schema.sql` before accepting traffic. A fresh database receives the catalog and the initial portfolio records; future admin edits are retained. Back up PostgreSQL regularly. If image uploads use local storage, deploy on a host with persistent disk; use the configured image provider when hosting on ephemeral or multi-instance infrastructure.

### Import local development data

To move an existing local JSON database into PostgreSQL, point `DATABASE_URL` at the intended empty database and run the migration before starting the app. The importer makes one transaction, includes projects, work, settings, media metadata, contacts, users, and logs, and stops if the PostgreSQL database already contains records.

In PowerShell:

```powershell
$env:MIGRATE_LOCAL_DATA = "YES"
npm run db:migrate-local
Remove-Item Env:MIGRATE_LOCAL_DATA
```

Keep a backup of both databases before migrating. Uploaded files themselves are not copied; the migration preserves their media records and URLs, so copy local upload files to the configured persistent media storage separately.

## Security operations

- Rotate any image-provider credentials that were previously stored in a tracked environment example, then replace them only in the hosting provider’s secret store.
- Keep `JWT_SECRET` private and rotate it if it is exposed; rotating it signs out every admin.
- The built-in login and contact rate limits are held in the running server process. Put a shared rate limit at the edge when running multiple API instances.
- `server/data/db.json` is a development convenience. Use PostgreSQL for production and do not commit local database copies or `.env` files.
