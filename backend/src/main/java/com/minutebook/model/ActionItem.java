package com.minutebook.model;

import com.minutebook.model.enums.Priority;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "action_items")
public class ActionItem {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String task;

    @Column(length = 255)
    private String owner;

    @Column(length = 100)
    private String deadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Priority priority = Priority.medium;

    @Column(name = "source_timestamp", precision = 10, scale = 3)
    private BigDecimal sourceTimestamp;

    @Column(name = "is_complete")
    private Boolean isComplete = false;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    // --- Constructors ---
    public ActionItem() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public BigDecimal getSourceTimestamp() { return sourceTimestamp; }
    public void setSourceTimestamp(BigDecimal sourceTimestamp) { this.sourceTimestamp = sourceTimestamp; }

    public Boolean getIsComplete() { return isComplete; }
    public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
}
