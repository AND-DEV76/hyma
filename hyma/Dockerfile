# Etapa 1: Compilar la aplicación con Gradle 9.5.1 + JDK 21
FROM gradle:9.5.1-jdk21 AS builder

WORKDIR /app

# Copiar archivos de configuración primero para aprovechar la caché de Docker
COPY build.gradle .
COPY settings.gradle .

# Descargar dependencias antes de copiar el código fuente
RUN gradle dependencies --no-daemon

# Copiar el código fuente
COPY src ./src

# Compilar el JAR
RUN gradle bootJar --no-daemon -x test


# Etapa 2: Imagen final liviana con JRE 21
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR generado
COPY --from=builder /app/build/libs/hyma-0.0.1-SNAPSHOT.jar app.jar

ENV TZ=America/Guatemala

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=America/Guatemala", "-jar", "app.jar"]