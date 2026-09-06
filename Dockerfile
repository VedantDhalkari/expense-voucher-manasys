FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
COPY --from=frontend-build /app/dist ./static
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
