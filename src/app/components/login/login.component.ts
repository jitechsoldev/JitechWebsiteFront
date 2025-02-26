import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  // No username property needed now
  password: string = '';
  errorMessage: string = '';

  // Carousel slides for aesthetics (unchanged)
  slides = [
    { image: './Innovate.png', title: 'Innovate' },
    { image: './Integrate.png', title: 'Integrate' },
    { image: './Succeed.png', title: 'Succeed' }
  ];
  currentSlide = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // No query param or default username needed.
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

  onSubmit() {
    // Construct credentials with only the password.
    const credentials = { password: this.password };
    console.log('Logging in with credentials:', credentials);

    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Login successful, token received:', res.token);
        this.router.navigate(['/schedule']);
      },
      error: (err) => {
        console.error('Login error', err);
        this.errorMessage = err.error.message || 'Login failed. Please check your password.';
      }
    });
  }
}
