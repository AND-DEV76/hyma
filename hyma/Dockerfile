# Etapa 1: Compilar la aplicación con JDK 21 y Gradle
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Asegurar permisos de ejecución y normalizar saltos de línea (evita problemas CRLF en Linux)
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew

# Copiar código fuente y compilar el JAR
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# Etapa 2: Imagen final liviana de ejecución con JRE 21
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR generado desde la etapa builder
COPY --from=builder /app/build/libs/hyma-0.0.1-SNAPSHOT.jar app.jar

ENV TZ=America/Guatemala

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=America/Guatemala", "-jar", "app.jar"]