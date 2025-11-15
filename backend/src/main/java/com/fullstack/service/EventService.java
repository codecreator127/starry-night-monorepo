package com.fullstack.service;

import com.fullstack.model.EventEntry;
import com.fullstack.repository.EventEntryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventEntryRepository eventEntryRepository;

    public EventService(EventEntryRepository eventEntryRepository){
        this.eventEntryRepository = eventEntryRepository;
    }

    public EventEntry getEventById(Long id){
        return eventEntryRepository.findById(id).orElse(null);
    }

    public List<EventEntry> getAllEvents(){
        return eventEntryRepository.findAll();
    }

    public EventEntry createEvent(String title, String description, String videoUrl, String imageUrl) {
        EventEntry eventEntry = new EventEntry();
        eventEntry.setTitle(title);
        eventEntry.setText(description);
        eventEntry.setVideoUrl(videoUrl);
        eventEntry.setImageUrl(imageUrl);
        return eventEntryRepository.save(eventEntry);
    }

    public EventEntry updateEvent(Long id, String title, String description, String videoUrl, String imageUrl) {
        EventEntry eventEntry = eventEntryRepository.findById(id).orElse(null);
        if (eventEntry != null) {
            eventEntry.setTitle(title != null ? title : eventEntry.getTitle());
            eventEntry.setText(description != null ? description : eventEntry.getText());
            eventEntry.setVideoUrl(videoUrl != null ? videoUrl : eventEntry.getVideoUrl());
            eventEntry.setImageUrl(imageUrl != null ? imageUrl : eventEntry.getImageUrl());
            return eventEntryRepository.save(eventEntry);
        }
        return null;
    }


    public void deleteEvent(Long id) {
        eventEntryRepository.deleteById(id);
    }

}
