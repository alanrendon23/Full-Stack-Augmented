# Backend — Spring Boot (Gradle)

Comandos útiles para desarrollo del backend (desde `backend/`):

```bash
# Ejecutar la app
./gradlew bootRun

# Compilar jar
./gradlew bootJar

# Ejecutar tests
./gradlew test
```

La aplicación usa H2 en memoria por defecto (ver `src/main/resources/application.properties`).

Para desarrollo conjunto con el frontend, usa `docker-compose up --build` desde la raíz del repo.
