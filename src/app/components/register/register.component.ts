import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  users: any[] = []; // Store fetched users
  showModal: boolean = false; // Controls modal visibility
  newUser = { username: '', password: '', roles: 'User' }; // New user form data
  errorMessage: string = ''; // Error message display

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.fetchUsers();
    } else {
      console.warn('User is not logged in.');
    }
  }

  // Fetch all registered users
  fetchUsers() {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Failed to fetch users.';
      }
    });
  }

  // Open the modal for adding users
  openModal() {
    this.newUser = { username: '', password: '', roles: 'User' }; // Reset form
    this.showModal = true;
  }

  // Close the modal
  closeModal() {
    this.showModal = false;
  }

  // Submit the new user registration
  registerUser() {
    if (!this.newUser.username || !this.newUser.password) {
      this.errorMessage = 'Username and Password are required!';
      return;
    }

    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.fetchUsers(); // Refresh user list
        this.closeModal(); // Close modal
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Failed to register user.';
      }
    });
  }
}
