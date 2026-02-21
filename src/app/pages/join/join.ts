import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../directives/reveal.directive';

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

  formData = {
    name: '',
    email: '',
    year: '',
    branch: '',
    interest: ''
  };

  onSubmit() {
    this.isSubmitting = true;

    // Simulate async API call (later this will be Supabase)
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSuccess = true;
    }, 1400);
  }
}
