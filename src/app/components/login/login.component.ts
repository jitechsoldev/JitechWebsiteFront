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
  // Removed username since login uses only a password.
  password: string = '';
  rememberMe: boolean = false;

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
    console.log('Logging in with password', this.password, this.rememberMe);
    this.authService.login(this.password)
      .subscribe({
        next: () => {
          // Redirect to the dashboard on successful login.
          this.router.navigate(['/schedule']);
        },
        error: (err) => {
          console.error('Login error', err);
          // Optionally, show an error message to the user.
        }
      });
  }
}
