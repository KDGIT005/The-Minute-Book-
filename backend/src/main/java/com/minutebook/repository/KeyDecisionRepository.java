package com.minutebook.repository;

import com.minutebook.model.KeyDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KeyDecisionRepository extends JpaRepository<KeyDecision, String> {

    List<KeyDecision> findByMeetingId(String meetingId);
}
