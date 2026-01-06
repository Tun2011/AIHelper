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

# Render uses PORT environment variable
ENV PORT=8080
EXPOSE $PORT

# Use shell form to allow environment variable expansion
CMD java -jar app.jar --server.port=$PORT

