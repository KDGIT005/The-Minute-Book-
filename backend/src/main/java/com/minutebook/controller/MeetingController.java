package com.minutebook.controller;

import com.minutebook.dto.*;
import com.minutebook.model.ActionItem;
import com.minutebook.model.Meeting;
import com.minutebook.model.enums.MeetingStatus;
import com.minutebook.model.enums.Priority;
import com.minutebook.repository.ActionItemRepository;
import com.minutebook.repository.MeetingRepository;
import com.minutebook.service.AudioStorageService;
import com.minutebook.service.ExportService;
import com.minutebook.service.MeetingProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for meeting operations.
 * No business logic — delegates everything to services.
 */
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private static final Logger log = LoggerFactory.getLogger(MeetingController.class);

    private final MeetingRepository meetingRepository;
    private final ActionItemRepository actionItemRepository;
    private final AudioStorageService audioStorageService;
    private final MeetingProcessingService processingService;
    private final ExportService exportService;

    public MeetingController(
            MeetingRepository meetingRepository,
            ActionItemRepository actionItemRepository,
            AudioStorageService audioStorageService,
            MeetingProcessingService processingService,
            ExportService exportService) {
        this.meetingRepository = meetingRepository;
        this.actionItemRepository = actionItemRepository;
        this.audioStorageService = audioStorageService;
        this.processingService = processingService;
        this.exportService = exportService;
    }

    /**
     * Upload audio + title, kicks off async pipeline.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StatusDto> uploadMeeting(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {

        // Validate file
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Audio file is required. Upload an mp3, wav, or m4a file.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (!lower.endsWith(".mp3") && !lower.endsWith(".wav") &&
                    !lower.endsWith(".m4a") && !lower.endsWith(".webm") &&
                    !lower.endsWith(".ogg") && !lower.endsWith(".flac")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unsupported audio format. Upload an mp3, wav, m4a, webm, ogg, or flac file.");
            }
        }

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Meeting title is required.");
        }

        // Create meeting record
        Meeting meeting = new Meeting(title.trim(), "");
        meeting = meetingRepository.save(meeting);

        // Store audio file
        try {
            String audioPath = audioStorageService.store(meeting.getId(), file);
            meeting.setAudioPath(audioPath);
            meetingRepository.save(meeting);
        } catch (IOException e) {
            log.error("Failed to store audio file for meeting: {}", meeting.getId(), e);
            meetingRepository.delete(meeting);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to store audio file. Please try again.");
        }

        // Kick off async processing
        processingService.processAsync(meeting.getId());

        log.info("Meeting created: {} ({})", meeting.getId(), title);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new StatusDto(meeting.getId(), meeting.getStatus()));
    }

    /**
     * List all meetings (id, title, date, status).
     */
    @GetMapping
    public ResponseEntity<List<MeetingListDto>> listMeetings() {
        List<MeetingListDto> meetings = meetingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MeetingListDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(meetings);
    }

    /**
     * Full detail: transcript, summary, decisions, action items, chapters.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MeetingDetailDto> getMeeting(@PathVariable String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Meeting not found: " + id));
        return ResponseEntity.ok(MeetingDetailDto.from(meeting));
    }

    /**
     * Poll processing status.
     */
    @GetMapping("/{id}/status")
    public ResponseEntity<StatusDto> getStatus(@PathVariable String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Meeting not found: " + id));
        return ResponseEntity.ok(new StatusDto(meeting.getId(), meeting.getStatus()));
    }

    /**
     * Edit or check off an action item.
     */
    @PatchMapping("/{id}/action-items/{itemId}")
    public ResponseEntity<MeetingDetailDto.ActionItemDto> updateActionItem(
            @PathVariable String id,
            @PathVariable String itemId,
            @RequestBody ActionItemUpdateDto update) {

        // Verify meeting exists
        if (!meetingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found: " + id);
        }

        ActionItem item = actionItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Action item not found: " + itemId));

        // Verify action item belongs to this meeting
        if (!item.getMeeting().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Action item does not belong to this meeting.");
        }

        // Apply partial updates
        if (update.getTask() != null) item.setTask(update.getTask());
        if (update.getOwner() != null) item.setOwner(update.getOwner());
        if (update.getDeadline() != null) item.setDeadline(update.getDeadline());
        if (update.getPriority() != null) {
            try {
                item.setPriority(Priority.valueOf(update.getPriority().toLowerCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid priority. Use: high, medium, or low.");
            }
        }
        if (update.getIsComplete() != null) item.setIsComplete(update.getIsComplete());

        actionItemRepository.save(item);
        return ResponseEntity.ok(MeetingDetailDto.ActionItemDto.from(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Meeting not found: " + id));

        // Delete audio files
        audioStorageService.delete(meeting.getId());

        // Delete from database
        meetingRepository.delete(meeting);

        return ResponseEntity.noContent().build();
    }

    /**
     * Export meeting in specified format.
     */
    @GetMapping("/{id}/export")
    public ResponseEntity<String> exportMeeting(
            @PathVariable String id,
            @RequestParam(defaultValue = "md") String format) {

        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Meeting not found: " + id));

        if (meeting.getStatus() != MeetingStatus.DONE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Meeting is still processing. Export is available once status is DONE.");
        }

        String content;
        String contentType;
        String fileExtension;

        switch (format.toLowerCase()) {
            case "json" -> {
                content = exportService.exportJson(meeting);
                contentType = "application/json";
                fileExtension = "json";
            }
            case "srt" -> {
                content = exportService.exportSrt(meeting);
                contentType = "text/plain";
                fileExtension = "srt";
            }
            default -> {
                content = exportService.exportMarkdown(meeting);
                contentType = "text/markdown";
                fileExtension = "md";
            }
        }

        String safeTitle = meeting.getTitle().replaceAll("[^a-zA-Z0-9 _-]", "").replace(' ', '_');
        String filename = safeTitle + "." + fileExtension;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }
}
