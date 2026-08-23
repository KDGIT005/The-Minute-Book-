package com.minutebook.dto;

public class ActionItemUpdateDto {

    private String task;
    private String owner;
    private String deadline;
    private String priority;
    private Boolean isComplete;

    public ActionItemUpdateDto() {}

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getIsComplete() { return isComplete; }
    public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
}
