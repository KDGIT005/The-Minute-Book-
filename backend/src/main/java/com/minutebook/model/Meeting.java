package com.minutebook.model;

import com.minutebook.model.enums.MeetingStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "audio_path", nullable = false, columnDefinition = "TEXT")
    private String audioPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MeetingStatus status = MeetingStatus.QUEUED;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    private List<TranscriptSegment> transcriptSegments = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KeyDecision> keyDecisions = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActionItem> actionItems = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startTime ASC")
    private List<Chapter> chapters = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // --- Constructors ---
    public Meeting() {}

    public Meeting(String title, String audioPath) {
        this.title = title;
        this.audioPath = audioPath;
        this.status = MeetingStatus.QUEUED;
    }

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAudioPath() { return audioPath; }
    public void setAudioPath(String audioPath) { this.audioPath = audioPath; }

    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<TranscriptSegment> getTranscriptSegments() { return transcriptSegments; }
    public void setTranscriptSegments(List<TranscriptSegment> segments) { this.transcriptSegments = segments; }

    public List<KeyDecision> getKeyDecisions() { return keyDecisions; }
    public void setKeyDecisions(List<KeyDecision> decisions) { this.keyDecisions = decisions; }

    public List<ActionItem> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItem> items) { this.actionItems = items; }

    public List<Chapter> getChapters() { return chapters; }
    public void setChapters(List<Chapter> chapters) { this.chapters = chapters; }
}
