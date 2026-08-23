package com.minutebook.dto;

import com.minutebook.model.enums.MeetingStatus;

public class StatusDto {

    private String id;
    private MeetingStatus status;

    public StatusDto() {}

    public StatusDto(String id, MeetingStatus status) {
        this.id = id;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
}
