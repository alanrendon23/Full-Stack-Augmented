import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NoteDetailComponent } from './components/note-detail/note-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'notes/new', component: NoteDetailComponent },
  { path: 'notes/:id', component: NoteDetailComponent },
  { path: '**', redirectTo: 'dashboard' },
];
