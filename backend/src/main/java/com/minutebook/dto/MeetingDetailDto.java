package com.minutebook.dto;

import com.minutebook.model.*;
import com.minutebook.model.enums.MeetingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class MeetingDetailDto {

    private String id;
    private String title;
    private MeetingStatus status;
    private Integer durationSeconds;
    private String summary;
    private LocalDateTime createdAt;
    private List<SegmentDto> transcriptSegments;
    private List<DecisionDto> keyDecisions;
    private List<ActionItemDto> actionItems;
    private List<ChapterDto> chapters;

    public static MeetingDetailDto from(Meeting meeting) {
        MeetingDetailDto dto = new MeetingDetailDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setStatus(meeting.getStatus());
        dto.setDurationSeconds(meeting.getDurationSeconds());
        dto.setSummary(meeting.getSummary());
        dto.setCreatedAt(meeting.getCreatedAt());

        dto.setTranscriptSegments(
                meeting.getTranscriptSegments().stream()
                        .map(SegmentDto::from)
                        .collect(Collectors.toList())
        );
        dto.setKeyDecisions(
                meeting.getKeyDecisions().stream()
                        .map(DecisionDto::from)
                        .collect(Collectors.toList())
        );
        dto.setActionItems(
                meeting.getActionItems().stream()
                        .map(ActionItemDto::from)
                        .collect(Collectors.toList())
        );
        dto.setChapters(
                meeting.getChapters().stream()
                        .map(ChapterDto::from)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    // --- Nested DTOs ---

    public static class SegmentDto {
        private String id;
        private String speakerLabel;
        private BigDecimal startTime;
        private BigDecimal endTime;
        private String text;
        private Integer sequence;

        public static SegmentDto from(TranscriptSegment seg) {
            SegmentDto dto = new SegmentDto();
            dto.id = seg.getId();
            dto.speakerLabel = seg.getSpeakerLabel();
            dto.startTime = seg.getStartTime();
            dto.endTime = seg.getEndTime();
            dto.text = seg.getText();
            dto.sequence = seg.getSequence();
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSpeakerLabel() { return speakerLabel; }
        public void setSpeakerLabel(String speakerLabel) { this.speakerLabel = speakerLabel; }
        public BigDecimal getStartTime() { return startTime; }
        public void setStartTime(BigDecimal startTime) { this.startTime = startTime; }
        public BigDecimal getEndTime() { return endTime; }
        public void setEndTime(BigDecimal endTime) { this.endTime = endTime; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
    }

    public static class DecisionDto {
        private String id;
        private String decision;
        private String context;
        private BigDecimal sourceTimestamp;

        public static DecisionDto from(KeyDecision kd) {
            DecisionDto dto = new DecisionDto();
            dto.id = kd.getId();
            dto.decision = kd.getDecision();
            dto.context = kd.getContext();
            dto.sourceTimestamp = kd.getSourceTimestamp();
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
        public BigDecimal getSourceTimestamp() { return sourceTimestamp; }
        public void setSourceTimestamp(BigDecimal sourceTimestamp) { this.sourceTimestamp = sourceTimestamp; }
    }

    public static class ActionItemDto {
        private String id;
        private String task;
        private String owner;
        private String deadline;
        private String priority;
        private BigDecimal sourceTimestamp;
        private Boolean isComplete;

        public static ActionItemDto from(ActionItem ai) {
            ActionItemDto dto = new ActionItemDto();
            dto.id = ai.getId();
            dto.task = ai.getTask();
            dto.owner = ai.getOwner();
            dto.deadline = ai.getDeadline();
            dto.priority = ai.getPriority() != null ? ai.getPriority().name() : "medium";
            dto.sourceTimestamp = ai.getSourceTimestamp();
            dto.isComplete = ai.getIsComplete();
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTask() { return task; }
        public void setTask(String task) { this.task = task; }
        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }
        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public BigDecimal getSourceTimestamp() { return sourceTimestamp; }
        public void setSourceTimestamp(BigDecimal sourceTimestamp) { this.sourceTimestamp = sourceTimestamp; }
        public Boolean getIsComplete() { return isComplete; }
        public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
    }

    public static class ChapterDto {
        private String id;
        private String title;
        private BigDecimal startTime;

        public static ChapterDto from(Chapter ch) {
            ChapterDto dto = new ChapterDto();
            dto.id = ch.getId();
            dto.title = ch.getTitle();
            dto.startTime = ch.getStartTime();
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public BigDecimal getStartTime() { return startTime; }
        public void setStartTime(BigDecimal startTime) { this.startTime = startTime; }
    }

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<SegmentDto> getTranscriptSegments() { return transcriptSegments; }
    public void setTranscriptSegments(List<SegmentDto> transcriptSegments) { this.transcriptSegments = transcriptSegments; }
    public List<DecisionDto> getKeyDecisions() { return keyDecisions; }
    public void setKeyDecisions(List<DecisionDto> keyDecisions) { this.keyDecisions = keyDecisions; }
    public List<ActionItemDto> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItemDto> actionItems) { this.actionItems = actionItems; }
    public List<ChapterDto> getChapters() { return chapters; }
    public void setChapters(List<ChapterDto> chapters) { this.chapters = chapters; }
}
