import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        // Successful login, navigate to appropriate dashboard based on role
        if (res.user.role === 'super_admin') {
          this.router.navigate(['/admin']);
        } else if (res.user.role === 'team_member') {
          this.router.navigate(['/team-dashboard']);
        } else {
          this.router.navigate(['/dashboard']); // Student Dashboard
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.error?.error || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
