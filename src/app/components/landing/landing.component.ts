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
  idleTime = 15 * 1000;

  products = [
    {
      image: './AP-15.png',
      name: 'AP-15',
      description: 'High-performance AP-15 device.',
      price: 14900,
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

    this.startIdleTimer();
    this.openVideoModal(); // Show screen saver video on page load
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
    this.visibleItems = screenWidth >= 1024 ? 3 : screenWidth >= 768 ? 2 : 1;
  }

  /** Opens the video modal (Screen Saver Mode) */
  openVideoModal() {
    if (this.videoModal && this.productVideo) {
      this.videoModal.nativeElement.classList.remove('hidden', 'opacity-0');
      this.videoModal.nativeElement.classList.add('opacity-100');

      setTimeout(() => {
        this.productVideo.nativeElement.muted = true; // Ensure muted for autoplay
        this.productVideo.nativeElement.play();
      }, 300);
    }
  }

  /** Closes the video modal when user interacts */
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

  /** Resets the idle timer if user interacts */
  resetIdleTimer = () => {
    clearTimeout(this.idleTimeout);
    this.startIdleTimer();
  };

  /** Detects user activity and closes the video */
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:touchstart')
  closeModalOnInteraction() {
    if (this.videoModal.nativeElement.classList.contains('opacity-100')) {
      this.closeVideoModal();
    }
  }

  /** Opens the product details modal */
  openProductModal(product: any) {
    this.selectedProduct = product;

    if (this.productModal && this.productModalContent) {
      // Reset modal before applying fade-in
      this.productModal.nativeElement.classList.add('hidden', 'opacity-0');
      this.productModalContent.nativeElement.classList.add(
        'scale-90',
        'opacity-0'
      );

      // Allow the reset to apply, then trigger the animation
      requestAnimationFrame(() => {
        this.productModal.nativeElement.classList.remove('hidden');
        setTimeout(() => {
          this.productModal.nativeElement.classList.add('opacity-100');
          this.productModal.nativeElement.classList.remove('opacity-0');

          this.productModalContent.nativeElement.classList.add(
            'scale-100',
            'opacity-100'
          );
          this.productModalContent.nativeElement.classList.remove(
            'scale-90',
            'opacity-0'
          );
        }, 50);
      });
    }
  }

  /** Moves to the next product */
  nextProduct() {
    const currentIndex = this.products.findIndex(
      (p) => p.name === this.selectedProduct.name
    );
    const nextIndex = (currentIndex + 1) % this.products.length; // Loop back to first product
    this.selectedProduct = this.products[nextIndex];
  }

  /** Moves to the previous product */
  prevProduct() {
    const currentIndex = this.products.findIndex(
      (p) => p.name === this.selectedProduct.name
    );
    const prevIndex =
      (currentIndex - 1 + this.products.length) % this.products.length; // Loop back to last product
    this.selectedProduct = this.products[prevIndex];
  }

  /** Closes the product details modal */
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
        this.selectedProduct = null;
      }, 500);
    }
  }

  /** Closes modal when clicking outside */
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
