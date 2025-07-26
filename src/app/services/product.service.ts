import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/v1/products';

  constructor(private http: HttpClient) {}

  addProduct(productData: any): Observable<any> {
    return this.http.post(this.apiUrl, productData);
  }

  getAllProducts(): Observable<any[]> {
    const params = new HttpParams().set('status', '');
    return this.http.get<{ data: any[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updatedData);
  }


  uploadProductImage(productId: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('images', image);
    return this.http.post(`${this.apiUrl}/${productId}/images`, formData);
  }


  deleteProductImage(productId: string, imageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}/images/${imageId}`);
  }


  setPrimaryImage(productId: string, imageId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}/images/${imageId}/primary`, {});
  }


  bulkUpdateProducts(productIds: string[], updates: any): Observable<any> {
    const body = {
      productIds,
      updates
    };
    return this.http.patch(`${this.apiUrl}/bulk-update`, body);
  }


  bulkDeleteProducts(productIds: string[]): Observable<any> {
    const body = {
      productIds
    };
    return this.http.patch(`${this.apiUrl}/bulk-delete`, body);
  }


  updateProductInventory(productId: string, inventoryData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${productId}/inventory`, inventoryData);
  }
}
