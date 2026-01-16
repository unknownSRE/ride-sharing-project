// src/app/services/rating.service.ts (No changes needed, but confirming it matches the backend)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private gqlUrl: string = 'http://localhost:3000/graphql';

  constructor(private http: HttpClient) {}

  addRating(input: any): Observable<any> {
    const mutation = `
      mutation AddRating($input: RatingInput!) {
        addRating(input: $input) {
          rating_id
          ride_id
          score
          comment
        }
      }
    `;
    return this.http.post<any>(this.gqlUrl, { query: mutation, variables: { input } });
  }

  getRatingsByUser(user_id: number): Observable<any> {
    const query = `
      query GetRatingsByUser($user_id: Int!) {
        getRatingsByUser(user_id: $user_id) {
          rating_id
          ride_id
          given_by
          score
          comment
        }
      }
    `;
    return this.http.post<any>(this.gqlUrl, { query, variables: { user_id } });
  }
}
