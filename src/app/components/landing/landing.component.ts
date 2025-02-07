import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  currentIndex = 0;
  items = [
    { image: 'assets/image1.png', text: 'Text 1' },
    { image: 'assets/image2.png', text: 'Text 2' },
    { image: 'assets/image3.png', text: 'Text 3' },
  ];

  prevSlide() {
    this.currentIndex =
      this.currentIndex > 0 ? this.currentIndex - 1 : this.items.length - 1;
  }

  nextSlide() {
    this.currentIndex =
      this.currentIndex < this.items.length - 1 ? this.currentIndex + 1 : 0;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
