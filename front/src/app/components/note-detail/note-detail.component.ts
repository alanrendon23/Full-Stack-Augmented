import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StudyNoteService } from '../../services/study-note.service';
import { Subject, StudyNote } from '../../models/study-note.model';
import { FlashcardsComponent } from '../flashcards/flashcards.component';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FlashcardsComponent,
  ],
  templateUrl: './note-detail.component.html',
  styleUrl: './note-detail.component.css',
})
export class NoteDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studyNoteService = inject(StudyNoteService);
  private snackBar = inject(MatSnackBar);

  noteForm: FormGroup;
  subjects = Object.values(Subject);

  // State Signals
  currentNote = signal<StudyNote | null>(null);
  aiPreview = signal<StudyNote | null>(null);
  isLoading = signal<boolean>(false);
  isGeneratingAi = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  constructor() {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      subject: [Subject.OTHER, Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.loadNote(+id);
    }
  }

  loadNote(id: number) {
    this.isLoading.set(true);
    this.studyNoteService.getNoteById(id).subscribe({
      next: (note) => {
        this.currentNote.set(note);
        this.noteForm.patchValue(note);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error loading note', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  saveNote() {
    if (this.noteForm.invalid) return;

    const noteData: StudyNote = this.noteForm.value;
    this.isLoading.set(true);

    if (this.isEditMode()) {
      this.studyNoteService
        .updateNote(this.currentNote()!.id!, noteData)
        .subscribe({
          next: (updated) => {
            this.currentNote.set(updated);
            this.isLoading.set(false);
            this.snackBar.open('Note updated!', 'Close', { duration: 2000 });
            this.router.navigate(['/dashboard']);
          },
          error: () => this.isLoading.set(false),
        });
    } else {
      this.studyNoteService.createNote(noteData).subscribe({
        next: (created) => {
          this.isLoading.set(false);
          this.snackBar.open('Note created!', 'Close', { duration: 2000 });
          this.router.navigate(['/dashboard']);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  generateAi() {
    if (!this.currentNote()?.id) return;

    this.isGeneratingAi.set(true);
    this.studyNoteService.getAiPreview(this.currentNote()!.id!).subscribe({
      next: (preview) => {
        this.aiPreview.set(preview);
        this.isGeneratingAi.set(false);
      },
      error: () => {
        this.snackBar.open('Error generating AI content', 'Close', {
          duration: 3000,
        });
        this.isGeneratingAi.set(false);
      },
    });
  }

  applyAi() {
    if (!this.currentNote()?.id || !this.aiPreview()) return;

    this.isLoading.set(true);
    this.studyNoteService
      .applyAiChanges(this.currentNote()!.id!, this.aiPreview()!)
      .subscribe({
        next: (updated) => {
          this.currentNote.set(updated);
          this.aiPreview.set(null);
          this.isLoading.set(false);
          this.snackBar.open('AI changes applied successfully!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => this.isLoading.set(false),
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
