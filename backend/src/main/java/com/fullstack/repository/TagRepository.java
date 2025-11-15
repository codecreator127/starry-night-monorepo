package com.fullstack.repository;

import com.fullstack.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Tag findByTagName(String tagName);
}
