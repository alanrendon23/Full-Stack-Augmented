# Frontend — Angular

This frontend is an Angular application (Angular CLI). It can run standalone for development or be packaged into a container using the provided `Dockerfile`.

Prerequisites

- Node.js (for local development)
- `pnpm` (recommended) or `npm`

Local development (standalone)

1. Install dependencies (from the `front/` folder):

```bash
pnpm install    # or: npm install
```

2. Start the dev server:

```bash
pnpm start      # or: npm run start
```

Open `http://localhost:4200/` to view the app.

Build

```bash
pnpm build      # or: npm run build
```

Docker image (build and run)

1. Build the frontend image from the project root or `front/` folder:

```bash
docker build -t fs-frontend-image ./front
# or with podman
podman build -t fs-frontend-image ./front
```

2. Run the container, mapping host port `4200` to the container's port `80`:

```bash
docker run -p 4200:80 fs-frontend-image
# or with podman
podman run -p 4200:80 fs-frontend-image
```

Notes

- The devcontainer configuration references the `frontend` service and mounts the workspace into `/workspace`.
- The frontend expects the backend API to be reachable at `http://localhost:8080` in local setups.
