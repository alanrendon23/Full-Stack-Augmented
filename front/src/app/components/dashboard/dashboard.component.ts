import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StudyNoteService } from '../../services/study-note.service';
import { Subject } from '../../models/study-note.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private studyNoteService = inject(StudyNoteService);
  private router = inject(Router);

  notes = this.studyNoteService.notes;
  isLoaded = this.studyNoteService.isLoaded;

  getSubjectIcon(subject: Subject): string {
    switch (subject) {
      case Subject.MATHEMATICS:
        return 'calculate';
      case Subject.SCIENCE:
        return 'science';
      case Subject.HISTORY:
        return 'history';
      case Subject.LITERATURE:
        return 'menu_book';
      case Subject.PROGRAMMING:
        return 'code';
      case Subject.ART:
        return 'palette';
      default:
        return 'notes';
    }
  }

  viewNote(id: number | undefined) {
    if (id) {
      this.router.navigate(['/notes', id]);
    }
  }

  createNote() {
    this.router.navigate(['/notes/new']);
  }

  deleteNote(event: Event, id: number | undefined) {
    event.stopPropagation();
    if (id) {
      this.studyNoteService.deleteNote(id).subscribe();
    }
  }
}
