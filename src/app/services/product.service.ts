import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:5000/api/products'; // عدّل هذا حسب سيرفرك

  constructor(private http: HttpClient) {}

  addProduct(productData: any): Observable<any> {
    return this.http.post(this.apiUrl, productData);
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updatedData);
  }
}
