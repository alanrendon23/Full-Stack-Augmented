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
        String description = "La fotosíntesis es fundamental.";
        String aiOutput = "IMPROVED_DESCRIPTION: Descripcion mejorada\n" +
                "SUMMARY: Resumen corto\n" +
                "CONCEPTS: concepto1, concepto2\n" +
                "FLASHCARDS: [{\"q\": \"que es?\", \"a\": \"esto\"}]";

        when(client.chat().completions().create(any(ChatCompletionCreateParams.class))
                .choices().get(0).message().content())
                .thenReturn(Optional.of(aiOutput));

        // Act
        AIStudyResponse response = aiService.analyzeStudyContent(description);

        // Assert
        assertEquals("Descripcion mejorada", response.getImprovedDescription());
        assertEquals("Resumen corto", response.getSummary());
        assertTrue(response.getKeyConcepts().contains("concepto1"));
        assertTrue(response.getKeyConcepts().contains("concepto2"));
        assertEquals("[{\"q\": \"que es?\", \"a\": \"esto\"}]", response.getFlashcards());
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
        // En caso de que el output de la IA no tenga el formato esperado, el catch de parseStudyOutput retornará el output original
        // Arrange
        String description = "Contenido";
        String malformedOutput = "Output sin formato correcto";

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
