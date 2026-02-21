import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../directives/reveal.directive';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

const COLLEGE_EMAIL_DOMAIN = '@srit.ac.in';

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
  emailError = '';

  constructor(private authService: AuthService, private router: Router) { }

  formData = {
    name: '',
    email: '',
    password: '',
    year: '',
    branch: '',
    interest: ''
  };

  validateEmail(): boolean {
    const email = this.formData.email.toLowerCase().trim();
    if (!email.endsWith(COLLEGE_EMAIL_DOMAIN)) {
      this.emailError = `Only SRIT college emails are allowed (e.g. yourname${COLLEGE_EMAIL_DOMAIN})`;
      return false;
    }
    this.emailError = '';
    return true;
  }

  onEmailChange() {
    if (this.formData.email) {
      this.validateEmail();
    } else {
      this.emailError = '';
    }
  }

  onSubmit() {
    this.errorMsg = '';

    // College email check
    if (!this.validateEmail()) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      full_name: this.formData.name,
      email: this.formData.email.toLowerCase().trim(),
      password: this.formData.password,
      year: this.formData.year,
      branch: this.formData.branch,
      interest: this.formData.interest
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        // Do NOT auto-redirect — student is pending approval
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.errorMsg = err.error?.error || 'Failed to register. You may already have an account.';
        this.isSubmitting = false;
      }
    });
  }
}
