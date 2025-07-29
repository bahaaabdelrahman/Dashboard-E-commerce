import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:3000/api/v1/reviews';

  constructor(private http: HttpClient) {}

  getAllReviews(page = 1, limit = 20, sortOrder = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder);

    return this.http.get(`${this.baseUrl}/admin/all`, { params });
  }


  updateReviewStatus(reviewId: string, data: { status: string; adminNote: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reviewId}/status`, data);
  }
}
