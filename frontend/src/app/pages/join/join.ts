import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../directives/reveal.directive';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealDirective],
  templateUrl: './join.html',
  styleUrl: './join.css'
})
export class Join {
  isSubmitting = false;
  isSuccess = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) { }

  formData = {
    name: '',
    email: '',
    password: '',
    year: '',
    branch: '',
    interest: ''
  };

  onSubmit() {
    this.isSubmitting = true;
    this.errorMsg = '';

    const payload = {
      full_name: this.formData.name,
      email: this.formData.email,
      password: this.formData.password || 'Student@123' // Fallback if no UI field is present yet
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isSuccess = true;

        // Auto-login and navigate to dashboard after successful registration
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.errorMsg = err.error?.error || 'Failed to register. You may already have an account.';
        this.isSubmitting = false;
      }
    });
  }
}
