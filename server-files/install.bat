@echo off
REM Minimal server installer template.
REM build-server.mjs rewrites this file with the current NeoForge version.
setlocal

if not defined NEOFORGE_VERSION set "NEOFORGE_VERSION=21.1.218"
set "INSTALLER_URL=https://maven.neoforged.net/releases/net/neoforged/neoforge/%NEOFORGE_VERSION%/neoforge-%NEOFORGE_VERSION%-installer.jar"
set "INSTALLER_JAR=neoforge-%NEOFORGE_VERSION%-installer.jar"

echo Downloading NeoForge %NEOFORGE_VERSION% installer...
curl -fsSL -o "%INSTALLER_JAR%" "%INSTALLER_URL%"

echo Installing NeoForge server...
java -jar "%INSTALLER_JAR%" --installServer

if defined SERVER_PAYLOAD_URL (
  echo Downloading server payload...
  curl -fsSL -o server-payload.zip "%SERVER_PAYLOAD_URL%"
  echo Unpacking server payload...
  powershell -NoProfile -Command "Expand-Archive -LiteralPath 'server-payload.zip' -DestinationPath '.' -Force"
  del /q server-payload.zip
)

del /q "%INSTALLER_JAR%"
echo Done. Start the server with run.bat
pause
