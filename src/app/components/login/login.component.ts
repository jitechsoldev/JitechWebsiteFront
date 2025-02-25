import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  currentSlide = 0;
  // The username is hard-coded so only the password field is visible.
  username: string = 'adminUser';
  password: string = '';
  errorMessage: string = '';

  slides = [
    { image: './Innovate.png', title: 'Innovate' },
    { image: './Integrate.png', title: 'Integrate' },
    { image: './Succeed.png', title: 'Succeed' },
  ];

  constructor(private authService: AuthService, private router: Router) {
    setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

  onSubmit() {
    // Prepare credentials using the hard-coded username and entered password.
    const credentials = { username: this.username, password: this.password };
    console.log('Logging in with credentials:', credentials);

    this.authService.login(credentials)
      .subscribe({
        next: (res) => {
          console.log('Login successful, token received:', res.token);
          this.router.navigate(['/sale']);
        },
        error: (err) => {
          console.error('Login error', err);
          this.errorMessage = err.error.message || 'Login failed. Please check your password.';
        }
      });
  }
}
