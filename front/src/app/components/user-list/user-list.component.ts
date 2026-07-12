import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  userForm: User = { name: '', email: '' };
  editingId: number | null = null;
  loading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la lista de usuarios.';
        this.loading = false;
      },
    });
  }

  submitUser(): void {
    if (!this.userForm.name.trim() || !this.userForm.email.trim()) {
      this.errorMessage = 'Nombre y correo son obligatorios.';
      return;
    }

    this.errorMessage = '';

    if (this.editingId !== null) {
      this.userService.updateUser(this.editingId, this.userForm).subscribe({
        next: () => {
          this.resetForm();
          this.loadUsers();
        },
        error: () => {
          this.errorMessage = 'No se pudo actualizar el usuario.';
        },
      });
      return;
    }

    this.userService.createUser(this.userForm).subscribe({
      next: () => {
        this.resetForm();
        this.loadUsers();
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el usuario.';
      },
    });
  }

  editUser(user: User): void {
    this.editingId = user.id ?? null;
    this.userForm = { ...user };
  }

  deleteUser(id?: number): void {
    if (!id) return;

    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.errorMessage = 'No se pudo eliminar el usuario.';
      },
    });
  }

  resetForm(): void {
    this.userForm = { name: '', email: '' };
    this.editingId = null;
  }
}
