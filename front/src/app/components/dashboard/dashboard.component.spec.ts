import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { StudyNoteService } from '../../services/study-note.service';
import { Subject } from '../../models/study-note.model';

describe('DashboardComponent', () => {
  let fixture: any;
  let component: DashboardComponent;

  beforeEach(async () => {
    const deleteSpy = jasmine
      .createSpy('deleteNote')
      .and.returnValue({ subscribe: () => {} });

    const fakeService: Partial<StudyNoteService> = {
      notes: signal([
        {
          id: 1,
          title: 'Note 1',
          subject: Subject.OTHER,
          description: 'desc',
          keyConcepts: [],
          flashcards: [],
        },
      ]) as any,
      isLoaded: signal(true) as any,
      deleteNote: deleteSpy as any,
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: StudyNoteService, useValue: fakeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders header and notes', async () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('My Study Notes');
    const cards = el.querySelectorAll('mat-card.note-card');
    expect(cards.length).toBe(1);
  });

  it('shows empty state when no notes', async () => {
    // update service notes to empty
    const svc = TestBed.inject(StudyNoteService) as any;
    svc.notes.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.no-notes')?.textContent).toContain(
      'No notes found',
    );
  });

  it('renders keyConcept chips when present and handles delete click', async () => {
    const svc = TestBed.inject(StudyNoteService) as any;
    svc.notes.set([
      {
        id: 5,
        title: 'With Concepts',
        subject: Subject.OTHER,
        description: 'x',
        keyConcepts: ['A', 'B', 'C'],
        flashcards: [],
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const chips = el.querySelectorAll('mat-chip');
    expect(chips.length).toBeGreaterThan(0);

    // simulate delete button click and ensure service.deleteNote called
    const deleteBtn = el.querySelector(
      'button.delete-button',
    ) as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();
    expect(svc.deleteNote as jasmine.Spy).toHaveBeenCalled();
  });

  it('navigates when clicking a note card', async () => {
    const router = TestBed.inject(Router);
    const spyNav = spyOn(router, 'navigate');

    const el: HTMLElement = fixture.nativeElement;
    const card = el.querySelector('mat-card.note-card') as HTMLElement;
    card.click();
    expect(spyNav).toHaveBeenCalled();
  });

  it('createNote navigates to new note route', () => {
    const router = TestBed.inject(Router);
    const spyNav = spyOn(router, 'navigate');
    component.createNote();
    expect(spyNav).toHaveBeenCalledWith(['/notes/new']);
  });

  it('viewNote does not navigate when id is undefined', () => {
    const router = TestBed.inject(Router);
    const spyNav = spyOn(router, 'navigate');
    component.viewNote(undefined);
    expect(spyNav).not.toHaveBeenCalled();
  });

  it('getSubjectIcon returns correct icons for known subjects and default', () => {
    expect(component.getSubjectIcon(Subject.MATHEMATICS)).toBe('calculate');
    expect(component.getSubjectIcon(Subject.SCIENCE)).toBe('science');
    expect(component.getSubjectIcon(Subject.HISTORY)).toBe('history');
    expect(component.getSubjectIcon(Subject.LITERATURE)).toBe('menu_book');
    expect(component.getSubjectIcon(Subject.PROGRAMMING)).toBe('code');
    expect(component.getSubjectIcon(Subject.ART)).toBe('palette');
    // default
    // @ts-ignore: pass an unknown value
    expect(component.getSubjectIcon('UNKNOWN' as any)).toBe('notes');
  });
});
