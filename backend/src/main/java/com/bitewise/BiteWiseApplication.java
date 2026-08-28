package com.bitewise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class BiteWiseApplication {
    public static void main(String[] args) {
        loadDotEnvIntoSystemProperties();
        SpringApplication.run(BiteWiseApplication.class, args);
    }

    /**
     * Loads key=value pairs from a local .env file (if present) into JVM system
     * properties before Spring Boot starts. This means the app configures itself
     * correctly whether it is started with `./run.sh`, `run.bat`, an IDE "Run"
     * button, or `mvn spring-boot:run` directly — no manual shell exporting
     * required, and it works the same on Windows, macOS and Linux.
     *
     * Values already present as real environment variables or JVM system
     * properties always take priority and are never overwritten.
     */
    private static void loadDotEnvIntoSystemProperties() {
        Path envFile = Path.of(".env");
        if (!Files.isRegularFile(envFile)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(envFile);
            for (String rawLine : lines) {
                String line = rawLine.strip();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eq = line.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = line.substring(0, eq).strip();
                String value = line.substring(eq + 1).strip();
                // Strip surrounding quotes if present
                if (value.length() >= 2 && (value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                boolean alreadySetInEnv = System.getenv(key) != null;
                boolean alreadySetAsProperty = System.getProperty(key) != null;
                if (!alreadySetInEnv && !alreadySetAsProperty) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException e) {
            System.err.println("[BiteWise] Could not read .env file: " + e.getMessage());
        }
    }
}
