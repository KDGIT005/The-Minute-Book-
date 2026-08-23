package com.minutebook.repository;

import com.minutebook.model.TranscriptSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranscriptSegmentRepository extends JpaRepository<TranscriptSegment, String> {

    List<TranscriptSegment> findByMeetingIdOrderBySequenceAsc(String meetingId);
}
