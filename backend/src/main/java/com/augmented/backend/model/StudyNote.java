package com.augmented.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "study_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private Subject subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @ElementCollection
    private List<String> keyConcepts;

    @Column(columnDefinition = "TEXT") // Store flashcards as JSON string
    private String flashcards;
}
