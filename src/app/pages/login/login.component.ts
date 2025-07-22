import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'الرجاء ملء جميع الحقول بشكل صحيح.';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.successMessage = '✅ تم تسجيل الدخول بنجاح!';
        setTimeout(() => {
          this.router.navigate(['/']); // أو 'dashboard'
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || '❌ حدث خطأ أثناء تسجيل الدخول.';
      }
    });
  }
}
