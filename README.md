# To-Do List

A mobile-first weekly task planner built as a TypeScript MERN monorepo. The client centers on a phone-width layout on desktop and lets people create, edit, complete, search, and remove tasks.

## Live links

- Client: https://your-client-url.example
- API: https://your-api-url.example

Replace these placeholders after deployment.

## Tech stack

- **Client:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query v5, Axios, date-fns
- **Server:** Node.js, Express, TypeScript, Mongoose, MongoDB Atlas, Zod, CORS, dotenv
- **Deployment targets:** Netlify (client), Render or Railway (server)

## Project layout

```text
client/
  public/
  src/
    api/
    components/
    hooks/
    pages/
    types/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    validators/
    utils/
```

## Local setup

Use Node.js 20.19+ (Node 22 LTS recommended) and npm.

### 1. Configure MongoDB and the API

Create a MongoDB Atlas database and a database user. Copy `server/.env.example` to `server/.env`, then set the Atlas URI and the exact client origin:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

Install and run the API:

```bash
cd server
npm install
npm run dev
```

The server connects to MongoDB before it starts listening. The API is available at `http://localhost:5000`.

### 2. Configure and run the client

In another terminal, copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Then run:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The onboarding screen appears on the first visit and its completion is stored in local storage.

### Build and lint

```bash
cd server
npm run build
npm start
```

```bash
cd client
npm run lint
npm run build
npm run preview
```

## Environment variables

| Variable | App | Required | Description |
|---|---|---:|---|
| `PORT` | Server | No | HTTP port; defaults to `5000`. |
| `MONGODB_URI` | Server | Yes | MongoDB Atlas connection string. |
| `CLIENT_ORIGIN` | Server | Yes | The one allowed browser origin, including scheme and port. |
| `VITE_API_URL` | Client | No | API origin, without `/api`; unset means same-origin requests. |

Never commit `.env` files or Atlas credentials. The example files contain placeholders only.

## Task model

`Task` documents contain:

- `title`: required, trimmed string (maximum 200 characters)
- `description`: optional trimmed string (maximum 5,000 characters)
- `dueAt`: required UTC date
- `endAt`: optional UTC date
- `priority`: `low`, `medium`, or `high` (defaults to `medium`)
- `status`: `in_progress` or `completed` (defaults to `in_progress`)
- Mongoose `createdAt` and `updatedAt` timestamps

MongoDB has a text index on `title` and `description`.

## API

All task endpoints are prefixed with `/api/tasks`. Requests and responses use JSON.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create a task; returns `201`. |
| `GET` | `/api/tasks?search=&from=&to=` | List tasks, optionally filtering by text and due-date range. |
| `GET` | `/api/tasks/:id` | Get one task. |
| `PUT` | `/api/tasks/:id` | Update supplied task fields; `endAt: null` clears the end time. |
| `PATCH` | `/api/tasks/:id/status` | Set status to `in_progress` or `completed`. |
| `DELETE` | `/api/tasks/:id` | Delete a task. |
| `GET` | `/api/tasks/weeks` | Return weeks containing tasks, sorted newest first. |
| `GET` | `/health` | Health-check response for hosting platforms. |

Successful responses share this envelope:

```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "..."
    }
  }
}
```

List endpoints return `data.tasks` or `data.weeks`. Validation and request errors use:

```json
{
  "success": false,
  "error": {
    "message": "Request validation failed",
    "details": [
      { "path": "title", "message": "Title is required" }
    ]
  }
}
```

### Example requests

Create a task:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Review roadmap","description":"Prepare notes","dueAt":"2026-11-12T09:00:00.000Z","priority":"high"}'
```

Search and filter by date range (date-only `to` values include the entire UTC day):

```bash
curl "http://localhost:5000/api/tasks?search=roadmap&from=2026-11-09&to=2026-11-15"
```

Complete a task:

```bash
curl -X PATCH http://localhost:5000/api/tasks/<task-id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

List weekly counts and check health:

```bash
curl http://localhost:5000/api/tasks/weeks
curl http://localhost:5000/health
```

## Assumptions and limitations

- Weeks begin Monday and end Sunday. Weekly aggregation is bucketed in UTC; task times are stored in UTC and displayed in the browser's local time zone. A user's local week boundary can therefore differ from the UTC weekly summary near midnight.
- Date-only `from` and `to` filters are interpreted as UTC day boundaries; `to` includes the full day. ISO date-time filters are compared as exact instants.
- Search uses MongoDB text search over the indexed title and description fields, not arbitrary substring or typo-tolerant matching.
- The task API currently has no authentication, ownership model, pagination, or rate limiting.
- Weeks with no tasks are not included in the weekly aggregation response.
- CRUD requests require a reachable MongoDB instance. In the development workspace, TypeScript builds, lint, health, and invalid-input HTTP checks were verified; live Atlas-backed CRUD was not run because no database credentials were configured.

## Deployment checklist

### Server (Render or Railway)

1. Set the service root directory to `server`.
2. Set the build command to `npm ci && npm run build`.
3. Set the start command to `npm start`.
4. Configure `MONGODB_URI` with the production Atlas URI.
5. Configure `CLIENT_ORIGIN` to the deployed client origin (for example, `https://your-app.netlify.app`).
6. Allow the hosting service to connect to Atlas and grant the database user only the required database permissions.
7. Confirm `GET /health` returns HTTP `200`.

### Client (Netlify)

1. Set the base directory to `client`.
2. Set the build command to `npm ci && npm run build`.
3. Set the publish directory to `dist`.
4. Set `VITE_API_URL` to the deployed server origin, without a trailing `/api` path.
5. Keep `public/_redirects` configured to serve the SPA entry point for client-side routes.
6. Redeploy after changing `VITE_API_URL`; Vite embeds it during the build.

### Final smoke test

- Open the client on a fresh browser profile and finish onboarding.
- Create a task with a UTC `dueAt`; confirm it appears on the expected local day.
- Edit and clear an optional end time, then complete and delete a task.
- Verify Search, week cards, and the health endpoint against the deployed API.
- Confirm browser requests from the deployed client origin succeed and other origins are not granted CORS access.
