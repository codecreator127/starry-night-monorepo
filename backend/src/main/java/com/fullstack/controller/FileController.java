package com.fullstack.controller;

import com.fullstack.api.FilesApi;
import com.fullstack.model.FileSignatureDto;
import com.fullstack.model.GetFileSignedUrl200Response;
import com.fullstack.service.EventService;
import com.fullstack.service.FileService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@AllArgsConstructor
public class FileController implements FilesApi {

    FileService fileService;
    EventService eventService;

    @Override
    public ResponseEntity<GetFileSignedUrl200Response> getFileSignedUrl(FileSignatureDto body) {

        String filename = body.getFileName();
        String fileType = body.getFileType();
        Integer eventId = body.getEventId();

        // check if event exists
        try {
            eventService.getEventById(eventId.longValue());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }


        Map<String, String> fileUrls = fileService.generatePresignedUploadUrl(filename);

        GetFileSignedUrl200Response response = new GetFileSignedUrl200Response();
        response.setUrl(fileUrls.get("publicUrl"));
        response.setSignedRequest(fileUrls.get("uploadUrl"));

        return ResponseEntity.ok(response);
    }
}
