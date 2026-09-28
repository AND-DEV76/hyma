FROM eclipse-temurin:21-jre

WORKDIR /app

COPY build/libs/hyma-0.0.1-SNAPSHOT.jar app.jar

ENV TZ=America/Guatemala

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=America/Guatemala", "-jar", "app.jar"]