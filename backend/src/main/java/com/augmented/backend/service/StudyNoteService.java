package com.augmented.backend.service;

import com.augmented.backend.model.AIStudyResponse;
import com.augmented.backend.model.StudyNote;
import com.augmented.backend.repository.StudyNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class StudyNoteService {

    private final StudyNoteRepository studyNoteRepository;
    private final AIService aiService;

    public StudyNote createStudyNote(StudyNote note) {
        // Save the note exactly as entered by the user
        return studyNoteRepository.save(note);
    }

    public StudyNote updateStudyNote(Long id, StudyNote updatedNote) {
        return studyNoteRepository.findById(id).map(note -> {
            note.setTitle(updatedNote.getTitle());
            note.setSubject(updatedNote.getSubject());
            note.setDescription(updatedNote.getDescription());
            note.setAiSummary(updatedNote.getAiSummary());
            note.setKeyConcepts(updatedNote.getKeyConcepts());
            note.setFlashcards(updatedNote.getFlashcards());
            return studyNoteRepository.save(note);
        }).orElseThrow(() -> new RuntimeException("Note not found"));
    }

    public void deleteStudyNote(Long id) {
        studyNoteRepository.deleteById(id);
    }

    /**
     * Generates an AI-suggested preview without saving it yet.
     */
    @Async
    public CompletableFuture<AIStudyResponse> getAIPreview(Long id) {
        StudyNote note = studyNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        AIStudyResponse resp = aiService.analyzeStudyContent(note.getDescription());
        return CompletableFuture.completedFuture(resp);
    }

    /**
     * Applies the AI suggestion to the note and saves it.
     */
    public StudyNote applyAISuggestion(Long id, AIStudyResponse suggestion) {
        StudyNote note = studyNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setDescription(suggestion.getImprovedDescription());
        note.setAiSummary(suggestion.getSummary());
        note.setKeyConcepts(suggestion.getKeyConcepts());
        note.setFlashcards(suggestion.getFlashcards());
        
        return studyNoteRepository.save(note);
    }

    public List<StudyNote> findAll() {
        return studyNoteRepository.findAll();
    }

    public Optional<StudyNote> findById(Long id) {
        return studyNoteRepository.findById(id);
    }
}
