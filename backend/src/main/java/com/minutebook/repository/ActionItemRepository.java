package com.minutebook.repository;

import com.minutebook.model.ActionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, String> {

    List<ActionItem> findByMeetingId(String meetingId);
}
