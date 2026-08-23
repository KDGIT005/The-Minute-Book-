package com.minutebook.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class LocalAudioStorageService implements AudioStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalAudioStorageService.class);

    private final Path rootDir;

    public LocalAudioStorageService(@Value("${app.audio.storage-dir}") String storageDir) {
        this.rootDir = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootDir);
            log.info("Audio storage directory: {}", this.rootDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create audio storage directory: " + this.rootDir, e);
        }
    }

    @Override
    public String store(String meetingId, MultipartFile file) throws IOException {
        Path meetingDir = rootDir.resolve(meetingId);
        Files.createDirectories(meetingDir);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "audio.mp3";
        }
        // Sanitize filename
        String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path targetPath = meetingDir.resolve(safeFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored audio file: {} ({} bytes)", targetPath, file.getSize());
        return targetPath.toString();
    }

    @Override
    public Path getAudioPath(String meetingId, String filename) {
        return rootDir.resolve(meetingId).resolve(filename);
    }

    @Override
    public void delete(String meetingId) {
        Path meetingDir = rootDir.resolve(meetingId);
        try {
            if (Files.exists(meetingDir)) {
                Files.walk(meetingDir)
                        .sorted(java.util.Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (IOException e) {
                                log.warn("Failed to delete: {}", path, e);
                            }
                        });
            }
        } catch (IOException e) {
            log.warn("Failed to clean up meeting directory: {}", meetingDir, e);
        }
    }
}
