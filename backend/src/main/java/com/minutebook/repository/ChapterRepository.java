package com.minutebook.repository;

import com.minutebook.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, String> {

    List<Chapter> findByMeetingIdOrderByStartTimeAsc(String meetingId);
}
