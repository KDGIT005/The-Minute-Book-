package com.minutebook.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "transcript_segments")
public class TranscriptSegment {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "speaker_label", length = 100)
    private String speakerLabel;

    @Column(name = "start_time", nullable = false, precision = 10, scale = 3)
    private BigDecimal startTime;

    @Column(name = "end_time", nullable = false, precision = 10, scale = 3)
    private BigDecimal endTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private Integer sequence;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    // --- Constructors ---
    public TranscriptSegment() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

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
