package com.fullstack.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class S3Service {

    @Value("${AWS_ACCESS_KEY_ID}")
    private String accessKey;

    @Value("${AWS_SECRET_ACCESS_KEY}")
    private String secretKey;

    @Value("${AWS_S3_BUCKET}")
    private String bucket;

    @Value("${AWS_REGION}")
    private String region;

    public Map<String, String> generatePresignedUrl(Map<String, String> body) {
        String fileName = body.get("fileName");
        String fileType = body.get("fileType");
        String eventId = body.get("eventId");

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        String key = String.format("uploads/%s/%s", eventId, fileName);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(fileType)
                .build();

        PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(
                r -> r.signatureDuration(Duration.ofMinutes(60))
                        .putObjectRequest(objectRequest)
        );

        URL uploadUrl = presignedRequest.url();
        String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);

        Map<String, String> response = new HashMap<>();
        response.put("uploadUrl", uploadUrl.toString());
        response.put("publicUrl", publicUrl);

        presigner.close();
        return response;
    }
}