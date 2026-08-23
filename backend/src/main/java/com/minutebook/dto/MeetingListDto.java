package com.minutebook.dto;

import com.minutebook.model.Meeting;
import com.minutebook.model.enums.MeetingStatus;

import java.time.LocalDateTime;

public class MeetingListDto {

    private String id;
    private String title;
    private MeetingStatus status;
    private Integer durationSeconds;
    private LocalDateTime createdAt;

    public MeetingListDto() {}

    public static MeetingListDto from(Meeting meeting) {
        MeetingListDto dto = new MeetingListDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setStatus(meeting.getStatus());
        dto.setDurationSeconds(meeting.getDurationSeconds());
        dto.setCreatedAt(meeting.getCreatedAt());
        return dto;
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
