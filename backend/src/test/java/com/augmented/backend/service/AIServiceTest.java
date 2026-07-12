package com.augmented.backend.service;

import com.augmented.backend.model.AIStudyResponse;
import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIServiceTest {

    @Mock(answer = org.mockito.Answers.RETURNS_DEEP_STUBS)
    private OpenAIClient client;

    private AIService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AIService(client);
    }

    @Test
    void analyzeStudyContent_Success() {
        // Arrange
        String description = "Photosynthesis is fundamental.";
        String aiOutput = "IMPROVED_DESCRIPTION: Improved description\n" +
            "SUMMARY: Short summary\n" +
            "CONCEPTS: concept1, concept2\n" +
            "FLASHCARDS: [{\"q\": \"what is it?\", \"a\": \"this\"}]";

        when(client.chat().completions().create(any(ChatCompletionCreateParams.class))
                .choices().get(0).message().content())
                .thenReturn(Optional.of(aiOutput));

        // Act
        AIStudyResponse response = aiService.analyzeStudyContent(description);

        // Assert
        assertEquals("Improved description", response.getImprovedDescription());
        assertEquals("Short summary", response.getSummary());
        assertTrue(response.getKeyConcepts().contains("concept1"));
        assertTrue(response.getKeyConcepts().contains("concept2"));
        assertEquals("[{\"q\": \"what is it?\", \"a\": \"this\"}]", response.getFlashcards());
    }

    @Test
    void analyzeStudyContent_Exception() {
        // Arrange
        String description = "Content";
        when(client.chat().completions().create(any(ChatCompletionCreateParams.class)))
                .thenThrow(new RuntimeException("API Connection Error"));

        // Act
        AIStudyResponse response = aiService.analyzeStudyContent(description);

        // Assert
        assertEquals("Content", response.getImprovedDescription());
        assertTrue(response.getSummary().contains("Error generating automated summary:"));
        assertTrue(response.getSummary().contains("API Connection Error"));
        assertEquals("Error", response.getKeyConcepts().get(0));
        assertEquals("[]", response.getFlashcards());
    }

    @Test
    void analyzeStudyContent_ParsingError() {
        // If the AI output doesn't match the expected format, the parseStudyOutput catch will return the original output
        // Arrange
        String description = "Content";
        String malformedOutput = "Output with incorrect format";

        when(client.chat().completions().create(any(ChatCompletionCreateParams.class))
                .choices().get(0).message().content())
                .thenReturn(Optional.of(malformedOutput));

        // Act
        AIStudyResponse response = aiService.analyzeStudyContent(description);

        // Assert
        assertEquals(malformedOutput, response.getImprovedDescription());
        assertEquals(malformedOutput, response.getSummary());
        assertEquals("General", response.getKeyConcepts().get(0));
    }

    @Test
    void analyzeStudyContent_WithEmptyConcepts_ShouldFilterThem() {
        // Arrange
        String description = "Content";
        String aiOutput = "IMPROVED_DESCRIPTION: Improved\n" +
                "SUMMARY: Summary\n" +
                "CONCEPTS: concept1, , concept2,   \n" +
                "FLASHCARDS: []";

        when(client.chat().completions().create(any(ChatCompletionCreateParams.class))
                .choices().get(0).message().content())
                .thenReturn(Optional.of(aiOutput));

        // Act
        AIStudyResponse response = aiService.analyzeStudyContent(description);

        // Assert
        assertEquals(2, response.getKeyConcepts().size());
        assertTrue(response.getKeyConcepts().contains("concept1"));
        assertTrue(response.getKeyConcepts().contains("concept2"));
        assertFalse(response.getKeyConcepts().contains(""));
    }
}
