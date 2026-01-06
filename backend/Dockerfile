# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Install Maven
RUN apk add --no-cache maven

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render supplies PORT env var, but we set a default just in case
ENV PORT=10000
EXPOSE $PORT

# Use shell form explicitly to ensure variable expansion works
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]

