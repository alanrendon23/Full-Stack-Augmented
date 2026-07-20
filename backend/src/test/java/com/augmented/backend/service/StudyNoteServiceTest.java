package com.augmented.backend.service;

import com.augmented.backend.model.AIStudyResponse;
import com.augmented.backend.model.StudyNote;
import com.augmented.backend.model.Subject;
import com.augmented.backend.repository.StudyNoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyNoteServiceTest {

    @Mock
    private StudyNoteRepository studyNoteRepository;

    @Mock
    private AIService aiService;

    @InjectMocks
    private StudyNoteService studyNoteService;

    private StudyNote sampleNote;

    @BeforeEach
    void setUp() {
        sampleNote = StudyNote.builder()
                .id(1L)
                .title("Test Title")
                .description("Test Description")
                .subject(Subject.SCIENCE)
                .build();
    }

    @Test
    void createStudyNote_Success() {
        when(studyNoteRepository.save(any(StudyNote.class))).thenReturn(sampleNote);
        StudyNote result = studyNoteService.createStudyNote(new StudyNote());
        assertNotNull(result);
        assertEquals("Test Title", result.getTitle());
    }

    @Test
    void updateStudyNote_Success() {
        StudyNote updatedInfo = StudyNote.builder()
                .title("Updated")
                .description("New Desc")
                .subject(Subject.HISTORY)
                .build();

        when(studyNoteRepository.findById(1L)).thenReturn(Optional.of(sampleNote));
        when(studyNoteRepository.save(any(StudyNote.class))).thenReturn(sampleNote);

        StudyNote result = studyNoteService.updateStudyNote(1L, updatedInfo);

        assertEquals("Updated", result.getTitle());
        assertEquals("New Desc", result.getDescription());
        verify(studyNoteRepository).save(any(StudyNote.class));
    }

    @Test
    void updateStudyNote_NotFound() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studyNoteService.updateStudyNote(1L, new StudyNote()));
        assertEquals("Note not found", exception.getMessage());
    }

    @Test
    void deleteStudyNote() {
        doNothing().when(studyNoteRepository).deleteById(1L);
        studyNoteService.deleteStudyNote(1L);
        verify(studyNoteRepository, times(1)).deleteById(1L);
    }

    @Test
    void findAll() {
        when(studyNoteRepository.findAll()).thenReturn(List.of(sampleNote));
        List<StudyNote> result = studyNoteService.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.of(sampleNote));
        Optional<StudyNote> result = studyNoteService.findById(1L);
        assertTrue(result.isPresent());
    }

    @Test
    void getAIPreview_Success() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.of(sampleNote));
        AIStudyResponse mockResponse = new AIStudyResponse("Better desc", "Summary", List.of("C1"), "[]");
        when(aiService.analyzeStudyContent(sampleNote.getDescription())).thenReturn(mockResponse);

        AIStudyResponse result = studyNoteService.getAIPreview(1L).join();

        assertEquals("Better desc", result.getImprovedDescription());
        assertEquals("Summary", result.getSummary());
    }

    @Test
    void getAIPreview_NotFound() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studyNoteService.getAIPreview(1L).join());
        assertEquals("Note not found", exception.getMessage());
    }

    @Test
    void applyAISuggestion_Success() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.of(sampleNote));
        AIStudyResponse suggestion = new AIStudyResponse("AI Improved", "AI Summary", List.of("Concept"), "[{}]");
        when(studyNoteRepository.save(any(StudyNote.class))).thenReturn(sampleNote);

        StudyNote result = studyNoteService.applyAISuggestion(1L, suggestion);

        assertEquals("AI Improved", result.getDescription());
        assertEquals("AI Summary", result.getAiSummary());
        assertEquals("Concept", result.getKeyConcepts().get(0));
    }

    @Test
    void applyAISuggestion_NotFound() {
        when(studyNoteRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studyNoteService.applyAISuggestion(1L, new AIStudyResponse()));
        assertEquals("Note not found", exception.getMessage());
    }
}
