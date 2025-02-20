import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  currentIndex: number = 0;
  visibleItems: number = 1;

  products = [
    {
      image: './AP-15.png',
      name: 'AP-15',
      description: 'High-performance AP-15 device.',
      price: 14900,
      rating: 5,
    },
    {
      image: './OC-2120.png',
      name: 'OC-2120',
      description: 'Next-gen OC-2120 technology.',
      price: 9800,
      rating: 5,
    },
    {
      image: './FE-16.png',
      name: 'FE-16',
      description: 'Reliable FE-16 system.',
      price: 12900,
      rating: 5,
    },
    {
      image: './SE-22.png',
      name: 'SE-22',
      description: 'Secure and fast SE-22.',
      price: 49000,
      rating: 5,
    },
    {
      image: './AU-10.png',
      name: 'AU-10',
      description: 'AU-10 advanced solution.',
      price: 6500,
      rating: 5,
    },
    {
      image: './FOODPOS.png',
      name: 'FoodPOS',
      description: 'Smart POS system for restaurants.',
      price: 80000,
      rating: 5,
    },
  ];

  ngAfterViewInit() {
    this.updateVisibleItems();
    window.addEventListener('resize', this.updateVisibleItems.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateVisibleItems.bind(this));
  }

  updateVisibleItems() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1024) {
      this.visibleItems = 3;
    } else if (screenWidth >= 768) {
      this.visibleItems = 2;
    } else {
      this.visibleItems = 1;
    }
  }
}
