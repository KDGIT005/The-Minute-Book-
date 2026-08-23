package com.minutebook.service;

import com.minutebook.model.*;
import com.minutebook.model.enums.MeetingStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Export service — generates Markdown, JSON, and SRT format exports.
 */
@Service
public class ExportService {

    private final ObjectMapper objectMapper;

    public ExportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper.copy()
                .enable(SerializationFeature.INDENT_OUTPUT);
    }

    public String exportMarkdown(Meeting meeting) {
        StringBuilder md = new StringBuilder();

        // Title
        md.append("# ").append(meeting.getTitle()).append("\n\n");
        md.append("**Date:** ").append(meeting.getCreatedAt().toLocalDate()).append("  \n");
        if (meeting.getDurationSeconds() != null) {
            md.append("**Duration:** ").append(formatDuration(meeting.getDurationSeconds())).append("  \n");
        }
        md.append("\n---\n\n");

        // Executive Summary
        if (meeting.getSummary() != null && !meeting.getSummary().isBlank()) {
            md.append("## Summary\n\n");
            md.append(meeting.getSummary()).append("\n\n");
        }

        // Key Decisions
        if (!meeting.getKeyDecisions().isEmpty()) {
            md.append("## Key Decisions\n\n");
            for (KeyDecision kd : meeting.getKeyDecisions()) {
                md.append("- **").append(kd.getDecision()).append("**");
                if (kd.getContext() != null) {
                    md.append(" — ").append(kd.getContext());
                }
                md.append("\n");
            }
            md.append("\n");
        }

        // Action Items
        if (!meeting.getActionItems().isEmpty()) {
            md.append("## Action Items\n\n");
            md.append("| Task | Owner | Deadline | Priority | Status |\n");
            md.append("|------|-------|----------|----------|--------|\n");
            for (ActionItem ai : meeting.getActionItems()) {
                md.append("| ").append(ai.getTask());
                md.append(" | ").append(ai.getOwner() != null ? ai.getOwner() : "—");
                md.append(" | ").append(ai.getDeadline() != null ? ai.getDeadline() : "—");
                md.append(" | ").append(ai.getPriority() != null ? ai.getPriority().name() : "medium");
                md.append(" | ").append(Boolean.TRUE.equals(ai.getIsComplete()) ? "✅" : "⬜");
                md.append(" |\n");
            }
            md.append("\n");
        }

        // Transcript
        if (!meeting.getTranscriptSegments().isEmpty()) {
            md.append("## Transcript\n\n");
            for (TranscriptSegment seg : meeting.getTranscriptSegments()) {
                String ts = formatTimestamp(seg.getStartTime());
                String speaker = seg.getSpeakerLabel() != null ? seg.getSpeakerLabel() : "Speaker";
                md.append("**[").append(ts).append("] ").append(speaker).append(":** ")
                        .append(seg.getText()).append("\n\n");
            }
        }

        return md.toString();
    }

    public String exportJson(Meeting meeting) {
        try {
            Map<String, Object> export = new LinkedHashMap<>();
            export.put("title", meeting.getTitle());
            export.put("date", meeting.getCreatedAt().toLocalDate().toString());
            export.put("duration_seconds", meeting.getDurationSeconds());
            export.put("summary", meeting.getSummary());

            export.put("key_decisions", meeting.getKeyDecisions().stream()
                    .map(kd -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("decision", kd.getDecision());
                        map.put("context", kd.getContext());
                        map.put("source_timestamp", kd.getSourceTimestamp());
                        return map;
                    }).collect(Collectors.toList()));

            export.put("action_items", meeting.getActionItems().stream()
                    .map(ai -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("task", ai.getTask());
                        map.put("owner", ai.getOwner());
                        map.put("deadline", ai.getDeadline());
                        map.put("priority", ai.getPriority() != null ? ai.getPriority().name() : "medium");
                        map.put("is_complete", ai.getIsComplete());
                        return map;
                    }).collect(Collectors.toList()));

            export.put("transcript", meeting.getTranscriptSegments().stream()
                    .map(seg -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("start_time", seg.getStartTime());
                        map.put("end_time", seg.getEndTime());
                        map.put("speaker", seg.getSpeakerLabel());
                        map.put("text", seg.getText());
                        return map;
                    }).collect(Collectors.toList()));

            return objectMapper.writeValueAsString(export);

        } catch (Exception e) {
            throw new RuntimeException("Failed to export meeting as JSON", e);
        }
    }

    public String exportSrt(Meeting meeting) {
        StringBuilder srt = new StringBuilder();
        List<TranscriptSegment> segments = meeting.getTranscriptSegments();

        for (int i = 0; i < segments.size(); i++) {
            TranscriptSegment seg = segments.get(i);
            srt.append(i + 1).append("\n");
            srt.append(formatSrtTimestamp(seg.getStartTime()))
                    .append(" --> ")
                    .append(formatSrtTimestamp(seg.getEndTime()))
                    .append("\n");
            if (seg.getSpeakerLabel() != null) {
                srt.append("[").append(seg.getSpeakerLabel()).append("] ");
            }
            srt.append(seg.getText()).append("\n\n");
        }

        return srt.toString();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String formatTimestamp(BigDecimal seconds) {
        if (seconds == null) return "00:00";
        int totalSecs = seconds.intValue();
        int hrs = totalSecs / 3600;
        int mins = (totalSecs % 3600) / 60;
        int secs = totalSecs % 60;
        if (hrs > 0) {
            return String.format("%d:%02d:%02d", hrs, mins, secs);
        }
        return String.format("%02d:%02d", mins, secs);
    }

    private String formatSrtTimestamp(BigDecimal seconds) {
        if (seconds == null) return "00:00:00,000";
        double totalSecs = seconds.doubleValue();
        int hrs = (int) (totalSecs / 3600);
        int mins = (int) ((totalSecs % 3600) / 60);
        int secs = (int) (totalSecs % 60);
        int millis = (int) ((totalSecs - Math.floor(totalSecs)) * 1000);
        return String.format("%02d:%02d:%02d,%03d", hrs, mins, secs, millis);
    }

    private String formatDuration(int totalSeconds) {
        int hrs = totalSeconds / 3600;
        int mins = (totalSeconds % 3600) / 60;
        int secs = totalSeconds % 60;
        if (hrs > 0) {
            return String.format("%dh %dm %ds", hrs, mins, secs);
        }
        return String.format("%dm %ds", mins, secs);
    }
}
