import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
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
  @ViewChild('videoModal') videoModal!: ElementRef;
  @ViewChild('productVideo') productVideo!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;
  @ViewChild('productModal') productModal!: ElementRef;
  @ViewChild('productModalContent') productModalContent!: ElementRef;

  currentIndex: number = 0;
  visibleItems: number = 1;
  selectedProduct: any = null;
  idleTimeout: any;
  idleTime = 30 * 1000;

  products = [
    {
      image: './AP-15.png',
      name: 'AP-15',
      description: 'High-performance AP-15 device.',
      price: 14900,
      rating: 5,
      features: [
        '300 Human Face Capacity',
        '1,000 Fingerprint Capacity',
        '1,000 ID Card Capacity',
        '1,000 Passcord Capacity',
        '100,000 Logs Capacity',
        '1 Year Warranty',
      ],
    },
    {
      image: './OC-2120.png',
      name: 'OC-2120',
      description: 'Next-gen OC-2120 technology.',
      price: 9800,
      rating: 5,
      features: [
        '1,000 Fingerprint Capacity',
        '1,000 ID Card Capacity',
        '1,000 Passcord Capacity',
        '100,000 Logs Capacity',
        '1 Year Warranty',
      ],
    },
    {
      image: './FE-16.png',
      name: 'FE-16',
      description: 'Reliable FE-16 system.',
      price: 12900,
      rating: 5,
      features: [
        '3,000 Human Face Capacity',
        '1,000 ID Card Capacity',
        '1,000 Passcord Capacity',
        '200,000 Logs Capacity',
        '1 Year Warranty',
      ],
    },
    {
      image: './SE-22.png',
      name: 'SE-22',
      description: 'Secure and fast SE-22.',
      price: 49000,
      rating: 5,
      features: [
        '50,000 Human Face Capacity',
        '50,000 ID Card Capacity',
        '500,000 Logs Capacity',
        '1 Year Warranty',
        '5 Concurrent People Face Recognition',
      ],
    },
    {
      image: './AU-10.png',
      name: 'AU-10',
      description: 'AU-10 advanced solution.',
      price: 6500,
      rating: 5,
      features: [
        'Automatic Card Feed and Release',
        'Up To 150 Employees Capacity',
        'Musical Alarm',
        'Backup Battery',
        '1 Year Warranty',
      ],
    },
    {
      image: './FOODPOS.png',
      name: 'FoodPOS',
      description: 'Smart POS system for restaurants.',
      price: 80000,
      rating: 5,
      features: [
        'Optimized for industrial use',
        'Secure encryption technology',
        'Cloud integration support',
      ],
    },
  ];

  ngAfterViewInit() {
    this.updateVisibleItems();
    window.addEventListener('resize', this.updateVisibleItems.bind(this));

    setTimeout(() => {
      this.openVideoModal();
    }, 1500);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateVisibleItems.bind(this));
    clearTimeout(this.idleTimeout);
    window.removeEventListener('mousemove', this.resetIdleTimer);
    window.removeEventListener('keydown', this.resetIdleTimer);
    window.removeEventListener('touchstart', this.resetIdleTimer);
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

  /** Opens the video modal */
  openVideoModal() {
    if (this.videoModal && this.productVideo) {
      this.videoModal.nativeElement.classList.remove('hidden', 'opacity-0');
      this.videoModal.nativeElement.classList.add('opacity-100');

      setTimeout(() => {
        this.productVideo.nativeElement.play();
      }, 300);
    }
  }

  /** Closes the video modal */
  closeVideoModal() {
    if (this.videoModal && this.productVideo) {
      this.productVideo.nativeElement.pause();
      this.productVideo.nativeElement.currentTime = 0;

      this.videoModal.nativeElement.classList.remove('opacity-100');
      this.videoModal.nativeElement.classList.add('opacity-0');

      setTimeout(() => {
        this.videoModal.nativeElement.classList.add('hidden');
        this.startIdleTimer(); // Restart idle timer after closing
      }, 500);
    }
  }

  /** Starts the idle timer */
  startIdleTimer() {
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.openVideoModal();
    }, this.idleTime);

    window.addEventListener('mousemove', this.resetIdleTimer);
    window.addEventListener('keydown', this.resetIdleTimer);
    window.addEventListener('touchstart', this.resetIdleTimer);
  }

  /** Resets the idle timer if user interacts with the page */
  resetIdleTimer = () => {
    clearTimeout(this.idleTimeout);
    this.startIdleTimer();
  };

  /** Closes modal if user clicks outside the video */
  closeVideoModalOutside(event: Event) {
    if (
      this.videoModal &&
      this.modalContent &&
      !this.modalContent.nativeElement.contains(event.target)
    ) {
      this.closeVideoModal();
    }
  }

  /** Opens the product details modal with fade-in animation */
  openProductModal(product: any) {
    this.selectedProduct = product;

    setTimeout(() => {
      if (this.productModal && this.productModalContent) {
        this.productModal.nativeElement.classList.remove('hidden', 'opacity-0');
        this.productModal.nativeElement.classList.add('opacity-100');

        this.productModalContent.nativeElement.classList.remove(
          'scale-90',
          'opacity-0'
        );
        this.productModalContent.nativeElement.classList.add(
          'scale-100',
          'opacity-100'
        );
      }
    }, 50);
  }

  /** Closes the product details modal with fade-out effect */
  closeProductModal() {
    if (this.productModal && this.productModalContent) {
      this.productModal.nativeElement.classList.remove('opacity-100');
      this.productModal.nativeElement.classList.add('opacity-0');

      this.productModalContent.nativeElement.classList.remove(
        'scale-100',
        'opacity-100'
      );
      this.productModalContent.nativeElement.classList.add(
        'scale-90',
        'opacity-0'
      );

      setTimeout(() => {
        this.productModal.nativeElement.classList.add('hidden');
        this.selectedProduct = null; // Clear selected product
      }, 500); // Matches fade-out duration
    }
  }

  /** Closes modal when clicking outside the content */
  closeProductModalOutside(event: Event) {
    if (
      this.productModal &&
      this.productModalContent &&
      !this.productModalContent.nativeElement.contains(event.target)
    ) {
      this.closeProductModal();
    }
  }
}
