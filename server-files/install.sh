#!/usr/bin/env sh
# Downloads and installs NeoForge server.
# Run once after extracting the server package.
# Requirements: Java on PATH, internet access.

NEOFORGE_VERSION="21.1.218"
INSTALLER_URL="https://maven.neoforged.net/releases/net/neoforged/neoforge/${NEOFORGE_VERSION}/neoforge-${NEOFORGE_VERSION}-installer.jar"
INSTALLER_JAR="neoforge-${NEOFORGE_VERSION}-installer.jar"

echo "Downloading NeoForge ${NEOFORGE_VERSION} installer..."
curl -Lo "${INSTALLER_JAR}" "${INSTALLER_URL}"

echo "Installing server..."
java -jar "${INSTALLER_JAR}" --installServer

echo "Cleaning up..."
rm "${INSTALLER_JAR}"

echo "Done. Start the server with ./run.sh"
