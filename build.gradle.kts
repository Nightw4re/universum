plugins {
    kotlin("jvm") version "1.9.22" // nebo aktualni verze kotlinu
    application
}

tasks.register<Zip>("modpackZip") {
    archiveFileName.set("modpack.zip")
    destinationDirectory.set(layout.buildDirectory.get().asFile.resolve("distributions"))
    from(file("modpack"))
}

application {
    mainClass.set("MainKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
    
}