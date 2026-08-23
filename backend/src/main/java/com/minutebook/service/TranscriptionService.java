package com.minutebook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minutebook.model.TranscriptSegment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Calls Groq Whisper API for audio-to-text transcription.
 * Returns segment-level timestamps for the transcript UI.
 */
@Service
public class TranscriptionService {

    private static final Logger log = LoggerFactory.getLogger(TranscriptionService.class);

    private final RestClient groqRestClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public TranscriptionService(
            @Qualifier("groqRestClient") RestClient groqRestClient,
            ObjectMapper objectMapper,
            @Value("${app.groq.model}") String model) {
        this.groqRestClient = groqRestClient;
        this.objectMapper = objectMapper;
        this.model = model;
    }

    /**
     * Transcribe an audio file, returning timestamped segments.
     *
     * @param audioPath   path to the audio file on disk
     * @param meetingTitle used as a prompt hint to bias proper noun recognition
     * @return ordered list of transcript segments (not yet persisted)
     */
    public TranscriptionResult transcribe(Path audioPath, String meetingTitle) {
        log.info("Starting transcription of: {}", audioPath.getFileName());

        FileSystemResource audioResource = new FileSystemResource(audioPath);

        // Build multipart form data
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", audioResource);
        body.add("model", model);
        body.add("response_format", "verbose_json");
        body.add("timestamp_granularities[]", "segment");
        // Use meeting title as prompt hint for proper noun accuracy
        if (meetingTitle != null && !meetingTitle.isBlank()) {
            body.add("prompt", meetingTitle);
        }

        String responseBody = groqRestClient.post()
                .uri("/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

        return parseResponse(responseBody);
    }

    private TranscriptionResult parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            String fullText = root.has("text") ? root.get("text").asText() : "";
            double duration = root.has("duration") ? root.get("duration").asDouble() : 0.0;

            List<TranscriptSegment> segments = new ArrayList<>();
            JsonNode segmentsNode = root.get("segments");

            if (segmentsNode != null && segmentsNode.isArray()) {
                int sequence = 0;
                for (JsonNode segNode : segmentsNode) {
                    TranscriptSegment segment = new TranscriptSegment();
                    segment.setStartTime(BigDecimal.valueOf(segNode.get("start").asDouble()));
                    segment.setEndTime(BigDecimal.valueOf(segNode.get("end").asDouble()));
                    segment.setText(segNode.get("text").asText().trim());
                    segment.setSpeakerLabel("Speaker"); // No diarization in MVP
                    segment.setSequence(sequence++);
                    segments.add(segment);
                }
            }

            log.info("Transcription complete: {} segments, {}s duration", segments.size(), (int) duration);
            return new TranscriptionResult(fullText, segments, (int) duration);

        } catch (Exception e) {
            log.error("Failed to parse Groq transcription response", e);
            throw new RuntimeException("Failed to parse transcription response", e);
        }
    }

    /**
     * Result holder for transcription output.
     */
    public record TranscriptionResult(
            String fullText,
            List<TranscriptSegment> segments,
            int durationSeconds
    ) {}
}
