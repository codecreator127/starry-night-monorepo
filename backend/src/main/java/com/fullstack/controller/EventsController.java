package com.fullstack.controller;


import com.fullstack.api.EventsApi;
import com.fullstack.model.DeleteEventById200Response;
import com.fullstack.model.EventDto;
import com.fullstack.model.EventEntry;
import com.fullstack.service.EventService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class EventsController implements EventsApi {

    EventService eventService;

    @Override
    public ResponseEntity<EventDto> getEventById(Integer eventId) {

        EventEntry event = eventService.getEventById(eventId.longValue());

        EventDto eventDto = new EventDto();
        eventDto.setId(event.getId().intValue());
        eventDto.setTitle(event.getTitle());
        eventDto.setDescription(event.getText());
        eventDto.setImageUrl(event.getImageUrl());
        eventDto.setVideoUrl(event.getVideoUrl());

        return ResponseEntity.ok(eventDto);
    }

    @Override
    public ResponseEntity<List<EventDto>> getEvents() {

        List<EventEntry> events = eventService.getAllEvents();

        List<EventDto> eventDtos = events.stream().map(event -> {
            EventDto dto = new EventDto();
            dto.setId(event.getId().intValue());
            dto.setTitle(event.getTitle());
            dto.setDescription(event.getText());
            dto.setImageUrl(event.getImageUrl());
            dto.setVideoUrl(event.getVideoUrl());
            return dto;
        }).toList();

        return ResponseEntity.ok(eventDtos);
    }

    @Override
    public ResponseEntity<EventDto> createEvent(EventDto eventRequest) {

        EventEntry event = eventService.createEvent(
                eventRequest.getTitle(),
                eventRequest.getDescription(),
                eventRequest.getVideoUrl(),
                eventRequest.getImageUrl()
        );

        EventDto eventDto = new EventDto();
        eventDto.setId(event.getId().intValue());
        eventDto.setTitle(event.getTitle());
        eventDto.setDescription(event.getText());
        eventDto.setImageUrl(event.getImageUrl());
        eventDto.setVideoUrl(event.getVideoUrl());

        return ResponseEntity.ok(eventDto);
    }

    @Override
    public ResponseEntity<EventDto> updateEventById(Integer id, EventDto event) {
        EventEntry updatedEvent = eventService.updateEvent(
                id.longValue(),
                event.getTitle(),
                event.getDescription(),
                event.getVideoUrl(),
                event.getImageUrl()
        );
        EventDto eventDto = new EventDto();
        eventDto.setId(updatedEvent.getId().intValue());
        eventDto.setTitle(updatedEvent.getTitle());
        eventDto.setDescription(updatedEvent.getText());
        eventDto.setImageUrl(updatedEvent.getImageUrl());
        eventDto.setVideoUrl(updatedEvent.getVideoUrl());

        return ResponseEntity.ok(eventDto);
    }

    @Override
    public ResponseEntity<DeleteEventById200Response> deleteEventById(Integer id) {

        eventService.deleteEvent(id.longValue());

        DeleteEventById200Response response = new DeleteEventById200Response();
        response.setMessage("Event deleted successfully");
        return ResponseEntity.ok(response);
    }
}
