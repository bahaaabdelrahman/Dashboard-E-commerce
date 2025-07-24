import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/v1/categories';

  constructor(private http: HttpClient) {}


  createCategory(categoryData: any): Observable<any> {
    return this.http.post(this.apiUrl, categoryData);
  }


  getCategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }


  getCategoryHierarchy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hierarchy`);
  }


  getCategoriesByLevel(level: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/level/${level}`);
  }


  updateCategory(id: string | number, categoryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoryData);
  }


  deleteCategory(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  uploadCategoryImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(`${this.apiUrl}/${id}/image`, formData);
  }

  deleteCategoryImage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/image`);
  }

  bulkUpdateCategories(payload: { categoryIds: string[], updates: any }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-update`, payload);
  }





}
