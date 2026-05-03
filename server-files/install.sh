#!/usr/bin/env sh
# Minimal server installer template.
# build-server.mjs rewrites this file with the current NeoForge version.
set -eu

NEOFORGE_VERSION="${NEOFORGE_VERSION:-21.1.218}"
INSTALLER_URL="https://maven.neoforged.net/releases/net/neoforged/neoforge/${NEOFORGE_VERSION}/neoforge-${NEOFORGE_VERSION}-installer.jar"
INSTALLER_JAR="neoforge-${NEOFORGE_VERSION}-installer.jar"

echo "Downloading NeoForge ${NEOFORGE_VERSION} installer..."
curl -fsSL -o "${INSTALLER_JAR}" "${INSTALLER_URL}"

echo "Installing NeoForge server..."
java -jar "${INSTALLER_JAR}" --installServer

if [ -n "${SERVER_PAYLOAD_URL:-}" ]; then
  echo "Downloading server payload..."
  curl -fsSL -o server-payload.zip "${SERVER_PAYLOAD_URL}"
  echo "Unpacking server payload..."
  unzip -o server-payload.zip -d .
  rm -f server-payload.zip
fi

rm -f "${INSTALLER_JAR}"
echo "Done. Start the server with ./run.sh"
