package com.minutebook.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "key_decisions")
public class KeyDecision {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String decision;

    @Column(columnDefinition = "TEXT")
    private String context;

    @Column(name = "source_timestamp", precision = 10, scale = 3)
    private BigDecimal sourceTimestamp;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    // --- Constructors ---
    public KeyDecision() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public BigDecimal getSourceTimestamp() { return sourceTimestamp; }
    public void setSourceTimestamp(BigDecimal sourceTimestamp) { this.sourceTimestamp = sourceTimestamp; }
}
