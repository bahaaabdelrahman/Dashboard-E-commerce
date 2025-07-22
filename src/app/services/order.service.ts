import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:3000/api/v1/orders'; 

  constructor(private http: HttpClient) {}


getAllOrders(): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl);
}


  getOrderById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<{ data: any }>(url).pipe(
      map(response => response.data)
    );
  }


  updateOrderStatus(id: string, status: string): Observable<any> {

    const url = `${this.apiUrl}/${id}`;
    const body = { status: status };
    return this.http.patch(url, body);

  }


}
