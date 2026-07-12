import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  StudyNote,
  AiPreviewResponse,
  Flashcard,
} from '../models/study-note.model';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudyNoteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/study-notes';

  // State
  private notesSignal = signal<StudyNote[]>([]);
  private isLoadedSignal = signal<boolean>(false);

  // Publicly accessible state (readonly)
  public notes = computed(() => this.notesSignal());
  public isLoaded = computed(() => this.isLoadedSignal());

  constructor() {
    this.loadNotes();
  }

  loadNotes() {
    this.http
      .get<any[]>(this.apiUrl)
      .pipe(map((notes) => notes.map((n) => this.mapIncomingNote(n))))
      .subscribe((notes) => {
        this.notesSignal.set(notes);
        this.isLoadedSignal.set(true);
      });
  }

  getNoteById(id: number): Observable<StudyNote> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((n) => this.mapIncomingNote(n)));
  }

  createNote(note: StudyNote): Observable<StudyNote> {
    return this.http.post<any>(this.apiUrl, note).pipe(
      map((n) => this.mapIncomingNote(n)),
      tap((newNote) => {
        this.notesSignal.update((notes) => [...notes, newNote]);
      }),
    );
  }

  updateNote(id: number, note: StudyNote): Observable<StudyNote> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, note).pipe(
      map((n) => this.mapIncomingNote(n)),
      tap((updatedNote) => {
        this.notesSignal.update((notes) =>
          notes.map((n) => (n.id === id ? updatedNote : n)),
        );
      }),
    );
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notesSignal.update((notes) => notes.filter((n) => n.id !== id));
      }),
    );
  }

  // AI Methods
  getAiPreview(id: number): Observable<StudyNote> {
    return this.http
      .get<AiPreviewResponse>(`${this.apiUrl}/${id}/ai-preview`)
      .pipe(map((response) => this.mapIncomingNote(response)));
  }

  applyAiChanges(id: number, previewedNote: StudyNote): Observable<StudyNote> {
    // Backend expects AiPreviewResponse format for applying changes
    const payload: AiPreviewResponse = {
      improvedDescription: previewedNote.description,
      summary: previewedNote.aiSummary || '',
      keyConcepts: (previewedNote.keyConcepts || []).map((c) => `[${c}]`), // Wrap back if needed, or send as is
      flashcards: JSON.stringify(
        (previewedNote.flashcards || []).map((f) => ({
          q: f.question,
          a: f.answer,
        })),
      ),
    };

    return this.http.post<any>(`${this.apiUrl}/${id}/ai-apply`, payload).pipe(
      map((response) => this.mapIncomingNote(response)),
      tap((updatedNote) => {
        this.notesSignal.update((notes) =>
          notes.map((n) => (n.id === id ? { ...n, ...updatedNote } : n)),
        );
      }),
    );
  }

  private mapIncomingNote(data: any): StudyNote {
    const cleanedConcepts = (data.keyConcepts || []).map((c: string) =>
      c.replace(/[\[\]]/g, ''),
    );

    let parsedFlashcards: Flashcard[] = [];
    if (data.flashcards) {
      try {
        let rawData = data.flashcards;

        // Double parsing protection
        if (typeof rawData === 'string' && rawData.trim().length > 0) {
          // If it starts with quotes, it might be double encoded
          if (rawData.trim().startsWith('"')) {
            try {
              const inner = JSON.parse(rawData);
              if (typeof inner === 'string') {
                rawData = inner;
              }
            } catch (e) {}
          }

          try {
            const parsed = JSON.parse(rawData);
            if (parsed) rawData = parsed;
          } catch (e) {
            // If it's not valid JSON, leave it as is (could be already an object/array)
          }
        }

        if (Array.isArray(rawData)) {
          parsedFlashcards = rawData.map((f: any) => ({
            question: f.q || f.question || 'No question',
            answer: f.a || f.answer || 'No answer',
          }));
        }
      } catch (e) {
        console.error('Error parsing flashcards', e, data.flashcards);
      }
    }

    // Crucial: ensure we don't return undefined for description
    const noteDescription = data.description || data.improvedDescription || '';
    const noteTitle = data.title || '';
    const noteSubject = data.subject;

    return {
      id: data.id,
      title: noteTitle,
      subject: noteSubject,
      description: noteDescription,
      aiSummary: data.aiSummary || data.summary || '',
      keyConcepts: cleanedConcepts,
      flashcards: parsedFlashcards,
    } as StudyNote;
  }
}
