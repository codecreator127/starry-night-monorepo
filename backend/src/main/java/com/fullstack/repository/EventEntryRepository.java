package com.fullstack.repository;

import com.fullstack.model.EventEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventEntryRepository extends JpaRepository<EventEntry, Long> {
    // Add custom queries if needed
}
