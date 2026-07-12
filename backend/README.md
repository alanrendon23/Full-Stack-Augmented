# Backend — Spring Boot (Gradle)

This backend is a Spring Boot application built with the Gradle wrapper. It can run standalone for development or inside a container built from the provided `Dockerfile`.

Prerequisites

- JDK installed for local runs
- Git (repository)

Environment variables

- `OPENAI_API_KEY` — required for AI features. If not set, the application will read `NO_KEY_PROVIDED` by default from `application.properties`.
- `OPENAI_BASE_URL` — optional, defaults to `https://api.openai.com/v1` unless overridden.

Local development (standalone)

1. From the `backend/` folder, use the Gradle wrapper to run the app:

```bash
./gradlew bootRun
```

2. Build a production jar:

```bash
./gradlew bootJar
```

3. Run tests:

```bash
./gradlew test
```

Running the backend image (Docker or Podman)

1. Build the image from the `backend` folder:

```bash
docker build -t augmented-backend:latest ./backend
# or with podman
podman build -t augmented-backend:latest ./backend
```

2. Run the container and pass required environment variables at runtime:

```bash
docker run -e OPENAI_API_KEY="<your_key>" -e OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/" -p 8080:8080 augmented-backend:latest
# or with podman
podman run -e OPENAI_API_KEY="<your_key>" -e OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/" -p 8080:8080 augmented-backend:latest
```

Notes

- The application reads `openai.api-key` and `openai.base-url` from environment variables (see `src/main/resources/application.properties`).
- The `Dockerfile` does not embed secrets; provide secrets at runtime using environment variables, an `.env` file for your container runner, or a secret manager.
- The devcontainer in `.devcontainer/devcontainer.json` starts the development workspace using the frontend service and forwards ports `8080` and `4200` into the container workspace.
