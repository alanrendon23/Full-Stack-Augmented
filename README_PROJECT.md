# Project Overview — Full-Stack-Augmented

Project Purpose

Full-Stack-Augmented is designed to help learners and educators turn raw study notes into clearer, more useful study materials. The system analyzes input content and automatically generates improved descriptions, concise summaries, key concepts, and study aids such as flashcards. Its goal is to save time, improve information retention, and make it easier to organize, review, and learn from study materials.

A clean, concise reference for developers working on Full-Stack-Augmented. This repository contains two main applications that can run independently or together:

- `backend/` — Spring Boot backend (Gradle wrapper)
- `front/` — Angular frontend

This document summarizes responsibilities, important files, environment variables, and quick run instructions.

---

## At a glance

- Backend: REST API, persistence for study notes and AI integration (automated content analysis).
- Frontend: Single-page Angular app that consumes backend APIs and provides a small UI (dashboard, notes, flashcards, todo, users).

Both components are lightweight and intended for local development and testing. A top-level `docker-compose.yml` and `.env` exist for orchestrated runs (see the `docker-compose.yml` file for details).

---

## Backend — what it does and key parts

Responsibility: manage study notes, persist data, expose REST endpoints, and call the AI service to enrich study content.

Important folders/files:

- `src/main/java/com/augmented/backend/BackendApplication.java` — application entry point.
- `controller/StudyNoteController.java` — REST endpoints for study notes and related operations.
- `service/StudyNoteService.java` — business logic for CRUD operations.
- `service/AIService.java` — integration with the AI client (parsing and formatting AI responses).
- `repository/StudyNoteRepository.java` — Spring Data repository for persistence.
- `model/` — domain models (`StudyNote`, `Subject`, `AIStudyResponse`).
- `src/main/resources/application.properties` — runtime configuration; keys like `openai.api-key` and `openai.base-url` can be read from environment variables.
- `Dockerfile` — builds a container image for the backend (do not embed secrets; provide env vars at runtime).

Notes:

- Tests are under `src/test/java` (run with `./gradlew test`).
- The AI integration expects `OPENAI_API_KEY` and optionally `OPENAI_BASE_URL` set in the environment for production-style runs.

---

## Frontend — what it does and key parts

Responsibility: provide a simple UI to create, view and manage study notes and related features (flashcards, todo, users).

Important folders/files:

- `src/app/components/` — UI components (dashboard, note-detail, flashcards, todo-list, user-list).
- `src/app/services/` — API service clients (e.g., `study-note.service.ts`, `user.service.ts`) used to talk to backend endpoints.
- `src/app/models/` — TypeScript models used by the UI.
- `angular.json`, `package.json` — project build and scripts.
- `Dockerfile` — multi-stage build that compiles the Angular app and serves it with `nginx`.

Notes:

- Run the dev server locally with `pnpm start` (or `npm run start`).
- The frontend expects the backend to be available (by default at `http://localhost:8080`) when running locally.

---

## Environment variables

Primary variables used by the backend:

- `OPENAI_API_KEY` — required for AI features (supply a real key when using AI features).
- `OPENAI_BASE_URL` — optional override for the AI endpoint (defaults to a standard OpenAI endpoint if not provided).

A root-level `.env` file is used by the top-level compose file in this repo to inject environment variables into services during container runs. The repository `.gitignore` excludes `.env` to avoid committing secrets.

---

## Devcontainer

There is a `.devcontainer/devcontainer.json` that bootstraps a VS Code devcontainer. Key points:

- The devcontainer uses the `frontend` service and mounts the repository into `/workspace`.
- Ports `8080` (backend) and `4200` (frontend) are forwarded.
- The `postStartCommand` prints quick pointers on where to find each app inside the container workspace.

If you want the devcontainer to use Podman as its engine instead of Docker, you may need to adjust VS Code settings or a Docker-compatible shim.

---

## Running (quick)

Backend (local, development):

```bash
cd backend
./gradlew bootRun
```

Backend (build image and run container):

```bash
# build
docker build -t augmented-backend:latest ./backend
# run (provide env vars at runtime)
docker run -e OPENAI_API_KEY="<your_key>" -e OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/" -p 8080:8080 augmented-backend:latest
```

Frontend (local):

```bash
cd front
pnpm install
pnpm start
```

Frontend (build image and run container):

```bash
docker build -t fs-frontend-image ./front
docker run -p 4200:80 fs-frontend-image
```

Running both together (compose)

The repository includes a `docker-compose.yml` that can build and run both services and uses a root `.env` to inject variables into the backend. For orchestrated runs you can use Docker Compose or Podman Compose. See the top-level compose file for exact service names and port mappings.

---

## Security & best practices

- Do not commit real API keys. Use `.env`, environment injection, or a secret manager in production.
- The backend `Dockerfile` purposely avoids embedding secrets — pass them at runtime.
- For CI or shared environments, prefer using encrypted secret stores or built-in platform secret mechanisms.

---

## File map (quick reference)

- `backend/` — Spring Boot app
  - `src/main/java/com/augmented/backend/controller` — REST controllers
  - `src/main/java/com/augmented/backend/service` — business logic and AI integrations
  - `src/main/java/com/augmented/backend/model` — domain models
  - `src/main/java/com/augmented/backend/repository` — persistence layer
  - `src/main/resources/application.properties` — configuration

- `front/` — Angular app
  - `src/app/components` — UI views and components
  - `src/app/services` — API clients
  - `src/app/models` — TypeScript models

---

If you'd like, I can also:

- add a `README_PROJECT.md` section with a small diagram, or
- add a `.env.example` with placeholder keys (no secrets), or
- add a `Makefile` with shortcuts for common tasks.

Tell me which of those you'd like next.
