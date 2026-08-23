package com.minutebook.service;

import com.minutebook.model.*;
import com.minutebook.model.enums.MeetingStatus;
import com.minutebook.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Async orchestrator for the full meeting processing pipeline.
 * Coordinates: file storage → transcription → summarization → persistence.
 */
@Service
public class MeetingProcessingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingProcessingService.class);

    private final MeetingRepository meetingRepository;
    private final TranscriptSegmentRepository segmentRepository;
    private final KeyDecisionRepository decisionRepository;
    private final ActionItemRepository actionItemRepository;
    private final ChapterRepository chapterRepository;
    private final TranscriptionService transcriptionService;
    private final SummarizationService summarizationService;

    public MeetingProcessingService(
            MeetingRepository meetingRepository,
            TranscriptSegmentRepository segmentRepository,
            KeyDecisionRepository decisionRepository,
            ActionItemRepository actionItemRepository,
            ChapterRepository chapterRepository,
            TranscriptionService transcriptionService,
            SummarizationService summarizationService) {
        this.meetingRepository = meetingRepository;
        this.segmentRepository = segmentRepository;
        this.decisionRepository = decisionRepository;
        this.actionItemRepository = actionItemRepository;
        this.chapterRepository = chapterRepository;
        this.transcriptionService = transcriptionService;
        this.summarizationService = summarizationService;
    }

    /**
     * Process a meeting asynchronously — transcription then summarization.
     * Updates status at each stage so the frontend can poll for progress.
     */
    @Async("meetingProcessingExecutor")
    public void processAsync(String meetingId) {
        log.info("Starting async processing for meeting: {}", meetingId);

        try {
            // ── Step 1: Transcription ─────────────────────────────────
            updateStatus(meetingId, MeetingStatus.TRANSCRIBING);

            Meeting meeting = meetingRepository.findById(meetingId)
                    .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

            Path audioPath = Paths.get(meeting.getAudioPath());
            TranscriptionService.TranscriptionResult transcription =
                    transcriptionService.transcribe(audioPath, meeting.getTitle());

            // Persist transcript segments
            persistTranscriptSegments(meeting, transcription.segments());
            meeting.setDurationSeconds(transcription.durationSeconds());
            meetingRepository.save(meeting);

            log.info("Transcription saved: {} segments for meeting {}", transcription.segments().size(), meetingId);

            // ── Step 2: Summarization (Stages A→B→C→D) ───────────────
            updateStatus(meetingId, MeetingStatus.SUMMARIZING);

            // Reload segments from DB to ensure they're properly managed
            List<TranscriptSegment> savedSegments =
                    segmentRepository.findByMeetingIdOrderBySequenceAsc(meetingId);

            SummarizationService.SummarizationResult summaryResult =
                    summarizationService.summarize(savedSegments);

            // Persist all summarization results
            persistSummarizationResults(meeting, summaryResult);

            log.info("Summarization complete for meeting: {}", meetingId);

            // ── Step 3: Done ──────────────────────────────────────────
            updateStatus(meetingId, MeetingStatus.DONE);

        } catch (Exception e) {
            log.error("Meeting processing failed for: {}", meetingId, e);
            updateStatus(meetingId, MeetingStatus.FAILED);
        }
    }

    @Transactional
    protected void persistTranscriptSegments(Meeting meeting, List<TranscriptSegment> segments) {
        for (TranscriptSegment segment : segments) {
            segment.setMeeting(meeting);
        }
        segmentRepository.saveAll(segments);
    }

    @Transactional
    protected void persistSummarizationResults(Meeting meeting, SummarizationService.SummarizationResult result) {
        // Executive summary
        meeting.setSummary(result.executiveSummary());
        meetingRepository.save(meeting);

        // Key decisions
        for (KeyDecision decision : result.decisions()) {
            decision.setMeeting(meeting);
        }
        decisionRepository.saveAll(result.decisions());

        // Action items
        for (ActionItem item : result.actionItems()) {
            item.setMeeting(meeting);
        }
        actionItemRepository.saveAll(result.actionItems());

        // Chapters
        for (Chapter chapter : result.chapters()) {
            chapter.setMeeting(meeting);
        }
        chapterRepository.saveAll(result.chapters());
    }

    private void updateStatus(String meetingId, MeetingStatus status) {
        meetingRepository.findById(meetingId).ifPresent(meeting -> {
            meeting.setStatus(status);
            meetingRepository.save(meeting);
            log.info("Meeting {} status → {}", meetingId, status);
        });
    }
}
