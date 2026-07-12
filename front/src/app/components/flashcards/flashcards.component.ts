import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Flashcard } from '../../models/study-note.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './flashcards.component.html',
  styleUrl: './flashcards.component.css',
})
export class FlashcardsComponent {
  @Input({ required: true }) flashcards: Flashcard[] = [];

  currentIndex = signal(0);
  isFlipped = signal(false);

  flip() {
    this.isFlipped.update((v) => !v);
  }

  next() {
    if (this.currentIndex() < this.flashcards.length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.isFlipped.set(false);
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.isFlipped.set(false);
    }
  }
}
