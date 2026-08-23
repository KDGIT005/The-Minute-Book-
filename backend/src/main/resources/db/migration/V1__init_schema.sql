-- V1: Initial schema for Meeting Summarizer
-- Uses CHAR(36) for UUID primary keys (generated in Java)

CREATE TABLE meetings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    audio_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    duration_seconds INT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transcript_segments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    speaker_label VARCHAR(100),
    start_time DECIMAL(10,3) NOT NULL,
    end_time DECIMAL(10,3) NOT NULL,
    text TEXT NOT NULL,
    sequence INT NOT NULL,
    CONSTRAINT fk_segment_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX idx_segments_meeting ON transcript_segments(meeting_id);
CREATE INDEX idx_segments_sequence ON transcript_segments(meeting_id, sequence);

CREATE TABLE key_decisions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    decision TEXT NOT NULL,
    context TEXT,
    source_timestamp DECIMAL(10,3),
    CONSTRAINT fk_decision_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX idx_decisions_meeting ON key_decisions(meeting_id);

CREATE TABLE action_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    task TEXT NOT NULL,
    owner VARCHAR(255),
    deadline VARCHAR(100),
    priority VARCHAR(10) DEFAULT 'medium',
    source_timestamp DECIMAL(10,3),
    is_complete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_action_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX idx_actions_meeting ON action_items(meeting_id);

CREATE TABLE chapters (
    id CHAR(36) NOT NULL PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time DECIMAL(10,3) NOT NULL,
    CONSTRAINT fk_chapter_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX idx_chapters_meeting ON chapters(meeting_id);
