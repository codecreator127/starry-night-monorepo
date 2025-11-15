package com.fullstack.controller;

import com.fullstack.api.S3Api;
import com.fullstack.model.GetS3SignedUrl200Response;
import com.fullstack.model.S3SignatureDto;
import com.fullstack.service.EventService;
import com.fullstack.service.S3Service;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@AllArgsConstructor
public class S3Controller implements S3Api {

    S3Service s3Service;
    EventService eventService;

    @Override
    public ResponseEntity<GetS3SignedUrl200Response> getS3SignedUrl(S3SignatureDto body) {

        String filename = body.getFileName();
        String fileType = body.getFileType();
        Integer eventId = body.getEventId();

        // check if event exists
        try {
            eventService.getEventById(eventId.longValue());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }


        Map<String, String> fileParams = Map.of(
                "fileName", filename,
                "fileType", fileType,
                "eventId", eventId.toString()
        );

        Map<String, String> fileUrls = s3Service.generatePresignedUrl(fileParams);

        GetS3SignedUrl200Response response = new GetS3SignedUrl200Response();
        response.setUrl(fileUrls.get("publicUrl"));
        response.setSignedRequest(fileUrls.get("uploadUrl"));

        return ResponseEntity.ok(response);
    }
}
