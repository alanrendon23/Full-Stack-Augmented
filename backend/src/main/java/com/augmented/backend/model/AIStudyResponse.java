package com.augmented.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIStudyResponse {
    private String improvedDescription; // Suggested improvement for the description
    private String summary;
    private List<String> keyConcepts;
    private String flashcards; // JSON String
}
