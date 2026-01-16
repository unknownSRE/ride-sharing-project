// src/app/components/rating/rating.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rating } from '../../models/rating.model';
import { RatingService } from '../../services/rating-service';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating.html',
  styleUrls: ['./rating.css'],
})
export class RatingComponent {
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  newRating: {
    ride_id: number | null;
    given_to: number | null;
    score: number | null;
    comment: string;
  } = { ride_id: null, given_to: null, score: null, comment: '' };
  ratings: Rating[] = [];
  currentUser: any = { user_id: 1 };

  constructor(private ratingService: RatingService) {}

  openAddRatingModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newRating = { ride_id: null, given_to: null, score: null, comment: '' };
  }

  openViewRatingsModal(): void {
    this.loadRatings();
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
  }

  submitRating(): void {
    const rideId = Number(this.newRating.ride_id);
    const givenTo = Number(this.newRating.given_to);
    const score = Number(this.newRating.score);

    if (
      isNaN(rideId) ||
      rideId <= 0 ||
      isNaN(givenTo) ||
      givenTo <= 0 ||
      isNaN(score) ||
      score < 1 ||
      score > 5
    ) {
      alert('Valid Ride ID, User ID to Rate (positive integers), and Rating (1-5) are required.');
      return;
    }

    const input = {
      ride_id: rideId,
      given_by: this.currentUser.user_id,
      given_to: givenTo,
      score: score,
      comment: this.newRating.comment || null,
    };

    this.ratingService.addRating(input).subscribe({
      next: (response) => {
        if (response.data) {
          alert('Rating submitted successfully!');
          this.closeAddModal();
        } else if (response.errors) {
          alert(`Error: ${response.errors[0].message}`);
        }
      },
      error: (err) => {
        alert(`Error: ${err.message}`);
      },
    });
  }

  private loadRatings(): void {
    this.ratingService.getRatingsByUser(this.currentUser.user_id).subscribe({
      next: (response) => {
        if (response.data) {
          this.ratings = response.data.getRatingsByUser || [];
        } else if (response.errors) {
          this.ratings = [];
          alert(`Error: ${response.errors[0].message}`);
        }
      },
      error: (err) => {
        this.ratings = [];
        alert(`Error: ${err.message}`);
      },
    });
  }
}
