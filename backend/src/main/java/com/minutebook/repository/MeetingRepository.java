package com.minutebook.repository;

import com.minutebook.model.Meeting;
import com.minutebook.model.enums.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, String> {

    List<Meeting> findAllByOrderByCreatedAtDesc();

    List<Meeting> findByStatus(MeetingStatus status);
}
