@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-25.0.3
SET PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME set to: %JAVA_HOME%
java -version
echo.
echo Starting Spring Boot backend...
cd /d "C:\Users\HP\Department Asset Tracking\backend"
call mvnw.cmd spring-boot:run
