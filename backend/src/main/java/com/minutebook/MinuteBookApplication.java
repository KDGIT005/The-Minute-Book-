package com.minutebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class MinuteBookApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(MinuteBookApplication.class, args);
    }

    private static void loadEnv() {
        Path[] searchPaths = {
            Paths.get(".env"),
            Paths.get("../.env"),
            Paths.get("../../.env")
        };

        for (Path path : searchPaths) {
            Path abs = path.toAbsolutePath().normalize();
            if (Files.exists(path)) {
                System.out.println(">>> Loading configuration from: " + abs);
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                            int idx = line.indexOf('=');
                            String key = line.substring(0, idx).trim();
                            String value = line.substring(idx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            System.setProperty(key, value);
                            // Also set standard spring properties for maximum reliability
                            if ("DB_USER".equals(key)) {
                                System.setProperty("spring.datasource.username", value);
                            } else if ("DB_PASSWORD".equals(key)) {
                                System.setProperty("spring.datasource.password", value);
                            } else if ("GROQ_API_KEY".equals(key)) {
                                System.setProperty("app.groq.api-key", value);
                            } else if ("OPENAI_API_KEY".equals(key)) {
                                System.setProperty("app.openai.api-key", value);
                            } else if ("GEMINI_API_KEY".equals(key)) {
                                System.setProperty("app.gemini.api-key", value);
                            }
                        }
                    }
                    break;
                } catch (IOException e) {
                    System.err.println("Failed to read .env: " + e.getMessage());
                }
            }
        }
    }
}
