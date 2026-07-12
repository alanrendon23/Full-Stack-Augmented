package com.augmented.backend.service;

import com.augmented.backend.model.AIStudyResponse;
import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

    private final OpenAIClient client;

    public AIStudyResponse analyzeStudyContent(String description) {
        String prompt = String.format(
            "Act as a high-level study assistant. Analyze the following content and respond STRICTLY in the original language of the input text.\n" +
            "Your response must follow this EXACT format:\n" +
            "IMPROVED_DESCRIPTION: [A better structured and cleaner version of the original content]\n" +
            "SUMMARY: [A concise summary]\n" +
            "CONCEPTS: [concept1, concept2, concept3]\n" +
            "FLASHCARDS: [{\"q\": \"...\", \"a\": \"...\"}, ...]\n\n" +
            "Content to analyze: %s", description
        );

        try {
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .addUserMessage(prompt)
                    .model("gemini-3.1-flash-lite")
                    .build();

            String output = client.chat().completions().create(params)
                    .choices().get(0).message().content()
                    .orElseThrow();

            return parseStudyOutput(output);
        } catch (Exception e) {
            System.err.println("AI Error: " + e.getMessage());
            e.printStackTrace();
            return new AIStudyResponse(
                description,
                "Error generating automated summary: " + e.getMessage(),
                List.of("Error"),
                "[]"
            );
        }
    }

    private AIStudyResponse parseStudyOutput(String output) {
        try {
            String improved = extractPart(output, "IMPROVED_DESCRIPTION:", "SUMMARY:");
            String summary = extractPart(output, "SUMMARY:", "CONCEPTS:");
            String conceptsStr = extractPart(output, "CONCEPTS:", "FLASHCARDS:");
            String flashcards = output.substring(output.indexOf("FLASHCARDS:") + "FLASHCARDS:".length()).trim();

            List<String> concepts = Arrays.stream(conceptsStr.split(","))
                    .map(c -> c.trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            return new AIStudyResponse(improved, summary, concepts, flashcards);
        } catch (Exception e) {
            return new AIStudyResponse(output, output, List.of("General"), "[]");
        }
    }

    private String extractPart(String text, String startDelim, String endDelim) {
        int start = text.indexOf(startDelim) + startDelim.length();
        int end = text.indexOf(endDelim);
        return text.substring(start, end).trim();
    }
}
