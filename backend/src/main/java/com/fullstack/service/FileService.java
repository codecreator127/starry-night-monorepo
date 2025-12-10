package com.fullstack.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class FileService {

    private final WebClient webClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    @Value("${supabase.url.expiry:3600}")
    private int expirySeconds;

    public FileService() {
        this.webClient = WebClient.builder().build();
    }

    public Map<String, String> generatePresignedUploadUrl(String fileName) {
        String path = "uploads/" + fileName;

        Map<String, Object> body = new HashMap<>();
        body.put("bucketId", bucket);
        body.put("name", path);
        body.put("expiresIn", expirySeconds);

        String signedUrlResponse = webClient.post()
                .uri(supabaseUrl + "/storage/v1/object/sign/" + bucket + "/" + path)
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        Map<String, String> response = new HashMap<>();
        assert signedUrlResponse != null;
        response.put("signedUrl", extractSignedUrl(signedUrlResponse));
        response.put("publicUrl", supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path);
        return response;
    }

    private String extractSignedUrl(String json) {
        // very simple extraction without full JSON parsing
        // replace with proper JSON parser if needed
        int start = json.indexOf("signedURL\":\"") + 12;
        int end = json.indexOf("\"", start);
        return json.substring(start, end);
    }
}
