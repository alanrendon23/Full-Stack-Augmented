FROM eclipse-temurin:21-jdk

WORKDIR /workspace/backend

# Copy project files
COPY . /workspace/backend

# Ensure wrapper executable and build the jar (cache safe)
RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon || true

EXPOSE 8080

CMD ["./gradlew", "bootRun"]
