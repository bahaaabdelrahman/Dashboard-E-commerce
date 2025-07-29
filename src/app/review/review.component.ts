import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
  standalone: false
})
export class ReviewComponent implements OnInit {
  currentDate: string = '';
  reviews: any[] = [];
  loading = false;
  error = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadReviews();
  }

  setCurrentDate(): void {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getAllReviews().subscribe({
      next: (res) => {
        this.reviews = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews.';
        this.loading = false;
      }
    });
  }

  updateStatus(reviewId: string, status: string): void {
    const note = prompt(`Enter admin note for status "${status}":`) || '';
    this.reviewService.updateReviewStatus(reviewId, { status, adminNote: note }).subscribe({
      next: () => {
        alert('Review status updated successfully.');
        this.loadReviews();
      },
      error: () => {
        alert('Failed to update review status.');
      }
    });
  }
}
