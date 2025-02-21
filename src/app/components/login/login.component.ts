import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  currentSlide = 0;
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;

  slides = [
    {
      image: './Innovate.png',
      title: 'Innovate',
    },
    {
      image: './Integrate.png',
      title: 'Integrate',
    },
    {
      image: './Succeed.png',
      title: 'Succeed',
    },
  ];

  constructor() {
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
    console.log(
      'Logging in with',
      this.username,
      this.password,
      this.rememberMe
    );
  }
}
