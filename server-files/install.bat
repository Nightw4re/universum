@echo off
REM Downloads and installs NeoForge server.
REM Run once after extracting the server package.
REM Requirements: Java on PATH, internet access, curl available (Windows 10+).

set NEOFORGE_VERSION=21.1.218
set INSTALLER_URL=https://maven.neoforged.net/releases/net/neoforged/neoforge/%NEOFORGE_VERSION%/neoforge-%NEOFORGE_VERSION%-installer.jar
set INSTALLER_JAR=neoforge-%NEOFORGE_VERSION%-installer.jar

echo Downloading NeoForge %NEOFORGE_VERSION% installer...
curl -Lo "%INSTALLER_JAR%" "%INSTALLER_URL%"

echo Installing server...
java -jar "%INSTALLER_JAR%" --installServer

echo Cleaning up...
del "%INSTALLER_JAR%"

echo Done. Start the server with run.bat
pause
