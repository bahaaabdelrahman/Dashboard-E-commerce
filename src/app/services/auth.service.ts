
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl =  'http://localhost:3000/api/v1/auth';

  constructor(private http: HttpClient) {}

login(credentials: { email: string, password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
    tap((res: any) => {
      const token = res?.data?.tokens?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ Token saved:', token);
      } else {
        console.warn(' لم يتم العثور على accessToken في الاستجابة');
      }
    })
  );
}




  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

}
