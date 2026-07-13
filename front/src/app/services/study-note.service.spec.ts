import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StudyNoteService } from './study-note.service';

describe('StudyNoteService', () => {
  let service: StudyNoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudyNoteService],
    });

    service = TestBed.inject(StudyNoteService);
    httpMock = TestBed.inject(HttpTestingController);
    // flush initial loadNotes() call from service constructor
    const initReq = httpMock.expectOne('http://localhost:8080/api/study-notes');
    initReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loadNotes sets isLoaded and notes (initial)', () => {
    // after constructor and beforeEach flush, isLoaded should be true
    expect(service.isLoaded()).toBeTrue();
    expect(Array.isArray(service.notes())).toBeTrue();
  });

  it('parses flashcards and keyConcepts from backend response (getNoteById)', (done) => {
    const mockResp = {
      id: 1,
      title: 'Test Note',
      subject: 'OTHER',
      description: 'desc',
      keyConcepts: ['[A]', '[B]'],
      flashcards: JSON.stringify([{ q: 'Q1', a: 'A1' }]),
    };

    service.getNoteById(1).subscribe((note) => {
      try {
        expect(note.id).toBe(1);
        expect(note.keyConcepts).toEqual(['A', 'B']);
        expect(note.flashcards!.length).toBe(1);
        expect(note.flashcards![0].question).toBe('Q1');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResp);
  });

  it('createNote returns mapped StudyNote and updates internal list', (done) => {
    const input = { title: 'New', subject: 'OTHER', description: 'd' } as any;
    const resp = { id: 2, ...input, keyConcepts: [], flashcards: [] };

    service.createNote(input).subscribe((n) => {
      try {
        expect(n.id).toBe(2);
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes');
    expect(req.request.method).toBe('POST');
    req.flush(resp);
  });

  it('handles double-encoded flashcards and array flashcards', (done) => {
    const respDouble = {
      id: 3,
      title: 'Double',
      subject: 'OTHER',
      description: 'd',
      keyConcepts: ['[X]'],
      flashcards: JSON.stringify(
        JSON.stringify(JSON.stringify([{ q: 'QQ', a: 'AA' }])),
      ),
    };

    service.getNoteById(3).subscribe((note) => {
      try {
        expect(note.flashcards && note.flashcards[0].question).toBe('QQ');
      } catch (err) {
        fail(err);
      }
    });
    const req1 = httpMock.expectOne('http://localhost:8080/api/study-notes/3');
    req1.flush(respDouble);

    const respArray = {
      id: 4,
      title: 'Array',
      subject: 'OTHER',
      description: 'd',
      keyConcepts: ['[Y]'],
      flashcards: [{ q: 'Q2', a: 'A2' }],
    };

    service.getNoteById(4).subscribe((note) => {
      try {
        expect(note.flashcards && note.flashcards[0].question).toBe('Q2');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });
    const req2 = httpMock.expectOne('http://localhost:8080/api/study-notes/4');
    req2.flush(respArray);
  });

  it('applyAiChanges sends correct payload and maps response', (done) => {
    const previewNote: any = {
      description: 'improved',
      aiSummary: 'sum',
      keyConcepts: ['K1', 'K2'],
      flashcards: [{ question: 'Q', answer: 'A' }],
    };

    service.applyAiChanges(7, previewNote).subscribe((res) => {
      try {
        expect(res.description).toBeDefined();
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/study-notes/7/ai-apply',
    );
    expect(req.request.method).toBe('POST');
    const body = req.request.body as any;
    expect(body.improvedDescription).toBe(previewNote.description);
    expect(body.summary).toBe(previewNote.aiSummary);
    expect(typeof body.flashcards).toBe('string');
    req.flush({ id: 7, title: 'ok', description: previewNote.description });
  });

  it('updateNote sends PUT and updates notesSignal', (done) => {
    // seed notesSignal with existing note
    (service as any).notesSignal.set([
      { id: 10, title: 'Old', subject: 'OTHER', description: 'o' },
    ]);

    const updated = {
      id: 10,
      title: 'NewTitle',
      subject: 'OTHER',
      description: 'new',
    };
    service.updateNote(10, updated as any).subscribe((res) => {
      try {
        expect(res.title).toBe('NewTitle');
        const notes = service.notes();
        const found = notes.find((n: any) => n.id === 10);
        expect(found).toBeDefined();
        expect(found!.title).toBe('NewTitle');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/10');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('deleteNote sends DELETE and removes note from notesSignal', (done) => {
    (service as any).notesSignal.set([
      { id: 20, title: 'ToDelete', subject: 'OTHER', description: 'x' },
    ]);

    service.deleteNote(20).subscribe(() => {
      try {
        const notes = service.notes();
        expect(notes.find((n: any) => n.id === 20)).toBeUndefined();
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/20');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('mapIncomingNote handles missing title/description and malformed flashcards', (done) => {
    const resp = {
      id: 30,
      subject: 'OTHER',
      // title and description missing
      flashcards: 'not a json',
    };

    service.getNoteById(30).subscribe((note) => {
      try {
        expect(note.title).toBe('');
        expect(note.description).toBe('');
        expect(Array.isArray(note.flashcards)).toBeTrue();
        expect((note.flashcards || []).length).toBe(0);
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/30');
    expect(req.request.method).toBe('GET');
    req.flush(resp);
  });

  it('handles JSON.parse returning same value (parsed === attempt) without infinite loop', (done) => {
    const resp = {
      id: 40,
      subject: 'OTHER',
      flashcards: '"x"',
    };

    // Save original and spy to force parsed === attempt
    const origParse = JSON.parse;
    const spy = spyOn(JSON, 'parse').and.callFake((s: any) => s);

    service.getNoteById(40).subscribe((note) => {
      try {
        // Should not hang; flashcards parsing should safely exit and return empty array
        expect(Array.isArray(note.flashcards)).toBeTrue();
        expect((note.flashcards || []).length).toBe(0);
        done();
      } catch (err) {
        fail(err);
        done();
      } finally {
        // restore original parser
        (JSON as any).parse = origParse;
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/40');
    req.flush(resp);
  });

  it('getAiPreview maps AiPreviewResponse to StudyNote', (done) => {
    const resp = {
      id: 5,
      improvedDescription: 'AI improved',
      summary: 'sum',
      keyConcepts: ['[K]'],
      flashcards: JSON.stringify([{ q: 'QAI', a: 'AAI' }]),
    };

    service.getAiPreview(5).subscribe((note) => {
      try {
        expect(note.description).toBe('AI improved');
        expect(note.aiSummary).toBe('sum');
        expect(note.keyConcepts).toEqual(['K']);
        expect(note.flashcards && note.flashcards[0].question).toBe('QAI');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/study-notes/5/ai-preview',
    );
    expect(req.request.method).toBe('GET');
    req.flush(resp);
  });

  it('applyAiChanges merges updatedNote fields into existing notesSignal', (done) => {
    (service as any).notesSignal.set([
      { id: 7, title: 'Keep', description: 'old' },
    ]);

    const previewNote: any = {
      description: 'improved',
      aiSummary: 'sum',
      keyConcepts: ['K1'],
      flashcards: [{ question: 'Q', answer: 'A' }],
    };

    service.applyAiChanges(7, previewNote).subscribe((res) => {
      try {
        const notes = service.notes();
        const found = notes.find((n: any) => n.id === 7);
        expect(found).toBeDefined();
        // updated fields come from response
        expect(found!.description).toBe('updated-desc');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/study-notes/7/ai-apply',
    );
    expect(req.request.method).toBe('POST');
    req.flush({ id: 7, title: 'ok', description: 'updated-desc' });
  });

  it('logs error when flashcard parsing throws', (done) => {
    spyOn(console, 'error');

    // create an object whose getter will throw when accessed
    const bad = Object.defineProperty({}, 'q', {
      get: () => {
        throw new Error('boom');
      },
      configurable: true,
    });

    const resp = {
      id: 99,
      title: 'Bad',
      subject: 'OTHER',
      flashcards: [bad],
    };

    service.getNoteById(99).subscribe((note) => {
      try {
        // parsing failed, but function should return an object
        expect(note).toBeDefined();
        expect(console.error).toHaveBeenCalled();
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/99');
    expect(req.request.method).toBe('GET');
    req.flush(resp);
  });

  it('loadNotes maps incoming list via mapIncomingNote', (done) => {
    // call loadNotes explicitly and flush an array response
    service.loadNotes();
    const resp = [
      {
        id: 40,
        title: 'L1',
        subject: 'OTHER',
        description: 'd',
        keyConcepts: ['[Z]'],
        flashcards: JSON.stringify([{ q: 'QZ', a: 'AZ' }]),
      },
    ];

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes');
    expect(req.request.method).toBe('GET');
    req.flush(resp);

    // allow async subscription to settle
    setTimeout(() => {
      try {
        const notes = service.notes();
        const n = notes.find((x: any) => x.id === 40);
        expect(n).toBeDefined();
        expect(n!.flashcards && n!.flashcards[0].question).toBe('QZ');
        expect(service.isLoaded()).toBeTrue();
        done();
      } catch (err) {
        fail(err);
        done();
      }
    }, 0);
  });

  it('getAiPreview maps AiPreviewResponse to StudyNote', (done) => {
    const aiResp = {
      id: 50,
      improvedDescription: 'desc from ai',
      summary: 'summ',
      keyConcepts: ['[K]'],
      flashcards: JSON.stringify([{ q: 'QAI', a: 'AAI' }]),
    } as any;

    service.getAiPreview(50).subscribe((note) => {
      try {
        expect(note.id).toBe(50);
        expect(note.description).toBe('desc from ai');
        expect(note.aiSummary).toBe('summ');
        expect(note.flashcards && note.flashcards[0].question).toBe('QAI');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/study-notes/50/ai-preview',
    );
    expect(req.request.method).toBe('GET');
    req.flush(aiResp);
  });

  it('applyAiChanges merges updatedNote into existing notesSignal', (done) => {
    // seed notesSignal with existing note that should be merged
    (service as any).notesSignal.set([
      { id: 60, title: 'OldTitle', subject: 'OTHER', description: 'old' },
    ]);

    const previewNote: any = {
      description: 'improved60',
      aiSummary: 'sum60',
      keyConcepts: ['K1'],
      flashcards: [{ question: 'Q', answer: 'A' }],
    };

    service.applyAiChanges(60, previewNote).subscribe((res) => {
      try {
        expect(res.description).toBe('improved60');
        const notes = service.notes();
        const found = notes.find((n: any) => n.id === 60);
        expect(found).toBeDefined();
        // merged copy should contain updated description
        expect(found!.description).toBe('improved60');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/study-notes/60/ai-apply',
    );
    expect(req.request.method).toBe('POST');
    req.flush({ id: 60, title: 'OldTitle', description: 'improved60' });
  });

  it('mapIncomingNote logs error when flashcards mapping throws', (done) => {
    spyOn(console, 'error');

    const resp = {
      id: 70,
      title: 'T',
      subject: 'OTHER',
      // include a null element to cause mapping to throw when accessing .q
      flashcards: [null],
    } as any;

    service.getNoteById(70).subscribe((note) => {
      try {
        expect(console.error).toHaveBeenCalled();
        expect(Array.isArray(note.flashcards)).toBeTrue();
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/70');
    req.flush(resp);
  });

  it('updateNote sends PUT and updates internal notes list', (done) => {
    // seed internal notes
    service['notesSignal'].set([
      { id: 10, title: 'old', subject: 'OTHER', description: 'o' } as any,
    ]);

    const updated = {
      id: 10,
      title: 'updated',
      subject: 'OTHER',
      description: 'new',
    };
    service.updateNote(10, updated as any).subscribe((res) => {
      try {
        expect(res.id).toBe(10);
        // internal signal should be updated
        const list = service['notes']();
        expect(list.find((n: any) => n.id === 10)?.title).toBe('updated');
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/10');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('deleteNote sends DELETE and removes from internal list', (done) => {
    service['notesSignal'].set([
      { id: 20, title: 't', subject: 'OTHER', description: '' } as any,
    ]);

    service.deleteNote(20).subscribe({
      next: () => {
        try {
          const list = service['notes']();
          expect(list.find((n: any) => n.id === 20)).toBeUndefined();
          done();
        } catch (err) {
          fail(err);
          done();
        }
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/study-notes/20');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('mapIncomingNote handles missing or invalid flashcards gracefully', (done) => {
    const respNoFlash = {
      id: 30,
      title: 'NoFlash',
      subject: 'OTHER',
      description: 'd',
      keyConcepts: [],
    };

    service.getNoteById(30).subscribe((note) => {
      try {
        expect(note.flashcards).toEqual([]);
      } catch (err) {
        fail(err);
      }
    });
    const r1 = httpMock.expectOne('http://localhost:8080/api/study-notes/30');
    r1.flush(respNoFlash);

    const respInvalid = {
      id: 31,
      title: 'Bad',
      subject: 'OTHER',
      description: 'd',
      flashcards: 'not-a-json',
    };

    service.getNoteById(31).subscribe((note) => {
      try {
        expect(note.flashcards).toEqual([]);
        done();
      } catch (err) {
        fail(err);
        done();
      }
    });
    const r2 = httpMock.expectOne('http://localhost:8080/api/study-notes/31');
    r2.flush(respInvalid);
  });
});
