package com.augmented.backend.controller;

import com.augmented.backend.model.AIStudyResponse;
import com.augmented.backend.model.StudyNote;
import com.augmented.backend.service.StudyNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-notes")
@RequiredArgsConstructor
public class StudyNoteController {

    private final StudyNoteService studyNoteService;

    @PostMapping
    public ResponseEntity<StudyNote> create(@RequestBody StudyNote studyNote) {
        return ResponseEntity.ok(studyNoteService.createStudyNote(studyNote));
    }

    @GetMapping
    public List<StudyNote> getAll() {
        return studyNoteService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyNote> getById(@PathVariable Long id) {
        return studyNoteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyNote> update(@PathVariable Long id, @RequestBody StudyNote studyNote) {
        try {
            return ResponseEntity.ok(studyNoteService.updateStudyNote(id, studyNote));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studyNoteService.deleteStudyNote(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/ai-preview")
    public ResponseEntity<AIStudyResponse> previewAi(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studyNoteService.getAIPreview(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/ai-apply")
    public ResponseEntity<StudyNote> applyAi(@PathVariable Long id, @RequestBody AIStudyResponse suggestion) {
        try {
            return ResponseEntity.ok(studyNoteService.applyAISuggestion(id, suggestion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
