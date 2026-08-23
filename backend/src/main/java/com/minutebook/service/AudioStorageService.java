package com.minutebook.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Abstraction for audio file storage.
 * Interface-first design — trivially swappable to S3 or GCS later.
 */
public interface AudioStorageService {

    /**
     * Store the uploaded audio file and return the storage path.
     */
    String store(String meetingId, MultipartFile file) throws IOException;

    /**
     * Retrieve the path to a stored audio file.
     */
    Path getAudioPath(String meetingId, String filename);

    /**
     * Delete stored audio for a meeting.
     */
    void delete(String meetingId);
}
