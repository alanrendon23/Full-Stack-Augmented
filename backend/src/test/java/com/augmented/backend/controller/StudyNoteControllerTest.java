package com.augmented.backend.controller;

import com.augmented.backend.model.AIStudyResponse;
import com.augmented.backend.model.StudyNote;
import com.augmented.backend.service.StudyNoteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class StudyNoteControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private StudyNoteService studyNoteService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void create_ShouldReturnNote() throws Exception {
        StudyNote note = StudyNote.builder().title("Test").build();
        when(studyNoteService.createStudyNote(any())).thenReturn(note);

        mockMvc.perform(post("/api/study-notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(note)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"));
    }

    @Test
    void getAll_ShouldReturnList() throws Exception {
        when(studyNoteService.findAll()).thenReturn(List.of(new StudyNote()));

        mockMvc.perform(get("/api/study-notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getById_Found() throws Exception {
        StudyNote note = StudyNote.builder().id(1L).title("Test").build();
        when(studyNoteService.findById(1L)).thenReturn(Optional.of(note));

        mockMvc.perform(get("/api/study-notes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"));
    }

    @Test
    void getById_NotFound() throws Exception {
        when(studyNoteService.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/study-notes/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_Existing() throws Exception {
        StudyNote note = StudyNote.builder().title("Updated").build();
        when(studyNoteService.updateStudyNote(eq(1L), any())).thenReturn(note);

        mockMvc.perform(put("/api/study-notes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(note)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void update_NotFound() throws Exception {
        when(studyNoteService.updateStudyNote(eq(1L), any())).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(put("/api/study-notes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StudyNote())))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/study-notes/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void aiPreview_Success() throws Exception {
        AIStudyResponse response = new AIStudyResponse("improved", "summary", List.of("key"), "[]");
        when(studyNoteService.getAIPreview(1L)).thenReturn(java.util.concurrent.CompletableFuture.completedFuture(response));

        mockMvc.perform(get("/api/study-notes/1/ai-preview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("summary"));
    }

    @Test
    void aiPreview_NotFound() throws Exception {
        java.util.concurrent.CompletableFuture<AIStudyResponse> failed = new java.util.concurrent.CompletableFuture<>();
        failed.completeExceptionally(new RuntimeException("Not found"));
        when(studyNoteService.getAIPreview(1L)).thenReturn(failed);

        mockMvc.perform(get("/api/study-notes/1/ai-preview"))
                .andExpect(status().isNotFound());
    }

    @Test
    void aiApply_Success() throws Exception {
        AIStudyResponse suggestion = new AIStudyResponse("improved", "summary", List.of("key"), "[]");
        StudyNote note = StudyNote.builder().description("improved").build();
        when(studyNoteService.applyAISuggestion(eq(1L), any())).thenReturn(note);

        mockMvc.perform(post("/api/study-notes/1/ai-apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(suggestion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("improved"));
    }

    @Test
    void aiApply_NotFound() throws Exception {
        when(studyNoteService.applyAISuggestion(eq(1L), any())).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(post("/api/study-notes/1/ai-apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AIStudyResponse())))
                .andExpect(status().isNotFound());
    }
}
