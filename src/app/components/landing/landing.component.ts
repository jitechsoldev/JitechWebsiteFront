import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;
  currentIndex: number = 0;
  autoScrollInterval: any;
  manualScrollTimeout: any;
  transitioning = false;

  products = [
    {
      image: './Responsive.png',
      name: 'AN-15',
      description: 'Brief description of AN-15.',
    },
    {
      image: './Responsive.png',
      name: 'OC-2120',
      description: 'Brief description of OC-2120.',
    },
    {
      image: './Responsive.png',
      name: 'JU-22',
      description: 'Brief description of JU-22.',
    },
    {
      image: './Responsive.png',
      name: 'N-21',
      description: 'Brief description of N-21.',
    },
    {
      image: './Responsive.png',
      name: 'NU-27',
      description: 'Brief description of NU-27.',
    },
    {
      image: './Responsive.png',
      name: 'FoodPOS',
      description: 'Brief description of FoodPOS.',
    },
  ];

  ngAfterViewInit() {
    this.updateScrollPosition();
    this.startAutoScroll();
  }

  ngOnDestroy() {
    clearInterval(this.autoScrollInterval);
  }

  scrollLeft() {
    if (this.transitioning || this.currentIndex === 0) return;
    clearInterval(this.autoScrollInterval);
    this.transitioning = true;

    this.currentIndex--;
    this.updateScroll(true);
    this.resumeAutoScroll();
  }

  scrollRight() {
    if (this.transitioning || this.currentIndex === this.products.length - 1)
      return;
    clearInterval(this.autoScrollInterval);
    this.transitioning = true;

    this.currentIndex++;
    this.updateScroll(true);
    this.resumeAutoScroll();
  }

  goToSlide(index: number) {
    clearInterval(this.autoScrollInterval);
    this.currentIndex = index;
    this.updateScroll(true);
    this.resumeAutoScroll();
  }

  updateScroll(animate: boolean) {
    const carouselEl = this.carousel.nativeElement;
    const cardWidth = carouselEl.children[this.currentIndex].offsetWidth + 32; // 32px for margin
    const centerOffset = (carouselEl.offsetWidth - cardWidth) / 2; // Center card properly

    if (animate) {
      carouselEl.style.transition = 'transform 0.5s ease-in-out';
    } else {
      carouselEl.style.transition = 'none';
    }

    requestAnimationFrame(() => {
      carouselEl.style.transform = `translateX(${
        centerOffset - this.currentIndex * cardWidth
      }px)`;
      setTimeout(() => (this.transitioning = false), 500);
    });
  }

  updateScrollPosition() {
    setTimeout(() => {
      const carouselEl = this.carousel.nativeElement;
      const cardWidth = carouselEl.children[this.currentIndex].offsetWidth + 32;
      const centerOffset = (carouselEl.offsetWidth - cardWidth) / 2;

      carouselEl.style.transition = 'none';
      carouselEl.style.transform = `translateX(${
        centerOffset - this.currentIndex * cardWidth
      }px)`;
    });
  }

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (this.currentIndex < this.products.length - 1) {
        this.scrollRight();
      } else {
        clearInterval(this.autoScrollInterval);
      }
    }, 4000);
  }

  resumeAutoScroll() {
    clearTimeout(this.manualScrollTimeout);
    this.manualScrollTimeout = setTimeout(() => {
      this.startAutoScroll();
    }, 6000);
  }
}
